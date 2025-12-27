'use client';

import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Style } from '@/lib/db/schema';

interface StyleGridProps {
    styles: Style[];
    selectedStyle: Style | null;
    onSelectStyle: (style: Style) => void;
    onLockedStyleTap: (style: Style) => void;
    isPro: boolean;
}

export function StyleGrid({
    styles,
    selectedStyle,
    onSelectStyle,
    onLockedStyleTap,
    isPro
}: StyleGridProps) {
    // Group styles by category
    const groupedStyles = styles.reduce((acc, style) => {
        const category = style.category;
        if (!acc[category]) acc[category] = [];
        acc[category].push(style);
        return acc;
    }, {} as Record<string, Style[]>);

    const categoryLabels: Record<string, string> = {
        dating: '💕 Dating App Pack',
        work: '💼 Professional',
        social: '📱 Social Media',
        anonymous: '🎭 Anonymous',
        creative: '🎨 Creative',
        travel: '✈️ Travel & Lifestyle',
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-2">Choose Your Style</h2>
                <p className="text-muted-foreground">
                    Pick a look that matches your vibe
                </p>
            </div>

            {/* Style categories */}
            {Object.entries(groupedStyles).map(([category, categoryStyles]) => (
                <div key={category} className="space-y-3">
                    <h3 className="text-sm font-semibold text-muted-foreground px-1">
                        {categoryLabels[category] || category}
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                        {categoryStyles.map((style, index) => {
                            const isLocked = style.isPremium && !isPro;
                            const isSelected = selectedStyle?.id === style.id;

                            return (
                                <motion.button
                                    key={style.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.05 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => {
                                        if (isLocked) {
                                            onLockedStyleTap(style);
                                        } else {
                                            onSelectStyle(style);
                                        }
                                    }}
                                    className={`relative aspect-[3/4] rounded-2xl overflow-hidden transition-all ${isSelected
                                        ? 'ring-2 ring-brand-purple ring-offset-2 ring-offset-background'
                                        : ''
                                        } ${isLocked ? 'opacity-70' : ''}`}
                                >
                                    {/* Style cover image */}
                                    <img
                                        src={style.coverImageUrl}
                                        alt={style.name}
                                        className="w-full h-full object-cover"
                                    />

                                    {/* Gradient overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                                    {/* Lock icon for premium */}
                                    {isLocked && (
                                        <div className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50">
                                            <Lock className="w-4 h-4 text-white" />
                                        </div>
                                    )}

                                    {/* Premium badge */}
                                    {style.isPremium && (
                                        <Badge className="absolute top-2 left-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 text-xs">
                                            PRO
                                        </Badge>
                                    )}

                                    {/* Style name */}
                                    <div className="absolute bottom-20 left-0 right-0 p-3">
                                        <p className="text-sm font-medium text-white">{style.name}</p>
                                        {style.description && (
                                            <p className="text-xs text-white/70 line-clamp-1">
                                                {style.description}
                                            </p>
                                        )}
                                    </div>

                                    {/* Selected indicator */}
                                    {isSelected && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="absolute inset-0 bg-brand-purple/20 flex items-center justify-center"
                                        >
                                            <div className="p-2 rounded-full bg-brand-purple">
                                                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                        </motion.div>
                                    )}
                                </motion.button>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}
