import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db, faceProfiles } from '@/lib/db';
import { eq } from 'drizzle-orm';

export async function GET() {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const profiles = await db.query.faceProfiles.findMany({
            where: eq(faceProfiles.userId, userId),
            orderBy: (faceProfiles, { desc }) => [desc(faceProfiles.createdAt)],
        });

        return NextResponse.json({ profiles });
    } catch (error) {
        console.error('Error fetching face profiles:', error);
        return NextResponse.json({ error: 'Failed to fetch profiles' }, { status: 500 });
    }
}
