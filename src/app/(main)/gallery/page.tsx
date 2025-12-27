'use client';

import { useState, useEffect } from 'react';
import { useUser, SignInButton } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import { LogIn, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CategoryChips } from '@/components/home/category-chips';
import { PhotoGrid } from '@/components/gallery/photo-grid';
import { useGalleryStore } from '@/lib/stores';
import { useRouter } from 'next/navigation';
import type { GeneratedPhoto } from '@/lib/db/schema';

type CategoryId = 'all' | 'dating' | 'work' | 'social' | 'anonymous' | 'creative' | 'travel';

export default function GalleryPage() {
    const router = useRouter();
    const { isSignedIn, isLoaded } = useUser();
    const [selectedCategory, setSelectedCategory] = useState<CategoryId>('all');
    const { photos, setPhotos, toggleFavorite } = useGalleryStore();
    const [isLoadingPhotos, setIsLoadingPhotos] = useState(true);

    // Load photos from database
    useEffect(() => {
        if (isSignedIn) {
            setIsLoadingPhotos(true);
            fetch('/api/photos')
                .then(res => res.json())
                .then(data => {
                    if (data.photos) {
                        // Convert date strings back to Date objects
                        const photosWithDates = data.photos.map((photo: GeneratedPhoto) => ({
                            ...photo,
                            createdAt: new Date(photo.createdAt),
                        }));
                        setPhotos(photosWithDates);
                    }
                    setIsLoadingPhotos(false);
                })
                .catch(err => {
                    console.error('Failed to load photos:', err);
                    setIsLoadingPhotos(false);
                });
        } else {
            setIsLoadingPhotos(false);
        }
    }, [isSignedIn, setPhotos]);

    const filteredPhotos = selectedCategory === 'all'
        ? photos
        : photos.filter(p => p.category === selectedCategory);

    return (
        <div className="min-h-screen">
            {/* Header */}
            <header className="sticky top-0 z-50 glass-strong safe-area-top">
                <div className="px-4 py-3">
                    <h1 className="text-xl font-bold text-white">Gallery</h1>
                    <p className="text-xs text-muted-foreground">
                        {isSignedIn ? `${photos.length} photos` : 'Sign in to view your photos'}
                    </p>
                </div>
            </header>

            {/* Category chips */}
            <CategoryChips
                selected={selectedCategory}
                onSelect={setSelectedCategory}
            />

            {/* Content */}
            {!isLoaded || isLoadingPhotos ? (
                <LoadingState />
            ) : !isSignedIn ? (
                <GuestState />
            ) : (
                <PhotoGrid
                    photos={filteredPhotos}
                    onPhotoTap={(photo) => router.push(`/gallery/${photo.id}`)}
                    onFavorite={toggleFavorite}
                />
            )}
        </div>
    );
}

function LoadingState() {
    return (
        <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-white/20 border-t-brand-purple rounded-full animate-spin" />
        </div>
    );
}

function GuestState() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16 px-4 text-center"
        >
            <div className="p-6 rounded-full gradient-primary mb-6 glow">
                <Image className="w-12 h-12 text-white" />
            </div>

            <h2 className="text-2xl font-bold text-white mb-3">
                Your Gallery Awaits
            </h2>
            <p className="text-muted-foreground max-w-xs mb-8">
                Sign in to view your generated photos and manage your collection
            </p>

            <SignInButton mode="modal">
                <Button className="px-8 py-6 rounded-full gradient-primary text-white font-semibold text-lg shadow-lg glow">
                    <LogIn className="w-5 h-5 mr-2" />
                    Sign In to View Gallery
                </Button>
            </SignInButton>
        </motion.div>
    );
}
