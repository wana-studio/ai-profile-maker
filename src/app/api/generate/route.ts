import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import Replicate from "replicate";
import { db, generatedPhotos, users, faceProfiles, styles } from "@/lib/db";
import { eq, sql } from "drizzle-orm";
import { uploadToS3, downloadImage } from "@/lib/s3";
import { analyzeGeneratedPhoto } from "@/lib/ai-analysis";

const baseContextPrompt =
  "Use the uploaded user photo as the primary identity reference. Preserve the person’s facial structure, skin tone, age, gender expression, and ethnicity accurately. Maintain photorealism. The final image must look like a high-end real photograph, not AI-generated.";
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { faceProfileId, styleId, energyLevel, realismLevel, options } = body;

    // Get user
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check generation limits for free users
    if (user.subscriptionTier === "free") {
      if (user.generationsThisMonth >= 3) {
        return NextResponse.json(
          {
            error: "Generation limit reached",
            upgrade: true,
          },
          { status: 403 }
        );
      }
    }

    // Get face profile
    const faceProfile = await db.query.faceProfiles.findFirst({
      where: eq(faceProfiles.id, faceProfileId),
    });

    if (!faceProfile) {
      return NextResponse.json(
        { error: "Face profile not found" },
        { status: 404 }
      );
    }

    // Get style
    const style = await db.query.styles.findFirst({
      where: eq(styles.id, styleId),
    });

    if (!style) {
      return NextResponse.json({ error: "Style not found" }, { status: 404 });
    }

    // Check if style is premium and user is free
    if (style.isPremium && user.subscriptionTier === "free") {
      return NextResponse.json(
        {
          error: "Premium style requires Pro subscription",
          upgrade: true,
        },
        { status: 403 }
      );
    }

    // Build the generation prompt
    const realismDescriptors: Record<string, string> = {
      natural:
        "maintaining exact facial features. Do not beautify unrealistically. No face distortion",
      enhanced: "Apply subtle enhancements but keep the face structure intact",
      hot: "Apply attractive enhancements and make the person hotter, without making significant facial changes",
      glowup: "Apply significant beautification",
    };
    const realismDescriptor = realismDescriptors[realismLevel as string] || "";

    let prompt = `INSTRUCTION: ${baseContextPrompt}\nREALISM: ${realismDescriptor}\nIMAGE STYLE: ${style.prompt}`;

    // Add optional modifiers
    if (options?.changeHairstyle) prompt += `\nHAIRSTYLE: ${options.hairStyle}`;
    if (options?.addGlasses)
      prompt += `\nGLASSES: ${options.glasses || "sun glasses"}`;
    // Run generation on Replicate
    // Using a placeholder model - replace with actual face-swap/enhancement model
    const output = await replicate.run("openai/gpt-image-1.5", {
      input: {
        input_images: [faceProfile.imageUrl],
        prompt: prompt,
        aspect_ratio: options.aspectRatio || "3:2",
        quality: "medium",
      },
    });

    const replicateImageUrl = (
      Array.isArray(output) ? output[0] : output
    ).url();

    // Download image from Replicate and upload to R2
    const { buffer, contentType } = await downloadImage(replicateImageUrl);
    const imageUrl = await uploadToS3({
      buffer,
      contentType,
      folder: `generated/${userId}`,
      filename: `${Date.now()}-${styleId}.jpg`,
    });

    // Generate stats and insights using AI analysis
    const analysis = await analyzeGeneratedPhoto(
      imageUrl as string,
      style.category,
      style.name,
      realismLevel
    );

    const stats = analysis.stats;
    const insights = analysis.insights;

    // Save to database
    const [photo] = await db
      .insert(generatedPhotos)
      .values({
        userId,
        faceProfileId,
        styleId,
        imageUrl: imageUrl as string,
        title: `${style.name} Look`,
        category: style.category,
        energyLevel,
        realismLevel,
        stats,
        insights,
        isWatermarked: user.subscriptionTier === "free",
        generationPrompt: prompt,
      })
      .returning();

    // Increment generation count for free users
    if (user.subscriptionTier === "free") {
      await db
        .update(users)
        .set({
          generationsThisMonth: sql`${users.generationsThisMonth} + 1`,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));
    }

    return NextResponse.json({
      success: true,
      photo,
    });
  } catch (error) {
    console.error("Generation error:", error);
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}
