"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { SignIn } from "@clerk/nextjs";
import { useModalStore } from "@/lib/stores";

export function SignInModal() {
  const { isSignInModalOpen, closeSignInModal } = useModalStore();

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
            {/* Clerk SignIn Component */}
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
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
