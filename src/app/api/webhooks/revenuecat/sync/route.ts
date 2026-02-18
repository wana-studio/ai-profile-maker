import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { db, users } from '@/lib/db';
import { eq } from 'drizzle-orm';

export async function POST(req: Request) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await req.json();
        const { appUserId, isPro } = body;

        // In a real production setup, we should use the RevenueCat verifyReceipt or subscribers endpoint 
        // to confirm this status server-side instead of trusting the client blindly.
        // For MVP, if the client SDK says they have the entitlement, we trust it.

        if (isPro) {
            await db.update(users)
                .set({
                    subscriptionTier: 'pro',
                    updatedAt: new Date(),
                    // Optionally store appUserId if we want to link RC user -> DB user
                })
                .where(eq(users.id, userId));

            return NextResponse.json({ success: true });
        } else {
            // Handle downgrade or check status
            return NextResponse.json({ success: true, message: 'No pro entitlement detected' });
        }
    } catch (error) {
        console.error('Error syncing RevenueCat status:', error);
        return NextResponse.json(
            { error: 'Failed to sync status' },
            { status: 500 }
        );
    }
}
