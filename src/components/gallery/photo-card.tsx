'use client';

import { motion } from 'framer-motion';
import { Heart, Download, RefreshCw, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { GeneratedPhoto } from '@/lib/db/schema';

interface PhotoCardProps {
    photo: GeneratedPhoto;
    onTap?: () => void;
    onFavorite?: () => void;
    variant?: 'feed' | 'grid';
}

export function PhotoCard({ photo, onTap, onFavorite, variant = 'feed' }: PhotoCardProps) {
    const categoryColors: Record<string, string> = {
        dating: 'bg-pink-500/20 text-pink-300',
        work: 'bg-blue-500/20 text-blue-300',
        social: 'bg-purple-500/20 text-purple-300',
        anonymous: 'bg-slate-500/20 text-slate-300',
        creative: 'bg-orange-500/20 text-orange-300',
        travel: 'bg-cyan-500/20 text-cyan-300',
    };

    if (variant === 'grid') {
        return (
            <motion.div
                whileTap={{ scale: 0.98 }}
                onClick={onTap}
                className="relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer card-shadow group"
            >
                {/* Photo */}
                <img
                    src={photo.imageUrl}
                    alt={photo.title || 'Generated photo'}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                {/* Favorite indicator */}
                {photo.isFavorite && (
                    <div className="absolute top-2 right-2">
                        <Heart className="w-5 h-5 text-pink-500 fill-pink-500" />
                    </div>
                )}

                {/* Category badge */}
                <div className="absolute bottom-2 left-2">
                    <Badge className={`${categoryColors[photo.category]} border-0 text-xs`}>
                        {photo.category}
                    </Badge>
                </div>

                {/* Watermark indicator */}
                {photo.isWatermarked && (
                    <div className="absolute bottom-2 right-2 text-xs text-white/50">
                        Watermarked
                    </div>
                )}
            </motion.div>
        );
    }

    // Feed variant - larger card
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative rounded-3xl overflow-hidden card-shadow glass"
        >
            {/* Main photo area */}
            <div
                onClick={onTap}
                className="relative aspect-[4/5] cursor-pointer group"
            >
                <img
                    src={photo.imageUrl}
                    alt={photo.title || 'Generated photo'}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Title and category */}
                <div className="absolute bottom-20 left-0 right-0 p-4">
                    <Badge className={`${categoryColors[photo.category]} border-0 mb-2`}>
                        {photo.category}
                    </Badge>
                    {photo.title && (
                        <h3 className="text-lg font-semibold text-white">{photo.title}</h3>
                    )}

                    {/* Quick insight preview */}
                    {photo.insights && photo.insights.length > 0 && (
                        <p className="text-sm text-white/70 mt-1 line-clamp-1">
                            ✨ {photo.insights[0]}
                        </p>
                    )}
                </div>
            </div>

            {/* Action bar */}
            <div className="flex items-center justify-around py-3 px-4 border-t border-white/5">
                <button
                    onClick={onFavorite}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/5 transition-colors touch-active"
                >
                    <Heart
                        className={`w-5 h-5 ${photo.isFavorite ? 'text-pink-500 fill-pink-500' : 'text-muted-foreground'}`}
                    />
                    <span className="text-sm text-muted-foreground">Favorite</span>
                </button>

                <button className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/5 transition-colors touch-active">
                    <Download className="w-5 h-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Save</span>
                </button>

                <button className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/5 transition-colors touch-active">
                    <RefreshCw className="w-5 h-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Remix</span>
                </button>

                <button className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/5 transition-colors touch-active">
                    <Sparkles className="w-5 h-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Enhance</span>
                </button>
            </div>
        </motion.div>
    );
}
