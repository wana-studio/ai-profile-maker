"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

const categories = [
  { id: "all", label: "All" },
  { id: "dating", label: "Dating" },
  { id: "work", label: "Work" },
  { id: "social", label: "Social" },
  { id: "anonymous", label: "Anonymous" },
  { id: "creative", label: "Creative" },
  { id: "travel", label: "Travel" },
] as const;

type CategoryId = (typeof categories)[number]["id"];

interface CategoryChipsProps {
  selected: CategoryId;
  onSelect: (category: CategoryId) => void;
}

export function CategoryChips({ selected, onSelect }: CategoryChipsProps) {
  return (
    <div className="sticky top-14 z-40 bg-background/80 backdrop-blur-xl py-3">
      <ScrollArea className="w-full">
        <div className="flex gap-2 px-4">
          {categories.map((category) => {
            const isSelected = selected === category.id;

            return (
              <button
                key={category.id}
                onClick={() => onSelect(category.id)}
                className="relative touch-active rounded-full"
              >
                {isSelected && (
                  <motion.div
                    layoutId="categoryChip"
                    className="absolute inset-0 rounded-full gradient-warm"
                    transition={{ type: "spring", duration: 0.4 }}
                  />
                )}
                <span
                  className={`relative z-10 inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                    isSelected
                      ? "text-white"
                      : "text-muted-foreground bg-foreground/10 hover:text-foreground"
                  }`}
                >
                  {category.label}
                </span>
              </button>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" className="invisible" />
      </ScrollArea>
    </div>
  );
}
