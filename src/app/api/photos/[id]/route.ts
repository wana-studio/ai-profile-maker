import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db, generatedPhotos } from "@/lib/db";
import { eq, and } from "drizzle-orm";
import { deleteFromS3 } from "@/lib/s3";

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth();
        const { id } = await params;

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Find photo and verify ownership
        const photo = await db.query.generatedPhotos.findFirst({
            where: and(
                eq(generatedPhotos.id, id),
                eq(generatedPhotos.userId, userId)
            ),
        });

        if (!photo) {
            return NextResponse.json(
                { error: "Photo not found or unauthorized" },
                { status: 404 }
            );
        }

        // Delete from storage
        if (photo.imageUrl) {
            await deleteFromS3(photo.imageUrl);
        }

        // Delete from database
        await db
            .delete(generatedPhotos)
            .where(and(
                eq(generatedPhotos.id, id),
                eq(generatedPhotos.userId, userId)
            ));

        return NextResponse.json({
            success: true,
            message: "Photo deleted successfully",
        });
    } catch (error) {
        console.error("Delete photo error:", error);
        return NextResponse.json(
            { error: "Failed to delete photo" },
            { status: 500 }
        );
    }
}
