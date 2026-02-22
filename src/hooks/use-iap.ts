import { useEffect, useState, useCallback, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { toast } from 'sonner';

// RevenueCat API Keys
// Native (mobile) key — starts with appl_/goog_/test_
const RC_NATIVE_API_KEY = process.env.NEXT_PUBLIC_REVENUECAT_API_KEY || 'test_jDFNpsjMpVLkmoeypMJnKASSvdg';
// Web Billing key — starts with rcb_ (get from RevenueCat Dashboard → Project Settings → Apps → Web)
const RC_WEB_API_KEY = process.env.NEXT_PUBLIC_REVENUECAT_WEB_API_KEY || '';

const ENTITLEMENT_ID = 'Selfio Pro'; // The entitlement identifier in RevenueCat dashboard

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
    const [isNative] = useState(() => Capacitor.isNativePlatform());
    const initializedRef = useRef(false);

    useEffect(() => {
        if (initializedRef.current) return;
        // Wait until we have userId before initializing, so RC gets the real ID from the start
        if (!userId) return;

        initializedRef.current = true;

        if (isNative) {
            initNative(userId);
        }
        // Web SDK is initialized on-demand in presentPaywall (needs userId too)
    }, [isNative, userId]);

    // ─────────────────────────────────────────────
    // Native (Capacitor) initialization
    // ─────────────────────────────────────────────
    const initNative = async (uid: string) => {
        try {
            const { Purchases } = await import('@revenuecat/purchases-capacitor');
            await Purchases.configure({ apiKey: RC_NATIVE_API_KEY });

            // Identify the user so webhooks contain the real Clerk user ID
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
    // Sync subscription status with our backend (client-side optimistic update)
    // NOTE: The authoritative source is the RevenueCat server-side webhook.
    // This call is just for immediate UI feedback after a purchase.
    // ─────────────────────────────────────────────
    const syncSubscriptionToBackend = async (isPro: boolean) => {
        try {
            await fetch('/api/webhooks/revenuecat/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isPro }),
            });
        } catch (error) {
            console.error('Failed to sync subscription to backend:', error);
        }
    };

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

            // Check result by casting (enum from capacitor-ui)
            if ((paywallResult as any) === "PURCHASED" || (paywallResult as any) === "RESTORED") {
                const { customerInfo } = await Purchases.getCustomerInfo();
                updateProStatus(customerInfo);
                await syncSubscriptionToBackend(true);
                toast.success('Subscription activated!');
                window.location.reload();
            }
        } catch (error: any) {
            if (!error?.userCancelled) {
                console.error("Native paywall error:", error);
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

            // Use the Clerk userId as the RC appUserId — webhooks will contain this ID
            const purchases = Purchases.configure({ apiKey: RC_WEB_API_KEY, appUserId: userId });

            const result = await purchases.presentPaywall({});

            // result is PaywallPurchaseResult with customerInfo
            if (result?.customerInfo) {
                updateProStatus(result.customerInfo);
                await syncSubscriptionToBackend(true);
                toast.success('Subscription activated!');
                window.location.reload();
            }
        } catch (error: any) {
            // UserCancelledError means user closed the paywall — don't show error
            if (error?.errorCode !== 'UserCancelledError' && error?.code !== 'UserCancelledError') {
                console.error("Web paywall error:", error);
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
            // On web, redirect to Stripe portal as fallback
            try {
                const res = await fetch("/api/create-portal-session", {
                    method: "POST",
                });
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
                toast.success('Purchases restored!');
                await syncSubscriptionToBackend(true);
                window.location.reload();
            } else {
                toast.info('No active subscription found to restore.');
            }
        } catch (e: any) {
            toast.error('Restore failed: ' + e.message);
        } finally {
            setLoading(false);
        }
    }, [isNative]);

    return {
        isNative,
        loading,
        hasPro,
        presentPaywall,
        presentCustomerCenter,
        restorePurchases,
        // Legacy alias
        purchase: presentPaywall,
    };
}
