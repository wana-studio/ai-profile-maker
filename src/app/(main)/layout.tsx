'use client';

import { BottomNav } from '@/components/navigation/bottom-nav';
import { SubscriptionModal } from '@/components/modals/subscription-modal';
import { EnhancementModal } from '@/components/modals/enhancement-modal';

export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen pb-20 max-w-md mx-auto">
            {children}
            <BottomNav />
            <SubscriptionModal />
            <EnhancementModal />
        </div>
    );
}
