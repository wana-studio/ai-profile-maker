"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

interface AIInsightsProps {
  insights: string[];
}

export function AIInsights({ insights }: AIInsightsProps) {
  if (!insights || insights.length === 0) return null;

  return (
    <div className="p-4 rounded-2xl glass">
      <div className="flex items-center gap-2 mb-3">
        <div className="p-1.5 rounded-lg gradient-warm">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <h4 className="text-sm font-semibold text-white">AI Insights</h4>
      </div>
      <div className="space-y-2">
        {insights.map((insight, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.15 }}
            className="flex items-start gap-2"
          >
            <span className="text-brand-orange mt-0.5">✓</span>
            <p className="text-sm text-muted-foreground">{insight}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
