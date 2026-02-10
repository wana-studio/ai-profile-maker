"use client";

import { useEffect, useState, useCallback } from "react";
import { useClerk, useSignIn, useSignUp } from "@clerk/nextjs";
import { SocialLogin } from "@capgo/capacitor-social-login";
import type { GoogleLoginResponseOnline } from "@capgo/capacitor-social-login";
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

// Initialize Social Login once
let socialLoginInitialized = false;

export function useCapacitorAuth(): UseCapacitorAuthReturn {
    const { signOut: clerkSignOut, setActive } = useClerk();
    const { signIn, isLoaded: isSignInLoaded } = useSignIn();
    const { signUp, isLoaded: isSignUpLoaded } = useSignUp();

    const [isCapacitor, setIsCapacitor] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [step, setStep] = useState<AuthStep>("idle");
    const [needsVerification, setNeedsVerificationState] = useState(false);

    // Check if running in Capacitor and initialize Social Login
    useEffect(() => {
        const isNative = isCapacitorNative();
        setIsCapacitor(isNative);
        setNeedsVerificationState(getNeedsVerification());

        // Initialize Social Login for Capacitor
        if (isNative && !socialLoginInitialized) {
            const webClientId = process.env.NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID;
            if (webClientId) {
                SocialLogin.initialize({
                    google: {
                        webClientId,
                    },
                });
                socialLoginInitialized = true;
            }
        }
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
     * Sign in with Google using native Capacitor plugin
     * Flow: Native Google login → Backend verifies token → Clerk sign-in ticket
     */
    const signInWithGoogle = useCallback(async (): Promise<boolean> => {
        if (!isSignInLoaded || !signIn) {
            setError("Authentication not ready");
            return false;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Step 1: Native Google login via Capacitor plugin
            const loginResult = await SocialLogin.login({
                provider: "google",
                options: {},
            });

            if (!loginResult || !loginResult.result) {
                setError("Google sign in was cancelled");
                return false;
            }

            const googleResult = loginResult.result;

            // Check if this is an online response (has idToken)
            if (googleResult.responseType !== "online") {
                setError("Offline mode not supported");
                return false;
            }

            const onlineResult = googleResult as GoogleLoginResponseOnline;
            const idToken = onlineResult.idToken;

            if (!idToken) {
                setError("No ID token received from Google");
                return false;
            }

            // Step 2: Exchange Google ID token for Clerk sign-in ticket via backend
            const response = await fetch("/api/auth/google-native", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ idToken }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                setError(errorData.error || "Failed to authenticate with server");
                return false;
            }

            const { token } = await response.json();

            // Step 3: Use the sign-in ticket to create a Clerk session
            const clerkResult = await signIn.create({
                strategy: "ticket",
                ticket: token,
            });

            if (clerkResult.status === "complete" && clerkResult.createdSessionId) {
                await setActive({ session: clerkResult.createdSessionId });
                storeCapacitorSession(clerkResult.createdSessionId);
                setStep("idle");
                return true;
            } else {
                setError("Clerk authentication incomplete");
                return false;
            }
        } catch (err: unknown) {
            console.error("Google sign in error:", err);
            const error = err as { errors?: Array<{ message: string }>; message?: string };
            const message = error.errors?.[0]?.message || error.message || "Google sign in failed";
            setError(message);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [isSignInLoaded, signIn, setActive]);

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
