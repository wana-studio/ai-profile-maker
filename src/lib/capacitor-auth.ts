"use client";

import { Capacitor } from "@capacitor/core";

/**
 * Detect if the app is running in a Capacitor native environment (iOS/Android)
 */
export function isCapacitorNative(): boolean {
    if (typeof window === "undefined") return false;
    return Capacitor.isNativePlatform();
}

/**
 * Get the current platform (web, ios, android)
 */
export function getPlatform(): "web" | "ios" | "android" {
    if (typeof window === "undefined") return "web";
    return Capacitor.getPlatform() as "web" | "ios" | "android";
}

/**
 * Session storage keys for Capacitor auth
 */
const SESSION_KEY = "clerk_capacitor_session";
const NEEDS_VERIFICATION_KEY = "clerk_needs_verification";

/**
 * Store session data in localStorage for Capacitor persistence
 */
export function storeCapacitorSession(sessionId: string | null) {
    if (typeof window === "undefined") return;
    if (sessionId) {
        localStorage.setItem(SESSION_KEY, sessionId);
    } else {
        localStorage.removeItem(SESSION_KEY);
    }
}

/**
 * Get stored session from localStorage
 */
export function getStoredCapacitorSession(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(SESSION_KEY);
}

/**
 * Clear all Capacitor auth data
 */
export function clearCapacitorAuth() {
    if (typeof window === "undefined") return;
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(NEEDS_VERIFICATION_KEY);
}

/**
 * Store verification state
 */
export function setNeedsVerification(needs: boolean) {
    if (typeof window === "undefined") return;
    if (needs) {
        localStorage.setItem(NEEDS_VERIFICATION_KEY, "true");
    } else {
        localStorage.removeItem(NEEDS_VERIFICATION_KEY);
    }
}

/**
 * Check if verification is needed
 */
export function getNeedsVerification(): boolean {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(NEEDS_VERIFICATION_KEY) === "true";
}
