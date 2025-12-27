'use client';

import { useState, useEffect } from 'react';
import { useUser, SignInButton } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import { CategoryChips } from '@/components/home/category-chips';
import { CreateButton } from '@/components/home/create-button';
import { PhotoCard } from '@/components/gallery/photo-card';
import { useGalleryStore } from '@/lib/stores';
import { Sparkles, LogIn } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import type { GeneratedPhoto } from '@/lib/db/schema';

type CategoryId = 'all' | 'dating' | 'work' | 'social' | 'anonymous' | 'creative' | 'travel';

export default function HomePage() {
    const { isSignedIn, isLoaded, user } = useUser();
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
        <div>
            {/* Header */}
            <header className="sticky top-0 z-50 glass-strong safe-area-top">
                <div className="flex items-center justify-between px-4 py-3">
                    <div>
                        <h1 className="text-xl font-bold text-gradient">Profile Maker</h1>
                        <p className="text-xs text-muted-foreground">Show up confidently</p>
                    </div>
                    {isSignedIn ? (
                        <Link
                            href="/profile"
                            className="w-10 h-10 rounded-full overflow-hidden"
                        >
                            {user?.imageUrl ? (
                                <img src={user.imageUrl} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-secondary flex items-center justify-center">
                                    <span className="text-lg">👤</span>
                                </div>
                            )}
                        </Link>
                    ) : (
                        <SignInButton mode="modal">
                            <Button variant="ghost" size="sm" className="gap-2">
                                <LogIn className="w-4 h-4" />
                                Sign In
                            </Button>
                        </SignInButton>
                    )}
                </div>
            </header>

            {/* Category chips */}
            <CategoryChips
                selected={selectedCategory}
                onSelect={setSelectedCategory}
            />

            {/* Content */}
            <main className="px-4 py-4 space-y-4">
                {!isLoaded || isLoadingPhotos ? (
                    <LoadingState />
                ) : !isSignedIn ? (
                    <GuestState />
                ) : filteredPhotos.length === 0 ? (
                    <EmptyState />
                ) : (
                    filteredPhotos.map((photo) => {
                        const handleDownload = async () => {
                            try {
                                const response = await fetch(photo.imageUrl);
                                const blob = await response.blob();
                                const url = window.URL.createObjectURL(blob);
                                const link = document.createElement('a');
                                link.href = url;
                                link.download = `${photo.title || 'photo'}-${photo.id}.jpg`;
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                                window.URL.revokeObjectURL(url);
                            } catch (error) {
                                console.error('Failed to download image:', error);
                            }
                        };

                        return (
                            <PhotoCard
                                key={photo.id}
                                photo={photo}
                                variant="feed"
                                onTap={() => {/* Navigate to detail */ }}
                                onFavorite={() => toggleFavorite(photo.id)}
                                onSave={handleDownload}
                            />
                        );
                    })
                )}
            </main>
        </div>
    );
}

function LoadingState() {
    return (
        <div className="flex flex-col items-center justify-center py-20">
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
            <motion.div
                animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0],
                }}
                transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
                className="p-6 rounded-full gradient-primary mb-6 glow"
            >
                <Sparkles className="w-12 h-12 text-white" />
            </motion.div>

            <h2 className="text-2xl font-bold text-white mb-3">
                Create Amazing Profile Photos
            </h2>
            <p className="text-muted-foreground max-w-xs mb-8">
                Sign in to generate AI-enhanced photos for dating apps, work, social media, and more
            </p>

            <SignInButton mode="modal">
                <Button className="px-8 py-6 rounded-full gradient-primary text-white font-semibold text-lg shadow-lg glow">
                    <LogIn className="w-5 h-5 mr-2" />
                    Sign In to Get Started
                </Button>
            </SignInButton>

            <p className="text-xs text-muted-foreground mt-6">
                Free account • No credit card required
            </p>
        </motion.div>
    );
}

function EmptyState() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 px-4 text-center"
        >
            <motion.div
                animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0],
                }}
                transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
                className="p-6 rounded-full gradient-primary mb-6 glow"
            >
                <Sparkles className="w-12 h-12 text-white" />
            </motion.div>
            <h2 className="text-2xl font-bold text-white mb-3">
                Your gallery awaits
            </h2>
            <p className="text-muted-foreground max-w-xs mb-8">
                Create your first AI-enhanced photo and start showing up confidently online
            </p>
            <Link
                href="/create"
                className="px-8 py-4 rounded-full gradient-primary text-white font-semibold text-lg shadow-lg glow touch-active"
            >
                Create Your First Photo
            </Link>
        </motion.div>
    );
}
