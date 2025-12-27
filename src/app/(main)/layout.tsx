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
        <div className="min-h-screen pb-20">
            {children}
            <BottomNav />
            <SubscriptionModal />
            <EnhancementModal />
        </div>
    );
}
