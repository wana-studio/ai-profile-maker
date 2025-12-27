import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-12-15.clover',
});

export async function POST() {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const priceId = process.env.STRIPE_PRO_PRICE_ID;
        if (!priceId) {
            console.error('STRIPE_PRO_PRICE_ID is not configured');
            return NextResponse.json(
                { error: 'Subscription not configured' },
                { status: 500 }
            );
        }

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

        // Create Stripe Checkout session
        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            success_url: `${appUrl}/profile?success=true`,
            cancel_url: `${appUrl}/profile?canceled=true`,
            metadata: {
                userId,
            },
            subscription_data: {
                metadata: {
                    userId,
                },
                trial_period_days: 7, // 7-day free trial
            },
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
