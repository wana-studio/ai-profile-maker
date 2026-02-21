import { useEffect, useState, useCallback, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { toast } from 'sonner';

// RevenueCat API Keys
const RC_API_KEY = process.env.NEXT_PUBLIC_REVENUECAT_API_KEY || 'test_jDFNpsjMpVLkmoeypMJnKASSvdg';

const ENTITLEMENT_ID = 'Selfio Pro'; // The entitlement identifier in RevenueCat dashboard

export function useIAP() {
    const [loading, setLoading] = useState(false);
    const [hasPro, setHasPro] = useState(false);
    const [isNative] = useState(() => Capacitor.isNativePlatform());
    const initializedRef = useRef(false);

    useEffect(() => {
        if (initializedRef.current) return;
        initializedRef.current = true;

        if (isNative) {
            initNative();
        }
        // Web SDK is initialized on-demand in presentPaywall
    }, [isNative]);

    // ─────────────────────────────────────────────
    // Native (Capacitor) initialization
    // ─────────────────────────────────────────────
    const initNative = async () => {
        try {
            const { Purchases } = await import('@revenuecat/purchases-capacitor');
            await Purchases.configure({ apiKey: RC_API_KEY });

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
        const isPro = typeof customerInfo?.entitlements?.active?.[ENTITLEMENT_ID] !== 'undefined'
            && customerInfo?.entitlements?.active?.[ENTITLEMENT_ID] !== undefined;
        setHasPro(isPro);
    };

    // ─────────────────────────────────────────────
    // Sync subscription status with our backend
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
    }, [isNative]);

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
        try {
            setLoading(true);
            const { Purchases } = await import('@revenuecat/purchases-js');

            // purchases-js requires an appUserId. We use $RCAnonymousID or Clerk user ID.
            // For simplicity, configure with a generated anonymous ID.
            // In production, you should use the Clerk user ID for cross-platform consistency.
            let appUserId = localStorage.getItem('rc_app_user_id');
            if (!appUserId) {
                appUserId = `web_${crypto.randomUUID()}`;
                localStorage.setItem('rc_app_user_id', appUserId);
            }

            const purchases = Purchases.configure({ apiKey: RC_API_KEY, appUserId });

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
            // (RevenueCat web doesn't have a Customer Center yet)
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
