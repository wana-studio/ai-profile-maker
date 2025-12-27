import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { db, users } from '@/lib/db';
import { eq } from 'drizzle-orm';

async function syncUser() {
    try {
        const user = await currentUser();

        if (!user) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const primaryEmail = user.emailAddresses.find(
            e => e.id === user.primaryEmailAddressId
        );

        // Upsert user to database
        const existingUser = await db.query.users.findFirst({
            where: eq(users.id, user.id),
        });

        if (existingUser) {
            await db.update(users)
                .set({
                    email: primaryEmail?.emailAddress || '',
                    firstName: user.firstName || null,
                    lastName: user.lastName || null,
                    imageUrl: user.imageUrl || null,
                    updatedAt: new Date(),
                })
                .where(eq(users.id, user.id));
        } else {
            await db.insert(users).values({
                id: user.id,
                email: primaryEmail?.emailAddress || '',
                firstName: user.firstName || null,
                lastName: user.lastName || null,
                imageUrl: user.imageUrl || null,
            });
        }

        return NextResponse.json({
            success: true,
            message: 'User synced successfully',
            user: {
                id: user.id,
                email: primaryEmail?.emailAddress,
                name: `${user.firstName} ${user.lastName}`,
            }
        });
    } catch (error) {
        console.error('User sync error:', error);
        return NextResponse.json({ error: 'Sync failed' }, { status: 500 });
    }
}

// Support both GET and POST
export async function GET() {
    return syncUser();
}

export async function POST() {
    return syncUser();
}
