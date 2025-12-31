"use client";

import { use, useState } from "react";
import { useUser, SignInButton } from "@clerk/nextjs";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Heart,
  Download,
  RefreshCw,
  Sparkles,
  Share2,
  LogIn,
  Image,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/gallery/stat-card";
import { AIInsights } from "@/components/gallery/ai-insights";
import { useRouter } from "next/navigation";
import { useGalleryStore, useModalStore } from "@/lib/stores";

const categoryColors: Record<string, string> = {
  dating: "bg-pink-500/20 text-pink-300",
  work: "bg-blue-500/20 text-blue-300",
  social: "bg-purple-500/20 text-purple-300",
  anonymous: "bg-slate-500/20 text-slate-300",
  creative: "bg-orange-500/20 text-orange-300",
  travel: "bg-cyan-500/20 text-cyan-300",
};

export default function PhotoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { isSignedIn, isLoaded } = useUser();
  const { photos, toggleFavorite } = useGalleryStore();
  const { openEnhancementModal } = useModalStore();

  // Loading state
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-white/20 border-t-brand-orange rounded-full animate-spin" />
      </div>
    );
  }

  // Guest state
  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="p-4 safe-area-top">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
        </header>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 flex flex-col items-center justify-center px-4 text-center"
        >
          <div className="p-6 rounded-full gradient-warm mb-6 glow">
            <Image className="w-12 h-12 text-white" />
          </div>

          <h2 className="text-2xl font-bold text-white mb-3">
            Sign In to View Photo
          </h2>
          <p className="text-muted-foreground max-w-xs mb-8">
            Sign in to view photo details, stats, and AI insights
          </p>

          <SignInButton mode="modal">
            <Button className="px-8 py-6 rounded-full gradient-warm text-white font-semibold text-lg shadow-lg glow">
              <LogIn className="w-5 h-5 mr-2" />
              Sign In
            </Button>
          </SignInButton>
        </motion.div>
      </div>
    );
  }

  // Find photo in store
  const photo = photos.find((p) => p.id === id);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (!photo) return;

    setIsDownloading(true);
    try {
      const filename = `${photo.title || "photo"}-${photo.id}.jpg`;
      const downloadUrl = `/api/download?url=${encodeURIComponent(
        photo.imageUrl
      )}&filename=${encodeURIComponent(filename)}`;

      const response = await fetch(downloadUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download image:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  // Photo not found
  if (!photo) {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="p-4 safe-area-top">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center px-4 text-center">
          <div className="p-6 rounded-full bg-secondary mb-6">
            <Image className="w-12 h-12 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Photo Not Found</h2>
          <p className="text-muted-foreground mb-6">
            This photo may have been deleted
          </p>
          <Button onClick={() => router.push("/")} variant="outline">
            Back to Gallery
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      {/* Photo header with back button */}
      <div className="relative">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative aspect-[4/5]"
        >
          <img
            src={photo.imageUrl}
            alt={photo.title || "Generated photo"}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-black/30" />

          {/* Top bar */}
          <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between safe-area-top">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/60 transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>
            <div className="flex gap-2">
              <button className="p-2 rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/60 transition-colors">
                <Share2 className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Bottom info */}
          <div className="absolute bottom-20 left-0 right-0 p-4">
            <Badge
              className={`${categoryColors[photo.category]} border-0 mb-2`}
            >
              {photo.category}
            </Badge>
            {photo.title && (
              <h1 className="text-2xl font-bold text-white">{photo.title}</h1>
            )}
          </div>
        </motion.div>
      </div>

      {/* Content */}
      <div className="px-4 py-6 space-y-6">
        {/* AI Insights */}
        {photo.insights && <AIInsights insights={photo.insights} />}

        {/* Stats */}
        {photo.stats && <StatCard stats={photo.stats} />}

        {/* Info */}
        <div className="p-4 rounded-2xl glass space-y-3">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Generation Details
          </h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground">Energy</p>
              <p className="text-white font-medium">
                {photo.energyLevel && photo.energyLevel < 33
                  ? "Soft"
                  : photo.energyLevel && photo.energyLevel < 66
                  ? "Balanced"
                  : "Bold"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Realism</p>
              <p className="text-white font-medium capitalize">
                {photo.realismLevel}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Created</p>
              <p className="text-white font-medium">
                {photo.createdAt.toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Watermark</p>
              <p className="text-white font-medium">
                {photo.isWatermarked ? "Yes" : "No"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom actions */}
      <div className="fixed bottom-30 left-0 right-0 p-4 safe-area-bottom max-w-md mx-auto">
        <div className="flex gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => toggleFavorite(photo.id)}
            className="h-14 w-14 rounded-2xl bg-secondary"
          >
            <Heart
              className={`w-6 h-6 ${
                photo.isFavorite ? "text-pink-500 fill-pink-500" : "text-white"
              }`}
            />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-14 w-14 rounded-2xl bg-secondary"
            onClick={handleDownload}
            disabled={isDownloading}
          >
            {isDownloading ? (
              <Loader2 className="w-6 h-6 text-white animate-spin" />
            ) : (
              <Download className="w-6 h-6 text-white" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-14 w-14 rounded-2xl bg-secondary"
          >
            <RefreshCw className="w-6 h-6 text-white" />
          </Button>
          <Button
            onClick={() => openEnhancementModal(photo)}
            className="flex-1 h-14 gap-2 gradient-warm text-lg font-semibold"
          >
            <Sparkles className="w-5 h-5" />
            Enhance
          </Button>
        </div>
      </div>
    </div>
  );
}
