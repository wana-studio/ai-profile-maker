"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export function CreateButton() {
  return (
    <Link href="/app/create" className="fixed bottom-17 right-4 z-50">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-2 px-6 py-3 rounded-full gradient-warm text-white font-semibold shadow-lg glow animate-pulse-glow"
      >
        <Sparkles size={20} />
        <span>Create</span>
      </motion.button>
    </Link>
  );
}
