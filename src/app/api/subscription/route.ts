import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { db, users } from '@/lib/db';
import { eq } from 'drizzle-orm';

export async function GET() {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const user = await db.query.users.findFirst({
            where: eq(users.id, userId),
        });

        if (!user) {
            return NextResponse.json({
                tier: 'free',
                generationsRemaining: 5,
            });
        }

        // For pro users, they have unlimited generations
        // For free users, calculate remaining from monthly limit (5)
        const FREE_MONTHLY_LIMIT = 5;
        const generationsRemaining = user.subscriptionTier === 'pro'
            ? Infinity
            : Math.max(0, FREE_MONTHLY_LIMIT - (user.generationsThisMonth || 0));

        return NextResponse.json({
            tier: user.subscriptionTier,
            generationsRemaining,
            generationsThisMonth: user.generationsThisMonth,
        });
    } catch (error) {
        console.error('Error fetching subscription:', error);
        return NextResponse.json(
            { error: 'Failed to fetch subscription' },
            { status: 500 }
        );
    }
}
