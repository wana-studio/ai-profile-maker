'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Shirt, Sparkles, Sun, Zap, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useModalStore, useSubscriptionStore } from '@/lib/stores';

const enhancementOptions = [
    {
        id: 'clothes',
        icon: Shirt,
        label: 'Change clothes',
        description: 'AI picks a stylish outfit',
        premium: false
    },
    {
        id: 'lighting',
        icon: Sun,
        label: 'Better lighting',
        description: 'Same pose, enhanced lighting',
        premium: false
    },
    {
        id: 'enhance',
        icon: Sparkles,
        label: 'Slight enhancement',
        description: 'Subtle face improvements',
        premium: true
    },
    {
        id: 'hot',
        icon: Zap,
        label: 'Hotter but believable',
        description: 'Enhanced attractiveness',
        premium: true
    },
];

interface EnhancementModalProps {
    onEnhance?: (type: string) => void;
}

export function EnhancementModal({ onEnhance }: EnhancementModalProps) {
    const { isEnhancementModalOpen, closeEnhancementModal, selectedPhotoForEnhancement, openSubscriptionModal } = useModalStore();
    const { tier } = useSubscriptionStore();
    const isPro = tier === 'pro';

    const handleEnhanceClick = (optionId: string, isPremium: boolean) => {
        if (isPremium && !isPro) {
            closeEnhancementModal();
            openSubscriptionModal();
            return;
        }
        onEnhance?.(optionId);
        closeEnhancementModal();
    };

    return (
        <AnimatePresence>
            {isEnhancementModalOpen && selectedPhotoForEnhancement && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeEnhancementModal}
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 100 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed inset-x-4 bottom-4 z-50 max-w-lg mx-auto"
                    >
                        <div className="rounded-3xl glass-strong border border-white/10 overflow-hidden">
                            {/* Header with photo preview */}
                            <div className="relative h-40 overflow-hidden">
                                <img
                                    src={selectedPhotoForEnhancement.imageUrl}
                                    alt="Photo to enhance"
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
                                <button
                                    onClick={closeEnhancementModal}
                                    className="absolute top-4 right-4 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
                                >
                                    <X className="w-5 h-5 text-white" />
                                </button>
                                <div className="absolute bottom-4 left-4">
                                    <h2 className="text-xl font-bold text-white">Enhance Photo</h2>
                                    <p className="text-sm text-white/70">Choose an enhancement</p>
                                </div>
                            </div>

                            {/* Options */}
                            <div className="p-4 space-y-2">
                                {enhancementOptions.map((option, index) => {
                                    const isLocked = option.premium && !isPro;
                                    const Icon = option.icon;

                                    return (
                                        <motion.button
                                            key={option.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            onClick={() => handleEnhanceClick(option.id, option.premium)}
                                            className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-colors ${isLocked
                                                    ? 'bg-white/5 opacity-60'
                                                    : 'bg-white/5 hover:bg-white/10'
                                                }`}
                                        >
                                            <div className={`p-2 rounded-xl ${isLocked ? 'bg-secondary' : 'gradient-secondary'}`}>
                                                <Icon className="w-5 h-5 text-white" />
                                            </div>
                                            <div className="flex-1 text-left">
                                                <p className="font-medium text-white flex items-center gap-2">
                                                    {option.label}
                                                    {option.premium && (
                                                        <span className="text-xs px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                                                            PRO
                                                        </span>
                                                    )}
                                                </p>
                                                <p className="text-sm text-muted-foreground">{option.description}</p>
                                            </div>
                                            {isLocked && <Lock className="w-5 h-5 text-muted-foreground" />}
                                        </motion.button>
                                    );
                                })}
                            </div>

                            {/* Cancel button */}
                            <div className="p-4 pt-0">
                                <Button
                                    variant="ghost"
                                    onClick={closeEnhancementModal}
                                    className="w-full"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
