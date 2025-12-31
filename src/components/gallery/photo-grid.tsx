"use client";

import { motion } from "framer-motion";
import { PhotoCard } from "./photo-card";
import type { GeneratedPhoto } from "@/lib/db/schema";
import Image from "next/image";
import { Button } from "../ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface PhotoGridProps {
  photos: GeneratedPhoto[];
  onPhotoTap: (photo: GeneratedPhoto) => void;
  onFavorite: (id: string) => void;
  viewMode: "grid" | "feed";
}

export function PhotoGrid({
  photos,
  onPhotoTap,
  onFavorite,
  viewMode,
}: PhotoGridProps) {
  if (photos.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-16 px-4 text-center"
      >
        <div className="relative flex items-center justify-center">
          <Image
            src="/images/img-right.png"
            alt="Profile"
            width={106}
            height={113}
            className="absolute -right-12 w-[106px] h-[113px] object-cover rounded-[30px] rotate-6 opacity-40"
          />
          <Image
            src="/images/img-left.png"
            alt="Profile"
            width={106}
            height={113}
            className="absolute -left-12 w-[106px] h-[113px] object-cover rounded-[30px] -rotate-6 opacity-40"
          />

          <div className="p-3 rounded-[40px] bg-foreground/5 backdrop-blur-2xl relative">
            <div
              className="rounded-[30px]"
              style={{
                boxShadow: "0px 33.75px 47.25px 0px #FD491326",
              }}
            >
              <Image
                src="/images/img-center.png"
                alt="Profile"
                width={131}
                height={140}
                className="w-[131px] h-[140px] object-cover rounded-[30px]"
              />
            </div>
          </div>
        </div>

        <h2 className="mt-10 text-2xl font-bold text-white">
          Look like someone
          <br /> people trust
        </h2>
        <p className="text-muted-foreground font-medium max-w-xs mt-2.5">
          Your professional LinkedIn photo
        </p>

        <Link href="/create">
          <Button className="px-8 py-6 rounded-full gradient-warm text-white font-semibold text-lg mt-5">
            Create it
          </Button>
        </Link>
      </motion.div>
    );
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
