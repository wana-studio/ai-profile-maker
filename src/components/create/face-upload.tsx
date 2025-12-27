'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Camera, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { FaceProfile } from '@/lib/db/schema';

interface FaceUploadProps {
    existingProfiles: FaceProfile[];
    selectedProfile: FaceProfile | null;
    onSelectProfile: (profile: FaceProfile | null) => void;
    onUpload: (file: File) => Promise<void>;
}

export function FaceUpload({
    existingProfiles,
    selectedProfile,
    onSelectProfile,
    onUpload
}: FaceUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadPreview, setUploadPreview] = useState<string | null>(null);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) return;

        // Show preview
        const reader = new FileReader();
        reader.onload = () => {
            setUploadPreview(reader.result as string);
        };
        reader.readAsDataURL(file);

        setIsUploading(true);
        try {
            await onUpload(file);
        } finally {
            setIsUploading(false);
        }
    }, [onUpload]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png', '.webp']
        },
        maxFiles: 1,
        maxSize: 10 * 1024 * 1024, // 10MB
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-2">Choose Your Face</h2>
                <p className="text-muted-foreground">
                    Upload once. Reuse forever.
                </p>
            </div>

            {/* Existing profiles */}
            {existingProfiles.length > 0 && (
                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-foreground">Saved Profiles</h3>
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                        {existingProfiles.map((profile) => (
                            <motion.button
                                key={profile.id}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => onSelectProfile(profile)}
                                className={`relative flex-shrink-0 w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all ${selectedProfile?.id === profile.id
                                    ? 'border-brand-purple glow-sm'
                                    : 'border-transparent'
                                    }`}
                            >
                                <img
                                    src={profile.thumbnailUrl || profile.imageUrl}
                                    alt={profile.name}
                                    className="w-full h-full object-cover"
                                />
                                {selectedProfile?.id === profile.id && (
                                    <div className="absolute inset-0 bg-brand-purple/30 flex items-center justify-center">
                                        <Check className="w-6 h-6 text-white" />
                                    </div>
                                )}
                            </motion.button>
                        ))}
                    </div>
                </div>
            )}

            {/* Upload area */}
            <div
                {...getRootProps()}
                className={`relative group cursor-pointer ${isDragActive ? 'scale-[1.02]' : ''
                    } transition-transform`}
            >
                <input {...getInputProps()} />

                <AnimatePresence mode="wait">
                    {uploadPreview ? (
                        <motion.div
                            key="preview"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="relative aspect-square rounded-3xl overflow-hidden"
                        >
                            <img
                                src={uploadPreview}
                                alt="Upload preview"
                                className="w-full h-full object-cover"
                            />
                            {isUploading && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                    <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                                </div>
                            )}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setUploadPreview(null);
                                }}
                                className="absolute top-3 right-3 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
                            >
                                <X className="w-5 h-5 text-white" />
                            </button>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="upload"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className={`h-64 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center gap-4 transition-colors ${isDragActive
                                ? 'border-brand-purple bg-brand-purple/10'
                                : 'border-muted-foreground/30 hover:border-muted-foreground/50'
                                }`}
                        >
                            <div className="p-4 rounded-full gradient-primary opacity-80">
                                <Upload className="w-8 h-8 text-white" />
                            </div>
                            <div className="text-center px-4">
                                <p className="text-white font-medium mb-1">
                                    {isDragActive ? 'Drop your selfie here' : 'Upload a selfie'}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Clear, front-facing photo works best
                                </p>
                            </div>
                            <Button variant="outline" className="gap-2">
                                <Camera className="w-4 h-4" />
                                Choose Photo
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <span className="text-xl font-semibold my-4 block text-center">Tips for best result:</span>
            <div className="flex gap-4 p-4 rounded-2xl bg-secondary/50">
                <div className="flex-1 text-center">
                    <span className="text-2xl">😊</span>
                    <p className="text-xs text-muted-foreground mt-1">Good lighting</p>
                </div>
                <div className="flex-1 text-center">
                    <span className="text-2xl">👤</span>
                    <p className="text-xs text-muted-foreground mt-1">Face centered</p>
                </div>
                <div className="flex-1 text-center">
                    <span className="text-2xl">📸</span>
                    <p className="text-xs text-muted-foreground mt-1">High quality</p>
                </div>
            </div>
        </div>
    );
}
