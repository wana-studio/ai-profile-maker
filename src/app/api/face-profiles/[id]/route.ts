import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db, faceProfiles } from "@/lib/db";
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

        // Find face profile and verify ownership
        const profile = await db.query.faceProfiles.findFirst({
            where: and(
                eq(faceProfiles.id, id),
                eq(faceProfiles.userId, userId)
            ),
        });

        if (!profile) {
            return NextResponse.json(
                { error: "Face profile not found or unauthorized" },
                { status: 404 }
            );
        }

        // Delete from storage
        if (profile.imageUrl) {
            await deleteFromS3(profile.imageUrl);
        }

        // Delete from database
        await db
            .delete(faceProfiles)
            .where(and(
                eq(faceProfiles.id, id),
                eq(faceProfiles.userId, userId)
            ));

        return NextResponse.json({
            success: true,
            message: "Face profile deleted successfully",
        });
    } catch (error) {
        console.error("Delete face profile error:", error);
        return NextResponse.json(
            { error: "Failed to delete face profile" },
            { status: 500 }
        );
    }
}
