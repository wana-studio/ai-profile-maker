'use client';

import { useState, useEffect } from 'react';
import { useUser, SignInButton } from '@clerk/nextjs';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, LogIn, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FaceUpload } from '@/components/create/face-upload';
import { StyleGrid } from '@/components/create/style-grid';
import { VibeControls } from '@/components/create/vibe-controls';
import { LoadingScreen } from '@/components/create/loading-screen';
import { useCreateFlowStore, useFaceProfilesStore, useSubscriptionStore, useModalStore } from '@/lib/stores';
import { useRouter } from 'next/navigation';
import type { Style } from '@/lib/db/schema';

const stepTitles = ['Face', 'Style', 'Vibe', 'Generate'];

export default function CreatePage() {
    const router = useRouter();
    const { isSignedIn, isLoaded } = useUser();
    const { tier } = useSubscriptionStore();
    const { profiles, setProfiles } = useFaceProfilesStore();
    const { openSubscriptionModal } = useModalStore();
    const {
        step,
        selectedFaceProfile,
        selectedStyle,
        energyLevel,
        realismLevel,
        options,
        isGenerating,
        nextStep,
        prevStep,
        setSelectedFaceProfile,
        setSelectedStyle,
        setEnergyLevel,
        setRealismLevel,
        setOption,
        setIsGenerating,
        reset,
    } = useCreateFlowStore();

    const [styles, setStyles] = useState<Style[]>([]);
    const [stylesLoading, setStylesLoading] = useState(true);
    const isPro = tier === 'pro';

    // Load face profiles when signed in
    useEffect(() => {
        if (isSignedIn) {
            fetch('/api/face-profiles')
                .then(res => res.json())
                .then(data => {
                    if (data.profiles) {
                        setProfiles(data.profiles);
                    }
                })
                .catch(err => console.error('Failed to load face profiles:', err));
        }
    }, [isSignedIn, setProfiles]);

    // Load styles
    useEffect(() => {
        fetch('/api/styles')
            .then(res => res.json())
            .then(data => {
                if (data.styles && data.styles.length > 0) {
                    setStyles(data.styles);
                }
                setStylesLoading(false);
            })
            .catch(err => {
                console.error('Failed to load styles:', err);
                setStylesLoading(false);
            });
    }, []);

    // Show login required state if not authenticated
    if (isLoaded && !isSignedIn) {
        return (
            <div className="flex flex-col items-center justify-center px-4 py-16">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center"
                >
                    <div className="p-6 rounded-full gradient-primary mb-6 mx-auto w-fit glow">
                        <Sparkles className="w-12 h-12 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-3">
                        Sign In to Create
                    </h2>
                    <p className="text-muted-foreground max-w-xs mb-8">
                        Create an account to generate amazing AI-enhanced profile photos
                    </p>
                    <SignInButton mode="modal">
                        <Button className="px-8 py-6 rounded-full gradient-primary text-white font-semibold text-lg shadow-lg glow">
                            <LogIn className="w-5 h-5 mr-2" />
                            Sign In to Continue
                        </Button>
                    </SignInButton>
                </motion.div>
            </div>
        );
    }

    const handleUpload = async (file: File) => {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('name', 'My Face');
            formData.append('isDefault', 'true');

            const response = await fetch('/api/upload-face', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            const data = await response.json();
            setSelectedFaceProfile(data.profile);
        } catch (error) {
            console.error('Upload error:', error);
            alert('Failed to upload face profile. Please try again.');
        }
    };

    const handleGenerate = async () => {
        setIsGenerating(true);

        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    faceProfileId: selectedFaceProfile?.id,
                    styleId: selectedStyle?.id,
                    energyLevel,
                    realismLevel,
                    options,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                if (error.upgrade) {
                    openSubscriptionModal();
                }
                throw new Error(error.error || 'Generation failed');
            }

            // Navigate to gallery on success
            router.push('/gallery');
            reset();
        } catch (error) {
            console.error('Generation error:', error);
            // For demo, still navigate after delay
            await new Promise(resolve => setTimeout(resolve, 3000));
            router.push('/gallery');
            reset();
        } finally {
            setIsGenerating(false);
        }
    };

    const canProceed = () => {
        switch (step) {
            case 1: return selectedFaceProfile !== null;
            case 2: return selectedStyle !== null;
            case 3: return true;
            default: return true;
        }
    };

    if (isGenerating) {
        return <LoadingScreen message="Building your best look…" />;
    }

    return (
        <div className="max-w-md mx-auto pb-30">
            {/* Header */}
            <header className="sticky top-0 z-50 glass-strong safe-area-top">
                <div className="flex items-center justify-between px-4 py-3">
                    <button
                        onClick={() => step > 1 ? prevStep() : router.back()}
                        className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div className="text-center">
                        <p className="text-xs text-muted-foreground">Step {step} of 4</p>
                        <h1 className="font-semibold">{stepTitles[step - 1]}</h1>
                    </div>
                    <div className="w-10" /> {/* Spacer for alignment */}
                </div>

                {/* Progress bar */}
                <div className="h-1 bg-secondary">
                    <motion.div
                        className="h-full gradient-primary"
                        initial={{ width: 0 }}
                        animate={{ width: `${(step / 4) * 100}%` }}
                        transition={{ duration: 0.3 }}
                    />
                </div>
            </header>

            {/* Content */}
            <main className="px-4 py-6">
                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <FaceUpload
                                existingProfiles={profiles}
                                selectedProfile={selectedFaceProfile}
                                onSelectProfile={setSelectedFaceProfile}
                                onUpload={handleUpload}
                            />
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <StyleGrid
                                styles={styles}
                                selectedStyle={selectedStyle}
                                onSelectStyle={setSelectedStyle}
                                onLockedStyleTap={() => openSubscriptionModal()}
                                isPro={isPro}
                            />
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <VibeControls
                                energyLevel={energyLevel}
                                realismLevel={realismLevel}
                                options={options}
                                onEnergyChange={setEnergyLevel}
                                onRealismChange={setRealismLevel}
                                onOptionChange={setOption}
                            />
                        </motion.div>
                    )}

                    {step === 4 && (
                        <motion.div
                            key="step4"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="text-center py-8"
                        >
                            <h2 className="text-2xl font-bold text-white mb-4">Ready to Create!</h2>
                            <p className="text-muted-foreground mb-8">
                                Your photo will be generated with:<br />
                                <span className="text-white font-medium">{selectedStyle?.name}</span> style
                            </p>

                            {/* Preview */}
                            <div className="relative mx-auto w-full rounded-2xl overflow-hidden mb-8">
                                {selectedFaceProfile && (
                                    <img
                                        src={selectedFaceProfile.imageUrl}
                                        alt="Your face"
                                        className="w-full h-full object-cover"
                                    />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                <div className="absolute bottom-3 left-3 right-3">
                                    <p className="text-sm text-white/80">+ {selectedStyle?.name}</p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Bottom actions */}
            <div className="fixed bottom-18 left-0 right-0 p-4 safe-area-bottom max-w-md mx-auto">
                {step < 4 ? (
                    <Button
                        onClick={nextStep}
                        disabled={!canProceed()}
                        className="w-full h-14 text-lg font-semibold gradient-primary disabled:opacity-50"
                    >
                        Continue
                        <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                ) : (
                    <Button
                        onClick={handleGenerate}
                        className="w-full h-14 text-lg font-semibold gradient-primary animate-pulse-glow"
                    >
                        ✨ Generate Photo
                    </Button>
                )}
            </div>
        </div>
    );
}
