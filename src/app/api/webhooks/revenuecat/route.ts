import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { db, users, subscriptions } from '@/lib/db';
import { eq } from 'drizzle-orm';

// RevenueCat Webhook Events
// https://www.revenuecat.com/docs/integrations/webhooks/event-types

export async function POST(req: Request) {
    try {
        const headersList = await headers();
        const authHeader = headersList.get('Authorization');

        // Simple authorization check
        // You should set this secret in your RevenueCat dashboard headers
        if (authHeader !== process.env.REVENUECAT_WEBHOOK_SECRET) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const body = await req.json();
        const { event } = body;

        if (!event) {
            return new NextResponse('Invalid payload', { status: 400 });
        }

        const {
            type,
            app_user_id: userId,
            product_id: productId,
            expiration_at_ms: expirationAtMs,
            purchased_at_ms: purchasedAtMs,
            original_transaction_id: originalTransactionId,
            store,
        } = event;

        // Map RevenueCat events to our logic
        // INITIAL_PURCHASE, RENEWAL, PRODUCT_CHANGE -> Pro
        // CANCELLATION, EXPIRATION -> Free (eventually)

        const isProEvent = [
            'INITIAL_PURCHASE',
            'RENEWAL',
            'PRODUCT_CHANGE',
            'UNCANCELLATION'
        ].includes(type);

        const isExpirationEvent = [
            'EXPIRATION',
            'CANCELLATION' // Note: Cancellation just means auto-renew is off, not immediate loss of access usually, but RC sends EXPIRATION when it actually ends.
        ].includes(type);

        if (isProEvent) {
            // Update user to Pro
            await db.update(users)
                .set({
                    subscriptionTier: 'pro',
                    updatedAt: new Date(),
                })
                .where(eq(users.id, userId));

            // Upsert subscription record
            const expiresAt = new Date(expirationAtMs);
            const startedAt = new Date(purchasedAtMs);

            await db.insert(subscriptions)
                .values({
                    userId,
                    iapOriginalTransactionId: originalTransactionId,
                    iapPlatform: store,
                    status: 'active',
                    currentPeriodStart: startedAt,
                    currentPeriodEnd: expiresAt,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                })
                .onConflictDoUpdate({
                    target: subscriptions.userId,
                    set: {
                        status: 'active',
                        iapOriginalTransactionId: originalTransactionId, // In case it wasn't there
                        currentPeriodStart: startedAt,
                        currentPeriodEnd: expiresAt,
                        updatedAt: new Date(),
                    },
                });

        } else if (type === 'EXPIRATION') {
            // Downgrade to Free
            await db.update(users)
                .set({
                    subscriptionTier: 'free',
                    updatedAt: new Date(),
                })
                .where(eq(users.id, userId));

            // Update subscription status
            await db.update(subscriptions)
                .set({
                    status: 'canceled', // or expired
                    updatedAt: new Date(),
                })
                .where(eq(subscriptions.userId, userId));
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error processing RevenueCat webhook:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
