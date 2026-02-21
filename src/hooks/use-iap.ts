import { useEffect, useState } from "react";
import { Capacitor } from "@capacitor/core";
import {
    Purchases,
    PurchasesOfferings,
    CustomerInfo,
    PACKAGE_TYPE,
    PAYWALL_RESULT,
} from "@revenuecat/purchases-capacitor";
import { RevenueCatUI } from "@revenuecat/purchases-capacitor-ui";
import { toast } from "sonner";

// RevenueCat API Keys
const API_KEY_IOS =
    process.env.NEXT_PUBLIC_REVENUECAT_IOS_KEY ||
    "test_jDFNpsjMpVLkmoeypMJnKASSvdg";
const API_KEY_ANDROID =
    process.env.NEXT_PUBLIC_REVENUECAT_ANDROID_KEY ||
    "goog_MtmMPpKPEdQPXrNndMkdALAGgze";

const ENTITLEMENT_ID = "Selfio Pro"; // The entitlement identifier in RevenueCat dashboard

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
                const apiKey = platform === "ios" ? API_KEY_IOS : API_KEY_ANDROID;

                console.log("Configuring with api key", apiKey);
                await Purchases.configure({ apiKey });

                // Load offerings
                const offerings = await Purchases.getOfferings();
                setOfferings(offerings);
                console.log("OFFERINGS", offerings);

                // Get initial customer info
                const { customerInfo } = await Purchases.getCustomerInfo();
                setCustomerInfo(customerInfo);
                console.log("CUSTOMER INFO", customerInfo);

                // Listen for updates
                Purchases.addCustomerInfoUpdateListener((info) => {
                    setCustomerInfo(info);
                    checkEntitlement(info);
                });
            } catch (error) {
                console.error("Failed to initialize RevenueCat:", error);
            }
        };

        initRevenueCat();

        return () => {
            // Cleanup listener if possible
        };
    }, [isNative]);

    const checkEntitlement = async (info: CustomerInfo) => {
        // We rely on the webhook to sync with the backend.
        // The client-side state is sufficient for immediate UI access (Optimistic UI).
        // If we strictly needed to sync immediately, we would call an endpoint that fetches from RC server-side.
    };

    const presentPaywall = async () => {
        if (!isNative) {
            toast.error("Paywall available only on mobile app");
            return;
        }

        try {
            const { result: paywallResult } = await RevenueCatUI.presentPaywall({
                displayCloseButton: true,
            });

            // If they purchased, the CustomerInfo listener will fire and update state
            if (
                paywallResult === PAYWALL_RESULT.PURCHASED ||
                paywallResult === PAYWALL_RESULT.RESTORED
            ) {
                // The listener in useEffect will handle the update
                const { customerInfo } = await Purchases.getCustomerInfo();
                await checkEntitlement(customerInfo);
                window.location.reload();
            }
        } catch (error: any) {
            console.error("Paywall error:", error);
        }
    };

    const presentCustomerCenter = async () => {
        if (!isNative) return;
        try {
            await RevenueCatUI.presentCustomerCenter();
        } catch (error) {
            console.error("Customer Center error:", error);
            // Fallback to manage subscription normally if needed, but Customer Center usually handles it
        }
    };

    // Legacy purchase method kept for reference or custom UI fallbacks
    const purchase = async () => {
        // ... (can be deprecated in favor of Paywall)
        await presentPaywall();
    };

    const restorePurchases = async () => {
        if (!isNative) return;
        try {
            setLoading(true);
            const { customerInfo } = await Purchases.restorePurchases();
            setCustomerInfo(customerInfo);
            if (
                typeof customerInfo.entitlements.active[ENTITLEMENT_ID] !== "undefined"
            ) {
                toast.success("Purchases restored!");
                await checkEntitlement(customerInfo);
                window.location.reload();
            } else {
                toast.info("No active subscription found to restore.");
            }
        } catch (e: any) {
            toast.error("Restore failed: " + e.message);
        } finally {
            setLoading(false);
        }
    };

    return {
        isNative,
        loading,
        purchase,
        restorePurchases,
        presentPaywall,
        presentCustomerCenter,
        hasPro: customerInfo
            ? typeof customerInfo.entitlements.active[ENTITLEMENT_ID] !== "undefined"
            : false,
    };
}
