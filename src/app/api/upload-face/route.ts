import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db, faceProfiles } from '@/lib/db';
import { uploadToS3 } from '@/lib/s3';

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get('file') as File;
        const name = formData.get('name') as string;
        const isDefault = formData.get('isDefault') === 'true';

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // Upload to R2 storage
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const imageUrl = await uploadToS3({
            buffer,
            contentType: file.type,
            folder: `faces/${userId}`,
            filename: `${Date.now()}-${file.name}`,
        });

        // Create face profile in database
        const [profile] = await db.insert(faceProfiles).values({
            userId,
            name: name || 'My Face',
            imageUrl: imageUrl,
            thumbnailUrl: null,
            isDefault: isDefault,
        }).returning();

        return NextResponse.json({
            success: true,
            profile,
        });

    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}
