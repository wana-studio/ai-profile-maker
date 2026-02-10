"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { SignIn, useUser } from "@clerk/nextjs";
import { useModalStore } from "@/lib/stores";
import { isCapacitorNative } from "@/lib/capacitor-auth";
import { MobileSignIn } from "@/components/auth/mobile-sign-in";
import { MobileSignUp } from "@/components/auth/mobile-sign-up";

type AuthMode = "signin" | "signup";

export function SignInModal() {
  const { isSignInModalOpen, closeSignInModal } = useModalStore();
  const { isSignedIn } = useUser();
  const router = useRouter();
  const [isCapacitor, setIsCapacitor] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("signin");

  useEffect(() => {
    setIsCapacitor(isCapacitorNative());
  }, []);

  // Auto-close modal when user becomes authenticated (handles web Clerk login)
  useEffect(() => {
    if (isSignedIn && isSignInModalOpen) {
      closeSignInModal();
    }
  }, [isSignedIn, isSignInModalOpen, closeSignInModal]);

  const handleSuccess = () => {
    closeSignInModal();
    // Use router.refresh() instead of window.location.reload()
    // This updates server components without a full navigation,
    // preventing Clerk middleware from redirecting to hosted auth in Capacitor
    router.refresh();
  };

  return (
    <AnimatePresence>
      {isSignInModalOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeSignInModal}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-md mx-auto"
          >
            {isCapacitor ? (
              /* Mobile Auth - Custom Headless UI */
              <div className="relative bg-gradient-to-b from-gray-900 to-black border border-white/10 rounded-2xl p-6 shadow-2xl">
                {/* Close Button */}
                <button
                  onClick={closeSignInModal}
                  className="absolute top-4 right-4 p-2 text-white/60 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Auth Content */}
                <AnimatePresence mode="wait">
                  {authMode === "signin" ? (
                    <motion.div
                      key="signin"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                    >
                      <MobileSignIn
                        onSwitchToSignUp={() => setAuthMode("signup")}
                        onSuccess={handleSuccess}
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="signup"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <MobileSignUp
                        onSwitchToSignIn={() => setAuthMode("signin")}
                        onSuccess={handleSuccess}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              /* Web Auth - Default Clerk Component */
              <div className="w-full">
                <SignIn
                  appearance={{
                    elements: {
                      rootBox: "w-full",
                      card: "bg-transparent shadow-none w-full",
                      socialButtonsBlockButton:
                        "bg-white/10 border-white/20 hover:bg-white/20 text-white",
                      formButtonPrimary:
                        "bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90",
                      footerActionLink: "text-purple-400 hover:text-purple-300",
                      identityPreviewText: "text-white",
                      formFieldLabel: "text-white",
                      formFieldInput:
                        "bg-white/10 border-white/20 text-white placeholder:text-white/50",
                      dividerLine: "bg-white/20",
                      dividerText: "text-white/50",
                    },
                  }}
                  routing="hash"
                  signUpUrl="/sign-up"
                  afterSignInUrl="/"
                  redirectUrl="/"
                />
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
