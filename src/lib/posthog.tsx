"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";

// Initialize PostHog
if (typeof window !== "undefined") {
  const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST;

  if (posthogKey && posthogHost) {
    posthog.init(posthogKey, {
      api_host: posthogHost,
      person_profiles: "identified_only",
      capture_pageleave: true,
      loaded: (posthog) => {
        if (process.env.NODE_ENV === "development") {
          console.log("PostHog initialized");
        }
      },
    });
  } else {
    console.warn("PostHog environment variables not set");
  }
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const { user, isSignedIn } = useUser();

  useEffect(() => {
    if (isSignedIn && user) {
      // Identify user in PostHog
      posthog.identify(user.id, {
        email: user.emailAddresses[0]?.emailAddress,
        name: user.fullName,
        username: user.username,
        createdAt: user.createdAt,
      });
    } else if (!isSignedIn) {
      // Reset PostHog on sign out
      posthog.reset();
    }
  }, [isSignedIn, user]);

  return <PHProvider client={posthog}>{children}</PHProvider>;
}

// Hook to access PostHog instance
export { usePostHog } from "posthog-js/react";

// Helper function to track events with user properties
export function trackEvent(
  eventName: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  properties?: Record<string, any>
) {
  if (typeof window !== "undefined") {
    posthog.capture(eventName, properties);
  }
}

// Helper function to set user properties
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function setUserProperties(properties: Record<string, any>) {
  if (typeof window !== "undefined") {
    posthog.setPersonProperties(properties);
  }
}

// Export posthog instance for direct access if needed
export { posthog };
