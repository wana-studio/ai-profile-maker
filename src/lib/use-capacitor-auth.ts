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
     * Uses OAuth with Google ID token to create a ticket for Clerk
     */
    const signInWithGoogle = useCallback(async (): Promise<boolean> => {
        if (!isSignInLoaded || !signIn) {
            setError("Authentication not ready");
            return false;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Use native Google login via Capacitor plugin
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
            const profile = onlineResult.profile;

            if (!idToken) {
                setError("No ID token received from Google");
                return false;
            }

            // For Clerk, we need to use the OAuth redirect flow with a ticket
            // First, start the OAuth flow which will give us the redirect URL
            const oauthResult = await signIn.create({
                strategy: "oauth_google",
                redirectUrl: window.location.origin + "/sso-callback",
                actionCompleteRedirectUrl: window.location.origin + "/",
            });

            // If OAuth is configured correctly, we should have a first factor
            if (oauthResult.status === "complete" && oauthResult.createdSessionId) {
                await setActive({ session: oauthResult.createdSessionId });
                storeCapacitorSession(oauthResult.createdSessionId);
                setStep("idle");
                return true;
            }

            // If we get here, OAuth redirect is needed but we have a native token
            // For a proper integration, the backend would need to verify the Google ID token
            // and create a Clerk session. For now, we'll show user info and suggest using email
            if (profile?.email) {
                setError(`Google auth requires additional setup. Please sign in with email: ${profile.email}`);
            } else {
                setError("Google authentication requires web redirect. Please try email sign-in.");
            }
            return false;

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
