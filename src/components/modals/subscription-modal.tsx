"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Sparkles, Zap, Crown, Shield, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useModalStore } from "@/lib/stores";

const proFeatures = [
  {
    icon: Sparkles,
    label: "Unlock all styles",
    description: "12+ premium style packs",
  },
  {
    icon: Zap,
    label: "Unlimited generations",
    description: "No monthly limits",
  },
  {
    icon: Crown,
    label: "No watermarks",
    description: "Download ready-to-use photos",
  },
  {
    icon: Shield,
    label: "Priority processing",
    description: "Faster generation times",
  },
];

export function SubscriptionModal() {
  const { isSubscriptionModalOpen, closeSubscriptionModal } = useModalStore();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to create checkout session");
      }

      const data = await response.json();

      if (data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error) {
      console.error("Subscription error:", error);
      alert("Failed to start subscription. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isSubscriptionModalOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeSubscriptionModal}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-x-4 bottom-4 z-50 max-w-lg mx-auto"
          >
            <div className="relative overflow-hidden rounded-3xl glass-strong border border-white/10">
              {/* Gradient decoration */}
              <div className="absolute top-0 left-0 right-0 h-35 gradient-warm opacity-30" />

              {/* Close button */}
              <button
                onClick={closeSubscriptionModal}
                disabled={isLoading}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10 disabled:opacity-50"
              >
                <X className="w-5 h-5 text-white" />
              </button>

              {/* Content */}
              <div className="relative p-6 pt-8">
                {/* Header */}
                <div className="text-center mb-6">
                  <div className="inline-flex p-3 rounded-2xl gradient-warm mb-4">
                    <Crown className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Upgrade to Pro
                  </h2>
                  <p className="text-muted-foreground">
                    Unlock the full potential of your profile photos
                  </p>
                </div>

                {/* Features */}
                <div className="space-y-3 mb-6">
                  {proFeatures.map((feature, index) => (
                    <motion.div
                      key={feature.label}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-4 p-3 rounded-2xl bg-white/5"
                    >
                      <div className="p-2 rounded-xl gradient-secondary">
                        <feature.icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-white">
                          {feature.label}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {feature.description}
                        </p>
                      </div>
                      <Check className="w-5 h-5 text-green-400 ml-auto" />
                    </motion.div>
                  ))}
                </div>

                {/* Pricing */}
                <div className="text-center mb-6 p-4 rounded-2xl bg-white/5 border border-white/10">
                  <p className="text-sm text-muted-foreground mb-1">
                    Monthly subscription
                  </p>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold text-white">$9.99</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Cancel anytime. No commitment.
                  </p>
                </div>

                {/* CTA */}
                <Button
                  onClick={handleSubscribe}
                  disabled={isLoading}
                  className="w-full h-14 text-lg font-semibold gradient-warm hover:opacity-90 transition-opacity disabled:opacity-70"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Start Pro Trial"
                  )}
                </Button>

                <p className="text-center text-xs text-muted-foreground mt-4">
                  7-day free trial • Then $9.99/month
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
