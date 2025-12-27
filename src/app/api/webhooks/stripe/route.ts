import { headers } from 'next/headers';
import Stripe from 'stripe';
import { db, users, subscriptions } from '@/lib/db';
import { eq } from 'drizzle-orm';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-12-15.clover',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature')!;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
        console.error('Webhook signature verification failed:', err);
        return new Response('Webhook signature verification failed', { status: 400 });
    }

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                const userId = session.metadata?.userId;
                const subscriptionId = session.subscription as string;

                if (userId && subscriptionId) {
                    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

                    // Update user to pro
                    await db.update(users)
                        .set({
                            subscriptionTier: 'pro',
                            stripeCustomerId: session.customer as string,
                            updatedAt: new Date(),
                        })
                        .where(eq(users.id, userId));

                    // Create or update subscription record (upsert)
                    const subscriptionItem = subscription.items.data[0];
                    await db.insert(subscriptions)
                        .values({
                            userId,
                            stripeSubscriptionId: subscriptionId,
                            stripePriceId: subscriptionItem.price.id,
                            status: 'active',
                            currentPeriodStart: new Date(subscriptionItem.current_period_start * 1000),
                            currentPeriodEnd: new Date(subscriptionItem.current_period_end * 1000),
                        })
                        .onConflictDoUpdate({
                            target: subscriptions.userId,
                            set: {
                                stripeSubscriptionId: subscriptionId,
                                stripePriceId: subscriptionItem.price.id,
                                status: 'active',
                                currentPeriodStart: new Date(subscriptionItem.current_period_start * 1000),
                                currentPeriodEnd: new Date(subscriptionItem.current_period_end * 1000),
                                updatedAt: new Date(),
                            },
                        });
                }
                break;
            }

            case 'customer.subscription.updated': {
                const subscription = event.data.object as Stripe.Subscription;
                const subscriptionItem = subscription.items.data[0];

                await db.update(subscriptions)
                    .set({
                        status: subscription.status as 'active' | 'canceled' | 'past_due' | 'incomplete',
                        currentPeriodStart: new Date(subscriptionItem.current_period_start * 1000),
                        currentPeriodEnd: new Date(subscriptionItem.current_period_end * 1000),
                        cancelAtPeriodEnd: subscription.cancel_at_period_end,
                        updatedAt: new Date(),
                    })
                    .where(eq(subscriptions.stripeSubscriptionId, subscription.id));
                break;
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object as Stripe.Subscription;

                // Update subscription status
                await db.update(subscriptions)
                    .set({
                        status: 'canceled',
                        updatedAt: new Date(),
                    })
                    .where(eq(subscriptions.stripeSubscriptionId, subscription.id));

                // Downgrade user
                const sub = await db.query.subscriptions.findFirst({
                    where: eq(subscriptions.stripeSubscriptionId, subscription.id),
                });

                if (sub) {
                    await db.update(users)
                        .set({
                            subscriptionTier: 'free',
                            updatedAt: new Date(),
                        })
                        .where(eq(users.id, sub.userId));
                }
                break;
            }

            case 'invoice.payment_failed': {
                const invoice = event.data.object as Stripe.Invoice;
                const subscriptionId = invoice.parent?.subscription_details?.subscription as string | undefined;

                if (subscriptionId) {
                    await db.update(subscriptions)
                        .set({
                            status: 'past_due',
                            updatedAt: new Date(),
                        })
                        .where(eq(subscriptions.stripeSubscriptionId, subscriptionId));
                }
                break;
            }
        }
    } catch (err) {
        console.error('Error processing webhook:', err);
        return new Response('Webhook handler failed', { status: 500 });
    }

    return new Response('Webhook processed', { status: 200 });
}
