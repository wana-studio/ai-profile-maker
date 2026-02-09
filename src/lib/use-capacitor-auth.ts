"use client";

import { useEffect, useState, useCallback } from "react";
import { useClerk, useSignIn, useSignUp } from "@clerk/nextjs";
import type { OAuthStrategy } from "@clerk/types";
import {
    isCapacitorNative,
    storeCapacitorSession,
    clearCapacitorAuth,
    setNeedsVerification,
    getNeedsVerification,
} from "./capacitor-auth";

export type AuthStep = "idle" | "signin" | "signup" | "verification" | "loading";

interface UseCapacitorAuthReturn {
    // State
    isCapacitor: boolean;
    isLoading: boolean;
    error: string | null;
    step: AuthStep;
    needsVerification: boolean;

    // Actions
    signInWithEmail: (email: string, password: string) => Promise<boolean>;
    signUpWithEmail: (
        email: string,
        password: string,
        firstName?: string,
        lastName?: string
    ) => Promise<boolean>;
    verifyEmail: (code: string) => Promise<boolean>;
    signInWithGoogle: () => Promise<boolean>;
    signOut: () => Promise<void>;
    clearError: () => void;
    setStep: (step: AuthStep) => void;
}

export function useCapacitorAuth(): UseCapacitorAuthReturn {
    const { signOut: clerkSignOut, setActive } = useClerk();
    const { signIn, isLoaded: isSignInLoaded } = useSignIn();
    const { signUp, isLoaded: isSignUpLoaded } = useSignUp();

    const [isCapacitor, setIsCapacitor] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [step, setStep] = useState<AuthStep>("idle");
    const [needsVerification, setNeedsVerificationState] = useState(false);

    // Check if running in Capacitor on mount
    useEffect(() => {
        setIsCapacitor(isCapacitorNative());
        setNeedsVerificationState(getNeedsVerification());
    }, []);

    const clearError = useCallback(() => setError(null), []);

    /**
     * Sign in with email and password
     */
    const signInWithEmail = useCallback(
        async (email: string, password: string): Promise<boolean> => {
            if (!isSignInLoaded || !signIn) {
                setError("Authentication not ready");
                return false;
            }

            setIsLoading(true);
            setError(null);

            try {
                const result = await signIn.create({
                    identifier: email,
                    password,
                });

                if (result.status === "complete" && result.createdSessionId) {
                    // Sync the active session - crucial for headless mode
                    await setActive({ session: result.createdSessionId });
                    storeCapacitorSession(result.createdSessionId);
                    setStep("idle");
                    return true;
                } else if (result.status === "needs_first_factor") {
                    setError("Additional verification required");
                    return false;
                } else if (result.status === "needs_second_factor") {
                    setError("Two-factor authentication required");
                    return false;
                } else {
                    setError("Sign in incomplete");
                    return false;
                }
            } catch (err: unknown) {
                const error = err as { errors?: Array<{ message: string }> };
                const message = error.errors?.[0]?.message || "Sign in failed";
                setError(message);
                return false;
            } finally {
                setIsLoading(false);
            }
        },
        [isSignInLoaded, signIn, setActive]
    );

    /**
     * Sign up with email and password
     */
    const signUpWithEmail = useCallback(
        async (
            email: string,
            password: string,
            firstName?: string,
            lastName?: string
        ): Promise<boolean> => {
            if (!isSignUpLoaded || !signUp) {
                setError("Authentication not ready");
                return false;
            }

            setIsLoading(true);
            setError(null);

            try {
                const result = await signUp.create({
                    emailAddress: email,
                    password,
                    firstName,
                    lastName,
                });

                if (result.status === "complete" && result.createdSessionId) {
                    await setActive({ session: result.createdSessionId });
                    storeCapacitorSession(result.createdSessionId);
                    setStep("idle");
                    return true;
                } else if (
                    result.status === "missing_requirements" &&
                    result.unverifiedFields?.includes("email_address")
                ) {
                    // Need to verify email
                    await signUp.prepareEmailAddressVerification({
                        strategy: "email_code",
                    });
                    setNeedsVerificationState(true);
                    setNeedsVerification(true);
                    setStep("verification");
                    return true;
                } else {
                    setError("Sign up incomplete");
                    return false;
                }
            } catch (err: unknown) {
                const error = err as { errors?: Array<{ message: string }> };
                const message = error.errors?.[0]?.message || "Sign up failed";
                setError(message);
                return false;
            } finally {
                setIsLoading(false);
            }
        },
        [isSignUpLoaded, signUp, setActive]
    );

    /**
     * Verify email with code
     */
    const verifyEmail = useCallback(
        async (code: string): Promise<boolean> => {
            if (!isSignUpLoaded || !signUp) {
                setError("Authentication not ready");
                return false;
            }

            setIsLoading(true);
            setError(null);

            try {
                const result = await signUp.attemptEmailAddressVerification({
                    code,
                });

                if (result.status === "complete" && result.createdSessionId) {
                    await setActive({ session: result.createdSessionId });
                    storeCapacitorSession(result.createdSessionId);
                    setNeedsVerificationState(false);
                    setNeedsVerification(false);
                    setStep("idle");
                    return true;
                } else {
                    setError("Verification incomplete");
                    return false;
                }
            } catch (err: unknown) {
                const error = err as { errors?: Array<{ message: string }> };
                const message = error.errors?.[0]?.message || "Verification failed";
                setError(message);
                return false;
            } finally {
                setIsLoading(false);
            }
        },
        [isSignUpLoaded, signUp, setActive]
    );

    /**
     * Sign in with Google OAuth
     * Note: OAuth in Capacitor WebView is challenging and may require additional setup
     */
    const signInWithGoogle = useCallback(async (): Promise<boolean> => {
        if (!isSignInLoaded || !signIn) {
            setError("Authentication not ready");
            return false;
        }

        setIsLoading(true);
        setError(null);

        try {
            const oauthStrategy: OAuthStrategy = "oauth_google";

            // In Capacitor, we need to handle OAuth differently
            // Using the redirect strategy
            await signIn.authenticateWithRedirect({
                strategy: oauthStrategy,
                redirectUrl: `${window.location.origin}/sso-callback`,
                redirectUrlComplete: `${window.location.origin}/`,
            });

            return true;
        } catch (err: unknown) {
            const error = err as { errors?: Array<{ message: string }> };
            const message =
                error.errors?.[0]?.message || "Google sign in failed";
            setError(message);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [isSignInLoaded, signIn]);

    /**
     * Sign out
     */
    const signOut = useCallback(async (): Promise<void> => {
        setIsLoading(true);
        try {
            await clerkSignOut();
            clearCapacitorAuth();
            setStep("idle");
        } catch (err: unknown) {
            console.error("Sign out error:", err);
        } finally {
            setIsLoading(false);
        }
    }, [clerkSignOut]);

    return {
        isCapacitor,
        isLoading,
        error,
        step,
        needsVerification,
        signInWithEmail,
        signUpWithEmail,
        verifyEmail,
        signInWithGoogle,
        signOut,
        clearError,
        setStep,
    };
}
