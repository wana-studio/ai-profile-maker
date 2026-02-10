"use client";

import { use, useState, useEffect } from "react";
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
import {
  useGalleryStore,
  useModalStore,
  useSubscriptionStore,
} from "@/lib/stores";
import { trackEvent, usePostHog } from "@/lib/posthog";
import { toast } from "sonner";
import { Capacitor } from "@capacitor/core";
import { Directory, Filesystem } from "@capacitor/filesystem";
import { FileTransfer } from "@capacitor/file-transfer";
import { ShareHandler } from "@/lib/plugins/share-handler";

const categoryColors: Record<string, string> = {
  dating: "bg-pink-500/20 text-pink-300",
  work: "bg-blue-500/20 text-blue-300",
  social: "bg-purple-500/20 text-purple-300",
  anonymous: "bg-slate-500/20 text-slate-300",
  creative: "bg-orange-500/20 text-orange-300",
  travel: "bg-cyan-500/20 text-cyan-300",
};

/**
 * Extracts filename from image URL
 */
const getImageFileName = (url: string): { fileName: string } => {
  try {
    const urlObj = new URL(url);
    const pathSegments = urlObj.pathname.split("/");
    let fileName =
      pathSegments[pathSegments.length - 1] || `image-${Date.now()}.png`;

    if (!fileName.includes(".")) {
      fileName = `${fileName}.png`;
    }

    return { fileName };
  } catch {
    return { fileName: `image-${Date.now()}.png` };
  }
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
  const { tier } = useSubscriptionStore();
  const posthog = usePostHog();
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  // Find photo in store
  const photo = photos.find((p) => p.id === id);

  // Track photo detail viewed
  useEffect(() => {
    if (photo && isSignedIn) {
      trackEvent("photo_detail_viewed", {
        photoId: photo.id,
        styleCategory: photo.category,
        isFavorite: photo.isFavorite,
        isWatermarked: photo.isWatermarked,
        tier,
      });
    }
  }, [photo?.id, isSignedIn, posthog, tier, photo]);

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

  const handleDownload = async () => {
    if (!photo) return;

    // Track download initiated
    trackEvent("photo_download_initiated", {
      photoId: photo.id,
      styleCategory: photo.category,
      isWatermarked: photo.isWatermarked,
      tier,
    });

    setIsDownloading(true);
    const loadingToast = toast.loading("Downloading image...");

    try {
      // Use Capacitor FileTransfer for native platforms
      if (Capacitor.isNativePlatform()) {
        try {
          const { fileName } = getImageFileName(photo.imageUrl);

          const directory =
            Capacitor.getPlatform() === "android"
              ? Directory.ExternalStorage
              : Directory.Documents;

          const path =
            Capacitor.getPlatform() === "android"
              ? `Pictures/Selfio/${fileName}`
              : `selfio/${fileName}`;

          const fileInfo = await Filesystem.getUri({
            directory,
            path,
          });

          await FileTransfer.downloadFile({
            url: photo.imageUrl,
            path: fileInfo.uri,
          });

          toast.dismiss(loadingToast);
          toast.success("Image saved successfully");
          setIsDownloading(false);
          return;
        } catch (nativeError) {
          console.error("Native download failed:", nativeError);
          toast.dismiss(loadingToast);
          toast.error(
            `Download failed: ${nativeError instanceof Error ? nativeError.message : "Unknown error"}`
          );
          setIsDownloading(false);
          return;
        }
      }

      // Web fallback
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

      toast.dismiss(loadingToast);
      toast.success("Image downloaded");
    } catch (error) {
      console.error("Failed to download image:", error);
      toast.dismiss(loadingToast);
      toast.error("Failed to download image");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = async () => {
    if (!photo) return;

    // Track share initiated
    trackEvent("photo_share_initiated", {
      photoId: photo.id,
      styleCategory: photo.category,
      tier,
    });

    setIsSharing(true);

    try {
      // Use Capacitor ShareHandler for native platforms
      if (Capacitor.isNativePlatform()) {
        const canShare = await ShareHandler.canShare();
        let fileUri = photo.imageUrl;

        try {
          const { fileName } = getImageFileName(photo.imageUrl);

          const directory =
            Capacitor.getPlatform() === "android"
              ? Directory.ExternalStorage
              : Directory.Documents;

          const path =
            Capacitor.getPlatform() === "android"
              ? `Pictures/Selfio/${fileName}`
              : `selfio/${fileName}`;

          const fileInfo = await Filesystem.getUri({
            directory,
            path,
          });

          const file = await FileTransfer.downloadFile({
            url: photo.imageUrl,
            path: fileInfo.uri,
          });
          fileUri = file.path || photo.imageUrl;
        } catch (downloadError) {
          console.error("Failed to download image for sharing:", downloadError);
        }

        if (canShare.value) {
          await ShareHandler.share({
            title: "Selfio - AI Generated Photo",
            url: fileUri,
          });
        } else if (navigator?.clipboard) {
          await navigator.clipboard.writeText(photo.imageUrl);
          toast.success("Image link copied to clipboard");
        } else {
          window.open(photo.imageUrl, "_blank");
        }

        setIsSharing(false);
        return;
      }

      // Web fallback
      const response = await fetch(photo.imageUrl);
      const blob = await response.blob();
      const filename =
        photo.imageUrl.split("/").pop() || "selfio-generated-photo.jpg";
      const file = new File([blob], filename, { type: blob.type });

      if (
        navigator.share &&
        navigator.canShare &&
        navigator.canShare({ files: [file] })
      ) {
        await navigator.share({
          title: "Selfio - AI Generated Photo",
          files: [file],
        });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(photo.imageUrl);
        toast.success("Image link copied to clipboard");
      } else {
        window.open(photo.imageUrl, "_blank");
      }
    } catch (error) {
      console.error("Failed to share image:", error);
      toast.error("Share failed");
    } finally {
      setIsSharing(false);
    }
  };

  const handleToggleFavorite = () => {
    if (!photo) return;

    toggleFavorite(photo.id);

    // Track favorite toggled
    trackEvent("photo_favorited", {
      photoId: photo.id,
      styleCategory: photo.category,
      isFavorite: !photo.isFavorite,
      tier,
    });
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
              <button
                onClick={handleShare}
                disabled={isSharing}
                className="p-2 rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/60 transition-colors disabled:opacity-50"
              >
                {isSharing ? (
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                ) : (
                  <Share2 className="w-5 h-5 text-white" />
                )}
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
            onClick={handleToggleFavorite}
            className="h-14 w-14 rounded-2xl bg-secondary"
          >
            <Heart
              className={`w-6 h-6 ${photo.isFavorite ? "text-pink-500 fill-pink-500" : "text-white"
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
