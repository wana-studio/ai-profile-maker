'use client';

import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface LoadingScreenProps {
    message?: string;
}

const loadingMessages = [
    "Building your best look…",
    "Finding the perfect angle…",
    "Adding some magic…",
    "Almost there…",
    "Making you look amazing…",
];

export function LoadingScreen({ message }: LoadingScreenProps) {
    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background">
            {/* Animated gradient background */}
            <div className="absolute inset-0 overflow-hidden">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 180, 360],
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                    className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] opacity-30"
                    style={{
                        background: 'radial-gradient(circle, oklch(0.55 0.28 290) 0%, transparent 50%)',
                    }}
                />
                <motion.div
                    animate={{
                        scale: [1.2, 1, 1.2],
                        rotate: [180, 360, 540],
                    }}
                    transition={{
                        duration: 15,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                    className="absolute -bottom-1/2 -right-1/2 w-[200%] h-[200%] opacity-20"
                    style={{
                        background: 'radial-gradient(circle, oklch(0.65 0.25 340) 0%, transparent 50%)',
                    }}
                />
            </div>

            {/* Loading content */}
            <div className="relative z-10 flex flex-col items-center gap-8 px-8">
                {/* Animated icon */}
                <motion.div
                    animate={{
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                    className="relative"
                >
                    <div className="absolute inset-0 gradient-primary rounded-full blur-xl opacity-50" />
                    <div className="relative p-6 rounded-full gradient-primary animate-pulse-glow">
                        <Sparkles className="w-12 h-12 text-white" />
                    </div>
                </motion.div>

                {/* Progress ring */}
                <motion.div
                    className="relative w-32 h-32"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    <svg className="w-full h-full -rotate-90">
                        <circle
                            cx="64"
                            cy="64"
                            r="58"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="4"
                            className="text-secondary"
                        />
                        <motion.circle
                            cx="64"
                            cy="64"
                            r="58"
                            fill="none"
                            stroke="url(#gradient)"
                            strokeWidth="4"
                            strokeLinecap="round"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{
                                duration: 8,
                                ease: "easeInOut",
                            }}
                            style={{
                                strokeDasharray: "364.42",
                            }}
                        />
                        <defs>
                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="oklch(0.55 0.28 290)" />
                                <stop offset="50%" stopColor="oklch(0.65 0.25 340)" />
                                <stop offset="100%" stopColor="oklch(0.55 0.22 250)" />
                            </linearGradient>
                        </defs>
                    </svg>
                </motion.div>

                {/* Loading text */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="text-center"
                >
                    <motion.p
                        key={message}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xl font-semibold text-white mb-2"
                    >
                        {message || loadingMessages[0]}
                    </motion.p>
                    <p className="text-sm text-muted-foreground">
                        This usually takes 10-20 seconds
                    </p>
                </motion.div>

                {/* Animated dots */}
                <div className="flex gap-2">
                    {[0, 1, 2].map((i) => (
                        <motion.div
                            key={i}
                            animate={{
                                scale: [1, 1.5, 1],
                                opacity: [0.3, 1, 0.3],
                            }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                delay: i * 0.2,
                            }}
                            className="w-2 h-2 rounded-full gradient-primary"
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
