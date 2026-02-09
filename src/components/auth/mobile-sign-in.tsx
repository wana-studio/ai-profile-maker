"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { useCapacitorAuth } from "@/lib/use-capacitor-auth";

interface MobileSignInProps {
    onSwitchToSignUp: () => void;
    onSuccess?: () => void;
}

export function MobileSignIn({ onSwitchToSignUp, onSuccess }: MobileSignInProps) {
    const { signInWithEmail, signInWithGoogle, isLoading, error, clearError } =
        useCapacitorAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        clearError();

        if (!email || !password) return;

        const success = await signInWithEmail(email, password);
        if (success) {
            onSuccess?.();
        }
    };

    const handleGoogleSignIn = async () => {
        clearError();
        await signInWithGoogle();
    };

    return (
        <div className="w-full space-y-6">
            {/* Header */}
            <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
                <p className="text-white/60 text-sm">
                    Sign in to continue creating amazing photos
                </p>
            </div>

            {/* Error Display */}
            {error && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm"
                >
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                </motion.div>
            )}

            {/* Google Sign In */}
            <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white/10 hover:bg-white/15 border border-white/20 rounded-xl text-white font-medium transition-colors disabled:opacity-50"
            >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                </svg>
                Continue with Google
            </button>

            {/* Divider */}
            <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-white/20" />
                <span className="text-white/50 text-sm">or</span>
                <div className="flex-1 h-px bg-white/20" />
            </div>

            {/* Email/Password Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email Input */}
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                    <input
                        type="email"
                        placeholder="Email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isLoading}
                        className="w-full pl-11 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-colors disabled:opacity-50"
                    />
                </div>

                {/* Password Input */}
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isLoading}
                        className="w-full pl-11 pr-11 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-colors disabled:opacity-50"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                    >
                        {showPassword ? (
                            <EyeOff className="w-5 h-5" />
                        ) : (
                            <Eye className="w-5 h-5" />
                        )}
                    </button>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isLoading || !email || !password}
                    className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 rounded-xl text-white font-medium transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Signing in...
                        </>
                    ) : (
                        "Sign In"
                    )}
                </button>
            </form>

            {/* Switch to Sign Up */}
            <div className="text-center text-sm">
                <span className="text-white/60">Don&apos;t have an account? </span>
                <button
                    type="button"
                    onClick={onSwitchToSignUp}
                    className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
                >
                    Sign up
                </button>
            </div>
        </div>
    );
}
