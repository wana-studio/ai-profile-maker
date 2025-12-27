import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db, generatedPhotos } from '@/lib/db';
import { eq, desc } from 'drizzle-orm';

export async function GET() {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const photos = await db.query.generatedPhotos.findMany({
            where: eq(generatedPhotos.userId, userId),
            orderBy: [desc(generatedPhotos.createdAt)],
        });

        return NextResponse.json({ photos });
    } catch (error) {
        console.error('Error fetching photos:', error);
        return NextResponse.json({ error: 'Failed to fetch photos' }, { status: 500 });
    }
}
