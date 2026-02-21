import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db, users } from '@/lib/db';
import { eq } from 'drizzle-orm';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-12-15.clover',
});

export async function POST(req: Request) {
    try {
        const { userId } = await auth();
        const { priceId } = await req.json().catch(() => ({ priceId: null }));

        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const effectivePriceId = priceId || process.env.STRIPE_PRO_PRICE_ID;

        if (!effectivePriceId) {
            console.error('STRIPE_PRO_PRICE_ID is not configured');
            return NextResponse.json(
                { error: 'Subscription not configured' },
                { status: 500 }
            );
        }

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

        // Check if user already has a Stripe Customer ID
        const dbUser = await db.query.users.findFirst({
            where: eq(users.id, userId),
        });

        let customerId = dbUser?.stripeCustomerId;

        // Create Stripe Checkout session
        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card'],
            customer: customerId || undefined,
            line_items: [
                {
                    price: effectivePriceId,
                    quantity: 1,
                },
            ],
            success_url: `${appUrl}/app/profile?success=true`,
            cancel_url: `${appUrl}/app/profile?canceled=true`,
            metadata: {
                userId,
            },
            subscription_data: {
                metadata: {
                    userId,
                },
            },
            ...(customerId ? {} : {
                customer_email: dbUser?.email,
            }),
        });

        return NextResponse.json({ url: session.url });
    } catch (error) {
        console.error('Error creating checkout session:', error);
        return NextResponse.json(
            { error: 'Failed to create checkout session' },
            { status: 500 }
        );
    }
}
