"use client";

import { motion } from "framer-motion";
import { Image, Sparkles, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { id: "gallery", label: "Gallery", icon: Image, href: "/" },
  { id: "create", label: "Create", icon: Sparkles, href: "/create" },
  { id: "profile", label: "Profile", icon: User, href: "/profile" },
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
    <nav className="max-w-md mx-auto fixed bottom-0 left-0 right-0 z-50 safe-area-bottom py-5! flex flex-col items-center justify-center">
      <div className="liquid-glass grid grid-cols-3 w-full max-w-[260px] p-1 rounded-full">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <Link
              key={tab.id}
              href={tab.href}
              className="relative flex flex-col items-center justify-center touch-active rounded-full py-1.5"
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 rounded-full gradient-primary w-full h-full"
                  transition={{ type: "spring", duration: 0.5 }}
                />
              )}
              <div className="relative flex flex-col items-center justify-center">
                <motion.div
                  animate={{
                    scale: isActive ? 1.1 : 1,
                  }}
                  transition={{ type: "spring", duration: 0.3 }}
                >
                  <Icon
                    size={22}
                    className={
                      isActive ? "text-white" : "text-muted-foreground"
                    }
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                </motion.div>

                <span
                  className={`text-[10px] font-medium transition-colors ${
                    isActive ? "text-white" : "text-muted-foreground"
                  }`}
                >
                  {tab.label}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
