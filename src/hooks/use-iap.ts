import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { Purchases, PurchasesOfferings, CustomerInfo, PACKAGE_TYPE } from '@revenuecat/purchases-capacitor';
import { toast } from 'sonner';

// RevenueCat API Keys
const API_KEY_IOS = 'appl_...'; // Replace with your actual RC iOS Key
const API_KEY_ANDROID = 'goog_...'; // Replace with your actual RC Android Key

const ENTITLEMENT_ID = 'pro'; // The entitlement identifier in RevenueCat dashboard

export interface IAPProduct {
    id: string;
    title: string;
    description: string;
    price: string;
    currency: string;
    owned: boolean;
}

export function useIAP() {
    const [offerings, setOfferings] = useState<PurchasesOfferings | null>(null);
    const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
    const [loading, setLoading] = useState(false);
    const [isNative] = useState(() => Capacitor.isNativePlatform());

    useEffect(() => {
        if (!isNative) return;

        const initRevenueCat = async () => {
            try {
                const platform = Capacitor.getPlatform();
                const apiKey = platform === 'ios' ? API_KEY_IOS : API_KEY_ANDROID;

                await Purchases.configure({ apiKey });

                // Load offerings
                const offerings = await Purchases.getOfferings();
                setOfferings(offerings);

                // Get initial customer info
                const { customerInfo } = await Purchases.getCustomerInfo();
                setCustomerInfo(customerInfo);

                // Listen for updates
                Purchases.addCustomerInfoUpdateListener((info) => {
                    setCustomerInfo(info);
                    checkEntitlement(info);
                });

            } catch (error) {
                console.error('Failed to initialize RevenueCat:', error);
            }
        };

        initRevenueCat();

        return () => {
            // Cleanup listener if possible (SDK doesn't expose easy removal for simple use cases usually, but it's fine)
        };
    }, [isNative]);

    const checkEntitlement = async (info: CustomerInfo) => {
        const isPro = typeof info.entitlements.active[ENTITLEMENT_ID] !== 'undefined';

        if (isPro) {
            // Sync with our backend
            try {
                await fetch('/api/webhooks/revenuecat/sync', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        appUserId: await Purchases.getAppUserID(),
                        isPro: true
                    }),
                });
                // We can reload or trigger a global state update here
            } catch (e) {
                console.error('Failed to sync entitlement with backend', e);
            }
        }
    };

    const purchase = async () => {
        if (!isNative) {
            toast.error('Available only on mobile app');
            return;
        }

        if (!offerings?.current) {
            toast.error('No offerings available yet');
            return;
        }

        try {
            setLoading(true);
            const pkg = offerings.current.monthly; // Assuming monthly package
            if (!pkg) {
                throw new Error("No monthly package found");
            }

            const { customerInfo } = await Purchases.purchasePackage({ aPackage: pkg });

            setCustomerInfo(customerInfo);

            if (typeof customerInfo.entitlements.active[ENTITLEMENT_ID] !== 'undefined') {
                toast.success('Subscription activated!');
                await checkEntitlement(customerInfo);
                window.location.reload();
            }

        } catch (error: any) {
            if (!error.userCancelled) {
                toast.error('Purchase failed: ' + error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    const restorePurchases = async () => {
        if (!isNative) return;
        try {
            setLoading(true);
            const { customerInfo } = await Purchases.restorePurchases();
            setCustomerInfo(customerInfo);
            if (typeof customerInfo.entitlements.active[ENTITLEMENT_ID] !== 'undefined') {
                toast.success('Purchases restored!');
                await checkEntitlement(customerInfo);
                window.location.reload();
            } else {
                toast.info('No active subscription found to restore.');
            }
        } catch (e: any) {
            toast.error('Restore failed: ' + e.message);
        } finally {
            setLoading(false);
        }
    };

    return {
        isNative,
        loading,
        purchase,
        restorePurchases,
        hasPro: customerInfo ? typeof customerInfo.entitlements.active[ENTITLEMENT_ID] !== "undefined" : false
    };
}
