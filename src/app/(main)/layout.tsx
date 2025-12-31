"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { BottomNav } from "@/components/navigation/bottom-nav";
import { SubscriptionModal } from "@/components/modals/subscription-modal";
import { EnhancementModal } from "@/components/modals/enhancement-modal";
import { SignInModal } from "@/components/modals/sign-in-modal";
import { useModalStore } from "@/lib/stores";

const protectedRoutes = ["/create", "/profile", "/gallery"];

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { isSignedIn, isLoaded } = useUser();
  const { openSignInModal } = useModalStore();

  useEffect(() => {
    // Only check once Clerk has loaded
    if (!isLoaded) return;

    // Check if the current path is protected
    const isProtected = protectedRoutes.some((route) =>
      pathname.startsWith(route)
    );

    // If on a protected route and not signed in, redirect to home and show modal
    if (isProtected && !isSignedIn) {
      router.push("/");
      // Defer modal opening to avoid synchronous setState in effect
      const timer = setTimeout(() => {
        openSignInModal();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [pathname, isSignedIn, isLoaded, router, openSignInModal]);

  return (
    <div className="min-h-screen pb-20 max-w-md mx-auto">
      {children}
      <BottomNav />
      <SubscriptionModal />
      <EnhancementModal />
      <SignInModal />
    </div>
  );
}
