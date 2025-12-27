'use client';

import { motion } from 'framer-motion';
import { PhotoCard } from './photo-card';
import type { GeneratedPhoto } from '@/lib/db/schema';

interface PhotoGridProps {
    photos: GeneratedPhoto[];
    onPhotoTap: (photo: GeneratedPhoto) => void;
    onFavorite: (id: string) => void;
}

export function PhotoGrid({ photos, onPhotoTap, onFavorite }: PhotoGridProps) {
    if (photos.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 px-4">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-24 h-24 rounded-full gradient-primary opacity-20 mb-6"
                />
                <h3 className="text-lg font-semibold text-white mb-2">No photos yet</h3>
                <p className="text-sm text-muted-foreground text-center max-w-xs">
                    Create your first AI-enhanced photo and it will appear here
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 gap-3 p-4">
            {photos.map((photo, index) => (
                <motion.div
                    key={photo.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                >
                    <PhotoCard
                        photo={photo}
                        variant="grid"
                        onTap={() => onPhotoTap(photo)}
                        onFavorite={() => onFavorite(photo.id)}
                    />
                </motion.div>
            ))}
        </div>
    );
}
