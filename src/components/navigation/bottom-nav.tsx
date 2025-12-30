"use client";

import { motion } from "framer-motion";
import LiquidGlass from "liquid-glass-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { GalleryIcon, PlusCircleIcon, UserIcon } from "../ui/icons";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "gallery", label: "Gallery", icon: GalleryIcon, href: "/" },
  { id: "create", label: "Create", icon: PlusCircleIcon, href: "/create" },
  { id: "profile", label: "Profile", icon: UserIcon, href: "/profile" },
];

export function BottomNav() {
  const pathname = usePathname();

  const getActiveTab = () => {
    if (pathname === "/" || pathname.startsWith("/gallery")) return "gallery";
    if (pathname.startsWith("/create")) return "create";
    if (pathname.startsWith("/profile")) return "profile";
    return "gallery";
  };

  const activeTab = getActiveTab();

  return (
    <LiquidGlass
      padding="4px"
      elasticity={0}
      cornerRadius={99}
      blurAmount={0.2}
      style={{
        position: "fixed",
        bottom: "20px",
        left: "50%",
      }}
      className="glass-shadow rounded-full"
    >
      <div className="grid grid-cols-3 p-1 rounded-full w-full">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <Link
              key={tab.id}
              href={tab.href}
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
