import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import Replicate from 'replicate';
import { db, generatedPhotos, users, faceProfiles, styles } from '@/lib/db';
import { eq, sql } from 'drizzle-orm';
import { uploadToS3, downloadImage } from '@/lib/s3';

const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { faceProfileId, styleId, energyLevel, realismLevel, options } = body;

        // Get user
        const user = await db.query.users.findFirst({
            where: eq(users.id, userId),
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Check generation limits for free users
        if (user.subscriptionTier === 'free') {
            if (user.generationsThisMonth >= 3) {
                return NextResponse.json({
                    error: 'Generation limit reached',
                    upgrade: true
                }, { status: 403 });
            }
        }

        // Get face profile
        const faceProfile = await db.query.faceProfiles.findFirst({
            where: eq(faceProfiles.id, faceProfileId),
        });

        if (!faceProfile) {
            return NextResponse.json({ error: 'Face profile not found' }, { status: 404 });
        }

        // Get style
        const style = await db.query.styles.findFirst({
            where: eq(styles.id, styleId),
        });

        if (!style) {
            return NextResponse.json({ error: 'Style not found' }, { status: 404 });
        }

        // Check if style is premium and user is free
        if (style.isPremium && user.subscriptionTier === 'free') {
            return NextResponse.json({
                error: 'Premium style requires Pro subscription',
                upgrade: true
            }, { status: 403 });
        }

        // Build the generation prompt
        const energyDescriptor = energyLevel < 33 ? 'soft, gentle' : energyLevel < 66 ? 'balanced, natural' : 'bold, confident';
        const realismDescriptors: Record<string, string> = {
            natural: 'maintaining exact facial features',
            enhanced: 'with subtle enhancements',
            hot: 'with attractive enhancements',
            glowup: 'with significant beautification',
        };
        const realismDescriptor = realismDescriptors[realismLevel as string] || '';

        let prompt = `${style.prompt}, ${energyDescriptor}, ${realismDescriptor}`;

        // Add optional modifiers
        if (options?.changeOutfit) prompt += ', wearing stylish modern outfit';
        if (options?.changeHairstyle) prompt += ', with trendy hairstyle';
        if (options?.addGlasses) prompt += ', wearing fashionable glasses';
        if (options?.addBeard) prompt += ', with well-groomed beard';

        // Run generation on Replicate
        // Using a placeholder model - replace with actual face-swap/enhancement model
        const output = await replicate.run(
            'openai/gpt-image-1.5',
            {
                input: {
                    input_images: [faceProfile.imageUrl],
                    prompt: prompt,
                    aspect_ratio: '3:2',
                    quality: "medium"
                },
            }
        );

        const replicateImageUrl = (Array.isArray(output) ? output[0] : output).url();

        // Download image from Replicate and upload to R2
        const { buffer, contentType } = await downloadImage(replicateImageUrl);
        const imageUrl = await uploadToS3({
            buffer,
            contentType,
            folder: `generated/${userId}`,
            filename: `${Date.now()}-${styleId}.jpg`,
        });

        // Generate stats (mock - replace with actual AI analysis)
        const stats = {
            formal: Math.floor(Math.random() * 40) + (style.category === 'work' ? 50 : 10),
            spicy: Math.floor(Math.random() * 40) + (style.category === 'dating' ? 50 : 20),
            cool: Math.floor(Math.random() * 40) + 40,
            trustworthy: Math.floor(Math.random() * 30) + 50,
            mysterious: Math.floor(Math.random() * 40) + (style.category === 'anonymous' ? 50 : 20),
        };

        // Generate insights (mock - replace with actual AI analysis)
        const insights = [
            `Energy level ${energyLevel > 50 ? 'projects confidence' : 'feels approachable'}`,
            `${style.name} style enhances your look`,
            `Great for ${style.category} profiles`,
        ];

        // Save to database
        const [photo] = await db.insert(generatedPhotos).values({
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
            isWatermarked: user.subscriptionTier === 'free',
            generationPrompt: prompt,
        }).returning();

        // Increment generation count for free users
        if (user.subscriptionTier === 'free') {
            await db.update(users)
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
        console.error('Generation error:', error);
        return NextResponse.json({ error: 'Generation failed' }, { status: 500 });
    }
}
