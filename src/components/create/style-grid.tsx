"use client";

import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Style } from "@/lib/db/schema";
import { Carousel, CarouselContent, CarouselItem } from "../ui/carousel";
import Image from "next/image";

interface StyleGridProps {
  styles: Style[];
  selectedStyle: Style | null;
  onSelectStyle: (style: Style) => void;
  onLockedStyleTap: (style: Style) => void;
  isPro: boolean;
}

export function StyleGrid({
  styles,
  selectedStyle,
  onSelectStyle,
  onLockedStyleTap,
  isPro,
}: StyleGridProps) {
  // Group styles by category
  const groupedStyles = styles.reduce((acc, style) => {
    const category = style.category;
    if (!acc[category]) acc[category] = [];
    acc[category].push(style);
    return acc;
  }, {} as Record<string, Style[]>);

  const categoryLabels: Record<string, string> = {
    dating: "💕 Dating App Pack",
    work: "💼 Professional",
    social: "📱 Social Media",
    anonymous: "🎭 Anonymous",
    creative: "🎨 Creative",
    travel: "✈️ Travel & Lifestyle",
  };

  return (
    <div className="space-y-6">
      {/* Style categories */}
      {Object.entries(groupedStyles).map(([category, categoryStyles]) => (
        <div key={category} className="space-y-3">
          <h3 className="font-bold">{categoryLabels[category] || category}</h3>
          <Carousel
            opts={{
              align: "start",
            }}
            className="w-full"
          >
            <CarouselContent>
              {categoryStyles.map((style, index) => {
                const isLocked = style.isPremium && !isPro;
                const isSelected = selectedStyle?.id === style.id;

                return (
                  <CarouselItem key={style.id} className="basis-[45%]">
                    <div className="p-1">
                      <motion.button
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => {
                          if (isLocked) {
                            onLockedStyleTap(style);
                          } else {
                            onSelectStyle(style);
                          }
                        }}
                        className={`relative aspect-[3/4] rounded-2xl overflow-hidden transition-all ${
                          isSelected
                            ? "ring-4 ring-brand-orange ring-offset-0 ring-offset-background"
                            : ""
                        } ${isLocked ? "opacity-70" : ""}`}
                      >
                        {/* Style cover image */}
                        <Image
                          src={style.coverImageUrl}
                          alt={style.name}
                          width={1080}
                          height={1080}
                          className="w-full h-full object-cover"
                        />

                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                        {/* Lock icon for premium */}
                        {isLocked && (
                          <div className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50">
                            <Lock className="w-4 h-4 text-white" />
                          </div>
                        )}

                        {/* Premium badge */}
                        {style.isPremium && (
                          <Badge className="absolute top-2 left-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 text-xs">
                            PRO
                          </Badge>
                        )}

                        {/* Style name */}
                        <div className="absolute bottom-3 left-0 right-0">
                          <p className="font-bold text-white">{style.name}</p>
                        </div>

                        {/* Selected indicator */}
                        {isSelected && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute inset-0 flex items-start justify-start p-2"
                          >
                            <div className="p-2 rounded-full bg-brand-orange">
                              <svg
                                className="w-5 h-5 text-white"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={3}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            </div>
                          </motion.div>
                        )}
                      </motion.button>
                    </div>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
          </Carousel>
        </div>
      ))}
    </div>
  );
}
