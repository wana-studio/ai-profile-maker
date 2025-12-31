"use client";

import type { RealismLevel } from "@/lib/stores";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CheckIcon } from "lucide-react";
import Image from "next/image";

interface VibeControlsProps {
  energyLevel: number;
  realismLevel: RealismLevel;
  options: {
    changeOutfit: boolean;
    changeHairstyle: boolean;
    addGlasses: boolean;
    addBeard: boolean;
    hairStyle: string | null;
  };
  onEnergyChange: (value: number) => void;
  onRealismChange: (level: RealismLevel) => void;
  onOptionChange: (
    key: keyof VibeControlsProps["options"],
    value: boolean | string | null
  ) => void;
}

type HairstyleOption = {
  name: string;
  img: string;
  value: string;
};

const hairstyleOptions: HairstyleOption[] = [
  {
    name: "Medium Wavy",
    img: "hair_medium_wavy.png",
    value: "medium_wavy",
  },
  {
    name: "Messy Short",
    img: "hair_messy_short.png",
    value: "messy_short",
  },
  {
    name: "Classic Side Part",
    img: "hair_classic_side_part.png",
    value: "classic_side_part",
  },
  {
    name: "Long Straight",
    img: "hair_long_straight.png",
    value: "long_straight",
  },
  {
    name: "Curly Short",
    img: "hair_curly_short.png",
    value: "curly_short",
  },
  {
    name: "Buzz Cut",
    img: "hair_buzz_cut.png",
    value: "buzz_cut",
  },
  {
    name: "Bald",
    img: "hair_bald.png",
    value: "bald",
  },
];

const realismOptions: {
  value: RealismLevel;
  label: string;
  description: string;
  warning?: boolean;
}[] = [
  {
    value: "natural",
    label: "Dont change face",
    description: "Keep your natural features",
  },
  {
    value: "enhanced",
    label: "Slight enhancement",
    description: "Subtle improvements",
  },
  {
    value: "hot",
    label: "Hotter",
    description: "Enhanced attractiveness",
  },
  {
    value: "glowup",
    label: "Full glow-up",
    description: "Maximum transformation",
    warning: true,
  },
];

export function VibeControls({
  realismLevel,
  options,
  onRealismChange,
  onOptionChange,
}: VibeControlsProps) {
  return (
    <div>
      {/* Realism Options */}
      <div className="space-y-3">
        <h3 className="font-bold text-white">Face Realism</h3>
        <div className="grid grid-cols-2 gap-2.5">
          {realismOptions.map((option) => (
            <motion.button
              key={option.value}
              whileTap={{ scale: 0.98 }}
              onClick={() => onRealismChange(option.value)}
              className={`h-28 p-2 rounded-2xl text-left transition-all flex items-end justify-center ${
                realismLevel === option.value
                  ? "bg-brand-orange/20 border border-brand-orange"
                  : "bg-foreground/10 border border-transparent hover:border-muted-foreground/30"
              }`}
            >
              <p className="font-medium text-white flex items-center gap-2">
                {option.label}
                {option.warning && (
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                )}
              </p>
            </motion.button>
          ))}
        </div>

        {realismLevel === "glowup" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30"
          >
            <p className="text-sm text-amber-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              Results may look significantly different from your actual
              appearance
            </p>
          </motion.div>
        )}
      </div>

      {/* Optional Toggles */}
      <div className="space-y-3 mt-14">
        <h3 className="font-bold text-white">Optional Changes</h3>
        <div className="space-y-3">
          <div className="flex flex-col px-5 py-4 bg-foreground/10 rounded-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-white">Change hairstyle</p>
              </div>

              <div
                className={cn(
                  "rounded-full size-6 flex items-center justify-center border-2 p-1 cursor-pointer transition-all duration-200",
                  options.changeHairstyle
                    ? "bg-brand-orange border-transparent"
                    : "border-foreground/20"
                )}
                onClick={() => {
                  onOptionChange("changeHairstyle", !options.changeHairstyle);
                  if (!options.changeHairstyle) {
                    onOptionChange("hairStyle", null);
                  }
                }}
              >
                <AnimatePresence>
                  {options.changeHairstyle && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <CheckIcon className="size-4 text-white" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <AnimatePresence>
              {options.changeHairstyle && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="grid grid-cols-4 gap-3 mt-3"
                >
                  {hairstyleOptions.map((option, index) => (
                    <motion.div
                      key={option.value}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex flex-col cursor-pointer"
                      onClick={() => onOptionChange("hairStyle", option.value)}
                    >
                      <div
                        className={cn(
                          "rounded-xl border-2 h-[80px] flex items-center justify-center transition-all",
                          options.hairStyle === option.value
                            ? "border-brand-orange bg-brand-orange/10"
                            : "border-foreground/20 hover:border-brand-orange/50"
                        )}
                      >
                        <Image
                          src={`/images/hairstyles/${option.img}`}
                          alt={option.name}
                          className="size-[38px] object-contain"
                          width={80}
                          height={80}
                        />
                      </div>

                      <p className="text-white text-xs font-semibold text-center mt-2 whitespace-nowrap">
                        {option.name}
                      </p>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex flex-col px-5 py-4 bg-foreground/10 rounded-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-white">Add Glasses</p>
              </div>

              <div
                className={cn(
                  "rounded-full size-6 flex items-center justify-center border-2 p-1 cursor-pointer transition-all duration-200",
                  options.addGlasses
                    ? "bg-brand-orange border-transparent"
                    : "border-foreground/20"
                )}
                onClick={() =>
                  onOptionChange("addGlasses", !options.addGlasses)
                }
              >
                <AnimatePresence>
                  {options.addGlasses && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <CheckIcon className="size-4 text-white" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
