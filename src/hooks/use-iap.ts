import { useEffect, useState, useCallback, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { toast } from 'sonner';
import { useSubscriptionStore } from '@/lib/stores';

// RevenueCat API Keys
// Native (mobile) key — starts with appl_/goog_/test_
const RC_NATIVE_API_KEY = process.env.NEXT_PUBLIC_REVENUECAT_API_KEY || 'test_jDFNpsjMpVLkmoeypMJnKASSvdg';
// Web Billing key — starts with rcb_ (get from RevenueCat Dashboard → Project Settings → Apps → Web)
const RC_WEB_API_KEY = process.env.NEXT_PUBLIC_REVENUECAT_WEB_API_KEY || '';

const ENTITLEMENT_ID = 'Selfio Pro';
const POLL_INTERVAL_MS = 2000;
const POLL_MAX_ATTEMPTS = 15; // 30 seconds total

// Maps RevenueCat / Stripe error codes to user-friendly messages
function getPaymentErrorMessage(error: any): string {
    const code = error?.errorCode ?? error?.code ?? '';
    const msg = (error?.message ?? '').toLowerCase();

    if (msg.includes('already') || code === 'AlreadyPurchasedError') {
        return 'You already have an active subscription.';
    }
    if (msg.includes('network') || code === 'NetworkError') {
        return 'Network error. Please check your connection and try again.';
    }
    if (msg.includes('declined') || msg.includes('card') || code === 'ErrorChargingPayment') {
        return 'Payment failed. Please check your card details and try again.';
    }
    if (msg.includes('not eligible') || msg.includes('ineligible')) {
        return 'Your account is not eligible for this offer.';
    }
    return 'Something went wrong. Please try again.';
}


interface UseIAPOptions {
    /**
     * The authenticated user's ID (Clerk userId).
     * Pass this so RevenueCat uses the real user ID instead of an anonymous ID.
     * Webhooks will then include this ID, allowing the backend to look up the correct user.
     */
    userId?: string | null;
}

export function useIAP({ userId }: UseIAPOptions = {}) {
    const [loading, setLoading] = useState(false);
    const [hasPro, setHasPro] = useState(false);
    const [subscriptionPending, setSubscriptionPending] = useState(false);
    const [isNative] = useState(() => Capacitor.isNativePlatform());
    const initializedRef = useRef(false);
    const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const { setTier, setGenerationsRemaining } = useSubscriptionStore();

    useEffect(() => {
        if (initializedRef.current) return;
        if (!userId) return;

        initializedRef.current = true;

        if (isNative) {
            initNative(userId);
        }
    }, [isNative, userId]);

    // Clean up polling on unmount
    useEffect(() => {
        return () => {
            if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
        };
    }, []);

    // ─────────────────────────────────────────────
    // Native (Capacitor) initialization
    // ─────────────────────────────────────────────
    const initNative = async (uid: string) => {
        try {
            const { Purchases } = await import('@revenuecat/purchases-capacitor');
            await Purchases.configure({ apiKey: RC_NATIVE_API_KEY });
            await Purchases.logIn({ appUserID: uid });

            const { customerInfo } = await Purchases.getCustomerInfo();
            updateProStatus(customerInfo);

            Purchases.addCustomerInfoUpdateListener((info) => {
                updateProStatus(info);
            });
        } catch (error) {
            console.error('Failed to initialize RevenueCat (native):', error);
        }
    };

    // ─────────────────────────────────────────────
    // Unified pro status check
    // ─────────────────────────────────────────────
    const updateProStatus = (customerInfo: any) => {
        const isPro = !!customerInfo?.entitlements?.active?.[ENTITLEMENT_ID];
        setHasPro(isPro);
    };

    // ─────────────────────────────────────────────
    // Poll /api/subscription until tier === 'pro' or timeout
    // ─────────────────────────────────────────────
    const pollUntilPro = useCallback((attempt = 0) => {
        if (attempt >= POLL_MAX_ATTEMPTS) {
            setSubscriptionPending(false);
            toast.info("Subscription is processing — it may take a moment to reflect.");
            return;
        }

        pollTimerRef.current = setTimeout(async () => {
            try {
                const res = await fetch('/api/subscription');
                const data = await res.json();

                if (data.tier === 'pro') {
                    // Webhook has landed — update store directly, no reload needed
                    setTier('pro');
                    setGenerationsRemaining(data.generationsRemaining === Infinity ? 999 : (data.generationsRemaining ?? 50));
                    setHasPro(true);
                    setSubscriptionPending(false);
                    toast.success('You\'re now on Pro! 🎉');
                } else {
                    // Not yet — try again
                    pollUntilPro(attempt + 1);
                }
            } catch {
                pollUntilPro(attempt + 1);
            }
        }, POLL_INTERVAL_MS);
    }, [setTier, setGenerationsRemaining]);

    // ─────────────────────────────────────────────
    // After a successful purchase: start polling
    // ─────────────────────────────────────────────
    const onPurchaseSuccess = useCallback(() => {
        setSubscriptionPending(true);
        pollUntilPro(0);
    }, [pollUntilPro]);

    // ─────────────────────────────────────────────
    // Present Paywall (works on both web and native)
    // ─────────────────────────────────────────────
    const presentPaywall = useCallback(async () => {
        if (isNative) {
            return presentNativePaywall();
        } else {
            return presentWebPaywall();
        }
    }, [isNative, userId]);

    // ─────────────────────────────────────────────
    // Native Paywall (RevenueCatUI)
    // ─────────────────────────────────────────────
    const presentNativePaywall = async () => {
        try {
            setLoading(true);
            const { RevenueCatUI } = await import('@revenuecat/purchases-capacitor-ui');
            const { Purchases } = await import('@revenuecat/purchases-capacitor');

            const paywallResult = await RevenueCatUI.presentPaywall({
                displayCloseButton: true,
            });

            if ((paywallResult as any) === "PURCHASED" || (paywallResult as any) === "RESTORED") {
                const { customerInfo } = await Purchases.getCustomerInfo();
                updateProStatus(customerInfo);
                onPurchaseSuccess();
            }
            // "NOT_PRESENTED" or "ERROR" come through as a non-throw result — handle them gracefully
        } catch (error: any) {
            // RC capacitor surfaces cancellations as errors with code 1 (UserCancelled)
            const isCancelled =
                error?.code === 1 ||
                error?.errorCode === 1 ||
                error?.message?.toLowerCase().includes('cancel');
            if (!isCancelled) {
                console.error("Native paywall error:", error);
                toast.error(getPaymentErrorMessage(error));
            }
        } finally {
            setLoading(false);
        }
    };

    // ─────────────────────────────────────────────
    // Web Paywall (purchases-js)
    // ─────────────────────────────────────────────
    const presentWebPaywall = async () => {
        if (!userId) {
            toast.error('Please sign in to subscribe');
            return;
        }
        try {
            setLoading(true);
            const { Purchases } = await import('@revenuecat/purchases-js');

            const purchases = Purchases.configure({ apiKey: RC_WEB_API_KEY, appUserId: userId });
            const result = await purchases.presentPaywall({});

            if (result?.customerInfo) {
                updateProStatus(result.customerInfo);
                onPurchaseSuccess();
            }
        } catch (error: any) {
            // purchases-js throws a PurchasesError with errorCode 'UserCancelledError' on dismiss
            const isCancelled =
                error?.errorCode === 'UserCancelledError' ||
                error?.code === 'UserCancelledError' ||
                error?.message?.toLowerCase().includes('cancel');
            if (!isCancelled) {
                console.error("Web paywall error:", error);
                toast.error(getPaymentErrorMessage(error));
            }
        } finally {
            setLoading(false);
        }
    };

    // ─────────────────────────────────────────────
    // Customer Center (manage subscription)
    // ─────────────────────────────────────────────
    const presentCustomerCenter = useCallback(async () => {
        if (isNative) {
            try {
                const { RevenueCatUI } = await import('@revenuecat/purchases-capacitor-ui');
                await RevenueCatUI.presentCustomerCenter();
            } catch (error) {
                console.error("Customer Center error:", error);
            }
        } else {
            try {
                const res = await fetch("/api/create-portal-session", { method: "POST" });
                const data = await res.json();
                if (data.url) {
                    window.location.href = data.url;
                } else {
                    toast.error("Failed to open subscription management");
                }
            } catch (error) {
                console.error(error);
                toast.error("Failed to open subscription settings");
            }
        }
    }, [isNative]);

    // ─────────────────────────────────────────────
    // Restore Purchases
    // ─────────────────────────────────────────────
    const restorePurchases = useCallback(async () => {
        if (!isNative) return;
        try {
            setLoading(true);
            const { Purchases } = await import('@revenuecat/purchases-capacitor');
            const { customerInfo } = await Purchases.restorePurchases();
            updateProStatus(customerInfo);
            if (customerInfo?.entitlements?.active?.[ENTITLEMENT_ID]) {
                onPurchaseSuccess();
            } else {
                toast.info('No active subscription found to restore.');
            }
        } catch (e: any) {
            toast.error('Restore failed: ' + e.message);
        } finally {
            setLoading(false);
        }
    }, [isNative, onPurchaseSuccess]);

    return {
        isNative,
        loading,
        hasPro,
        subscriptionPending,
        presentPaywall,
        presentCustomerCenter,
        restorePurchases,
        purchase: presentPaywall,
    };
}
