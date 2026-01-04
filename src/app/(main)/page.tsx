"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CategoryChips } from "@/components/home/category-chips";
import { PhotoGrid } from "@/components/gallery/photo-grid";
import {
  useGalleryStore,
  useModalStore,
  useSubscriptionStore,
} from "@/lib/stores";
import { useRouter } from "next/navigation";
import type { GeneratedPhoto } from "@/lib/db/schema";
import Image from "next/image";
import { LayoutGridIcon, ListIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { CircularProgress } from "@/components/customized/progress/circular-progress";
import { usePostHog, setUserProperties, trackEvent } from "@/lib/posthog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { GuestState } from "@/components/home/guest-state";

type CategoryId =
  | "all"
  | "dating"
  | "work"
  | "social"
  | "anonymous"
  | "creative"
  | "travel";

export default function GalleryPage() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useUser();
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>("all");
  const { photos, setPhotos, toggleFavorite } = useGalleryStore();
  const {
    tier,
    generationsThisMonth,
    setTier,
    setGenerationsRemaining,
    setGenerationsThisMonth,
  } = useSubscriptionStore();
  const [isLoadingPhotos, setIsLoadingPhotos] = useState(true);
  const posthog = usePostHog();

  // Load subscription status when signed in
  useEffect(() => {
    if (isSignedIn) {
      fetch("/api/subscription")
        .then((res) => res.json())
        .then((data) => {
          if (data.tier) {
            setTier(data.tier);
          }
          if (data.generationsRemaining !== undefined) {
            setGenerationsRemaining(
              data.generationsRemaining === Infinity
                ? 999
                : data.generationsRemaining
            );
          }
          if (data.generationsThisMonth !== undefined) {
            setGenerationsThisMonth(data.generationsThisMonth);
          }

          // Set user properties in PostHog
          setUserProperties({
            subscription_tier: data.tier,
            generations_this_month: data.generationsThisMonth,
            generations_remaining:
              data.generationsRemaining === Infinity
                ? 999
                : data.generationsRemaining,
          });
        })
        .catch((err) => console.error("Failed to load subscription:", err));
    }
  }, [isSignedIn, setTier, setGenerationsRemaining, setGenerationsThisMonth]);

  // Handle loading state for non-signed-in users
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      setIsLoadingPhotos(false);
    }
  }, [isLoaded, isSignedIn]);

  // Load photos from database
  useEffect(() => {
    if (!isSignedIn) {
      return;
    }

    let isMounted = true;

    const loadPhotos = async () => {
      try {
        const res = await fetch("/api/photos");
        const data = await res.json();

        if (isMounted && data.photos) {
          // Convert date strings back to Date objects
          const photosWithDates = data.photos.map((photo: GeneratedPhoto) => ({
            ...photo,
            createdAt: new Date(photo.createdAt),
          }));
          setPhotos(photosWithDates);

          // Track gallery viewed event
          trackEvent("gallery_viewed", {
            photoCount: photosWithDates.length,
            tier,
          });

          // Set user property for total photos count
          setUserProperties({
            total_photos_count: photosWithDates.length,
            has_uploaded_face: photosWithDates.length > 0,
          });
        }
      } catch (err) {
        console.error("Failed to load photos:", err);
      } finally {
        if (isMounted) {
          setIsLoadingPhotos(false);
        }
      }
    };

    loadPhotos();

    return () => {
      isMounted = false;
    };
  }, [isSignedIn, setPhotos, posthog, tier]);

  const filteredPhotos =
    selectedCategory === "all"
      ? photos
      : photos.filter((p) => p.category === selectedCategory);

  const [viewMode, setViewMode] = useState<"grid" | "feed">("grid");

  // Handle view mode change with tracking
  const handleViewModeChange = (mode: "grid" | "feed") => {
    setViewMode(mode);
    trackEvent("view_mode_changed", {
      viewMode: mode,
      photoCount: photos.length,
      tier,
    });
  };

  // Handle category change with tracking
  const handleCategoryChange = (category: CategoryId) => {
    setSelectedCategory(category);
    const filtered =
      category === "all"
        ? photos
        : photos.filter((p) => p.category === category);
    trackEvent("category_changed", {
      category,
      photoCount: photos.length,
      filteredPhotoCount: filtered.length,
      tier,
    });
  };

  // Handle photo click with tracking
  const handlePhotoClick = (photo: GeneratedPhoto) => {
    trackEvent("photo_clicked", {
      photoId: photo.id,
      category: photo.category,
      styleCategory: photo.category,
      tier,
    });
    router.push(`/gallery/${photo.id}`);
  };

  const viewModes = [
    {
      id: "feed" as const,
      icon: ListIcon,
    },
    {
      id: "grid" as const,
      icon: LayoutGridIcon,
    },
  ];

  // Calculate progress values
  const FREE_MONTHLY_LIMIT = 3;
  const isPro = tier === "pro";
  const maxGenerations = isPro ? 500 : FREE_MONTHLY_LIMIT;
  const usedGenerations = isPro ? generationsThisMonth : generationsThisMonth;
  const remainingGenerations = maxGenerations - usedGenerations;
  const progressValue = isPro
    ? 0
    : (remainingGenerations / maxGenerations) * 100;

  return (
    <div>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl safe-area-top">
        <div className="grid grid-cols-[1fr_auto_1fr] px-4 py-3">
          <div className="flex items-center justify-start">
            {isSignedIn && !isPro && (
              <div className="bg-foreground/10 rounded-full p-1 h-[36px] flex items-center justify-center gap-1">
                <div className="size-[24px] flex items-center justify-center overflow-hidden">
                  <CircularProgress
                    value={progressValue}
                    size={40}
                    strokeWidth={6}
                    className="stroke-foreground/25"
                    progressClassName="stroke-brand-orange"
                  />
                </div>
                <span className="text-xs text-brand-orange">
                  {remainingGenerations}/{maxGenerations}
                </span>
              </div>
            )}
          </div>

          <h1 className="text-xl font-bold text-white">Gallery AI</h1>
          <div className="flex items-center justify-end">
            <div className="bg-foreground/10 rounded-full grid grid-cols-2 p-1">
              {viewModes.map((mode) => (
                <button
                  key={mode.id}
                  className={cn(
                    "rounded-full px-3 py-1.5 transition-colors duration-300",
                    viewMode === mode.id && "bg-foreground/20"
                  )}
                  onClick={() => handleViewModeChange(mode.id)}
                >
                  <mode.icon className="size-4" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Category chips */}
      <CategoryChips
        selected={selectedCategory}
        onSelect={handleCategoryChange}
      />

      {/* Content */}
      {!isLoaded || isLoadingPhotos ? (
        <LoadingState />
      ) : !isSignedIn ? (
        <GuestState selectedCategory={selectedCategory} />
      ) : (
        <PhotoGrid
          photos={filteredPhotos}
          viewMode={viewMode}
          onPhotoTap={handlePhotoClick}
          onFavorite={toggleFavorite}
          selectedCategory={selectedCategory}
        />
      )}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-12 h-12 border-4 border-white/20 border-t-brand-orange rounded-full animate-spin" />
    </div>
  );
}


