"use client";

import { motion } from "framer-motion";
import { PhotoCard } from "./photo-card";
import type { GeneratedPhoto } from "@/lib/db/schema";
import Image from "next/image";
import { Button } from "../ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { GuestState } from "@/components/home/guest-state";

interface PhotoGridProps {
  photos: GeneratedPhoto[];
  onPhotoTap: (photo: GeneratedPhoto) => void;
  onFavorite: (id: string) => void;
  viewMode: "grid" | "feed";
  selectedCategory: string;
}

export function PhotoGrid({
  photos,
  onPhotoTap,
  onFavorite,
  viewMode,
  selectedCategory,
}: PhotoGridProps) {
  if (photos.length === 0) {
    return <GuestState selectedCategory={selectedCategory} />;
  }

  return (
    <div
      key={viewMode}
      className={cn(
        "grid gap-3 p-4",
        viewMode === "feed" ? "grid-cols-1" : "grid-cols-2"
      )}
    >
      {photos.map((photo, index) => (
        <motion.div
          key={photo.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.05 }}
        >
          <PhotoCard
            photo={photo}
            variant={viewMode}
            onTap={() => onPhotoTap(photo)}
            onFavorite={() => onFavorite(photo.id)}
          />
        </motion.div>
      ))}
    </div>
  );
}
