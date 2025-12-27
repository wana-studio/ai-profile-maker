'use client';

import { motion } from 'framer-motion';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';
import type { RealismLevel } from '@/lib/stores';

interface VibeControlsProps {
    energyLevel: number;
    realismLevel: RealismLevel;
    options: {
        changeOutfit: boolean;
        changeHairstyle: boolean;
        addGlasses: boolean;
        addBeard: boolean;
    };
    onEnergyChange: (value: number) => void;
    onRealismChange: (level: RealismLevel) => void;
    onOptionChange: (key: keyof VibeControlsProps['options'], value: boolean) => void;
}

const realismOptions: { value: RealismLevel; label: string; description: string; warning?: boolean }[] = [
    { value: 'natural', label: "Don't change my face", description: 'Keep your natural features' },
    { value: 'enhanced', label: 'Slight enhancement', description: 'Subtle improvements' },
    { value: 'hot', label: 'Hotter but believable', description: 'Enhanced attractiveness' },
    { value: 'glowup', label: 'Full glow-up', description: 'Maximum transformation', warning: true },
];

export function VibeControls({
    energyLevel,
    realismLevel,
    options,
    onEnergyChange,
    onRealismChange,
    onOptionChange,
}: VibeControlsProps) {
    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-2">Fine-tune Your Look</h2>
                <p className="text-muted-foreground">
                    Adjust the vibe and options
                </p>
            </div>

            {/* Energy Slider */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-white">Energy Level</h3>
                    <Badge variant="secondary" className="text-xs">
                        {energyLevel < 33 ? 'Soft' : energyLevel < 66 ? 'Balanced' : 'Bold'}
                    </Badge>
                </div>
                <div className="space-y-2">
                    <Slider
                        value={[energyLevel]}
                        onValueChange={([value]) => onEnergyChange(value)}
                        max={100}
                        step={1}
                        className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Soft & Approachable</span>
                        <span>Bold & Confident</span>
                    </div>
                </div>
            </div>

            {/* Realism Options */}
            <div className="space-y-3">
                <h3 className="text-sm font-medium text-white">Face Realism</h3>
                <div className="space-y-2">
                    {realismOptions.map((option) => (
                        <motion.button
                            key={option.value}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => onRealismChange(option.value)}
                            className={`w-full p-4 rounded-2xl text-left transition-all ${realismLevel === option.value
                                    ? 'bg-brand-purple/20 border border-brand-purple'
                                    : 'bg-secondary border border-transparent hover:border-muted-foreground/30'
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-white flex items-center gap-2">
                                        {option.label}
                                        {option.warning && (
                                            <AlertTriangle className="w-4 h-4 text-amber-500" />
                                        )}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {option.description}
                                    </p>
                                </div>
                                <div
                                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${realismLevel === option.value
                                            ? 'border-brand-purple bg-brand-purple'
                                            : 'border-muted-foreground'
                                        }`}
                                >
                                    {realismLevel === option.value && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="w-2 h-2 rounded-full bg-white"
                                        />
                                    )}
                                </div>
                            </div>
                        </motion.button>
                    ))}
                </div>

                {realismLevel === 'glowup' && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30"
                    >
                        <p className="text-sm text-amber-300 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                            Results may look significantly different from your actual appearance
                        </p>
                    </motion.div>
                )}
            </div>

            {/* Optional Toggles */}
            <div className="space-y-3">
                <h3 className="text-sm font-medium text-white">Optional Changes</h3>
                <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-secondary">
                        <div>
                            <p className="text-sm font-medium text-white">Change outfit</p>
                            <p className="text-xs text-muted-foreground">AI picks a fitting outfit</p>
                        </div>
                        <Switch
                            checked={options.changeOutfit}
                            onCheckedChange={(checked) => onOptionChange('changeOutfit', checked)}
                        />
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-secondary">
                        <div>
                            <p className="text-sm font-medium text-white">Change hairstyle</p>
                            <p className="text-xs text-muted-foreground">Try a new look</p>
                        </div>
                        <Switch
                            checked={options.changeHairstyle}
                            onCheckedChange={(checked) => onOptionChange('changeHairstyle', checked)}
                        />
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-secondary">
                        <div>
                            <p className="text-sm font-medium text-white">Add glasses</p>
                            <p className="text-xs text-muted-foreground">Stylish eyewear</p>
                        </div>
                        <Switch
                            checked={options.addGlasses}
                            onCheckedChange={(checked) => onOptionChange('addGlasses', checked)}
                        />
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-secondary">
                        <div>
                            <p className="text-sm font-medium text-white">Add beard</p>
                            <p className="text-xs text-muted-foreground">Facial hair styling</p>
                        </div>
                        <Switch
                            checked={options.addBeard}
                            onCheckedChange={(checked) => onOptionChange('addBeard', checked)}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
