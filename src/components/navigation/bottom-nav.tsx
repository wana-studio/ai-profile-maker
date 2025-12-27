'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Home, Sparkles, Image, User } from 'lucide-react';

const tabs = [
    { id: 'home', label: 'Home', icon: Home, href: '/' },
    { id: 'create', label: 'Create', icon: Sparkles, href: '/create' },
    { id: 'gallery', label: 'Gallery', icon: Image, href: '/gallery' },
    { id: 'profile', label: 'Profile', icon: User, href: '/profile' },
];

export function BottomNav() {
    const pathname = usePathname();

    const getActiveTab = () => {
        if (pathname === '/') return 'home';
        if (pathname.startsWith('/create')) return 'create';
        if (pathname.startsWith('/gallery')) return 'gallery';
        if (pathname.startsWith('/profile')) return 'profile';
        return 'home';
    };

    const activeTab = getActiveTab();

    return (
        <nav className="max-w-md mx-auto fixed bottom-0 left-0 right-0 z-50 glass-strong border-t border-white/5 safe-area-bottom">
            <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-4">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    const Icon = tab.icon;

                    return (
                        <Link
                            key={tab.id}
                            href={tab.href}
                            className="relative flex flex-col items-center justify-center w-16 h-full touch-active"
                        >
                            <div className="relative">
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute inset-0 -m-2 rounded-xl gradient-primary opacity-20"
                                        transition={{ type: 'spring', duration: 0.5 }}
                                    />
                                )}
                                <motion.div
                                    animate={{
                                        scale: isActive ? 1.1 : 1,
                                    }}
                                    transition={{ type: 'spring', duration: 0.3 }}
                                >
                                    <Icon
                                        size={24}
                                        className={isActive ? 'text-white' : 'text-muted-foreground'}
                                        strokeWidth={isActive ? 2.5 : 2}
                                    />
                                </motion.div>
                            </div>
                            <span
                                className={`text-xs mt-1 font-medium transition-colors ${isActive ? 'text-white' : 'text-muted-foreground'
                                    }`}
                            >
                                {tab.label}
                            </span>
                            {isActive && (
                                <motion.div
                                    layoutId="activeIndicator"
                                    className="absolute -bottom-0 w-8 h-0.5 rounded-full gradient-primary"
                                    transition={{ type: 'spring', duration: 0.5 }}
                                />
                            )}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
