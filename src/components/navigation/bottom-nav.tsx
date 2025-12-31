"use client";

import { motion } from "framer-motion";
import LiquidGlass from "@nkzw/liquid-glass";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { GalleryIcon, PlusCircleIcon, UserIcon } from "../ui/icons";
import { cn } from "@/lib/utils";
import { useModalStore } from "@/lib/stores";

const tabs = [
  { id: "gallery", label: "Gallery", icon: GalleryIcon, href: "/" },
  { id: "create", label: "Create", icon: PlusCircleIcon, href: "/create" },
  { id: "profile", label: "Profile", icon: UserIcon, href: "/profile" },
];

const protectedRoutes = ["/create", "/profile", "/gallery"];

export function BottomNav() {
  const pathname = usePathname();
  const { isSignedIn, isLoaded } = useUser();
  const { openSignInModal } = useModalStore();

  const getActiveTab = () => {
    if (pathname === "/" || pathname.startsWith("/gallery")) return "gallery";
    if (pathname.startsWith("/create")) return "create";
    if (pathname.startsWith("/profile")) return "profile";
    return "gallery";
  };

  const activeTab = getActiveTab();

  const isProtectedRoute = (href: string) => {
    return protectedRoutes.some((route) => href.startsWith(route));
  };

  const handleNavigation = (e: React.MouseEvent, href: string) => {
    // Only intercept if Clerk has loaded and user is not signed in
    if (isLoaded && !isSignedIn && isProtectedRoute(href)) {
      e.preventDefault();
      openSignInModal();
    }
  };

  return (
    <LiquidGlass
      padding="4px"
      mode="polar"
      saturation={150}
      elasticity={0}
      borderRadius={100}
      blurAmount={0.1}
      className="rounded-full safe-area-bottom bg-foreground/10 z-50"
      style={{
        position: "fixed",
        bottom: "0px",
        left: "50%",
        width: "278px",
      }}
    >
      <div className="grid grid-cols-3 rounded-full w-full">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <Link
              key={tab.id}
              href={tab.href}
              onClick={(e) => handleNavigation(e, tab.href)}
              className="relative w-[90px] flex flex-col items-center justify-center touch-active rounded-full py-2"
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 rounded-full bg-foreground/20 w-full h-full"
                  transition={{ type: "spring", duration: 0.5 }}
                />
              )}
              <motion.div
                animate={{
                  scale: isActive ? 1.1 : 1,
                }}
                transition={{ type: "spring", duration: 0.3 }}
                className="flex flex-col items-center justify-center"
              >
                <Icon
                  className={cn(
                    isActive ? "text-foreground" : "text-foreground/50",
                    "size-[22px]"
                  )}
                />

                <span
                  className={`text-[10px] font-semibold transition-colors mt-1 ${
                    isActive ? "text-foreground" : "text-foreground/50"
                  }`}
                >
                  {tab.label}
                </span>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </LiquidGlass>
  );
}
