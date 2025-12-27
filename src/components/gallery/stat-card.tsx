'use client';

import { motion } from 'framer-motion';

interface StatCardProps {
    stats: {
        formal: number;
        spicy: number;
        cool: number;
        trustworthy: number;
        mysterious: number;
    };
}

const statConfig = [
    { key: 'formal' as const, label: 'Formal', color: 'from-blue-500 to-blue-400' },
    { key: 'spicy' as const, label: 'Spicy', color: 'from-red-500 to-orange-400' },
    { key: 'cool' as const, label: 'Cool', color: 'from-purple-500 to-pink-400' },
    { key: 'trustworthy' as const, label: 'Trust', color: 'from-green-500 to-emerald-400' },
    { key: 'mysterious' as const, label: 'Mystery', color: 'from-slate-500 to-slate-400' },
];

export function StatCard({ stats }: StatCardProps) {
    return (
        <div className="p-4 rounded-2xl glass">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
                Vibe Stats
            </h4>
            <div className="space-y-3">
                {statConfig.map((stat, index) => (
                    <motion.div
                        key={stat.key}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center gap-3"
                    >
                        <span className="text-xs text-muted-foreground w-14 text-right">
                            {stat.label}
                        </span>
                        <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${stats[stat.key]}%` }}
                                transition={{ duration: 0.8, delay: index * 0.1, ease: 'easeOut' }}
                                className={`h-full rounded-full bg-gradient-to-r ${stat.color}`}
                            />
                        </div>
                        <span className="text-xs font-semibold text-white w-8">
                            {stats[stat.key]}
                        </span>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
