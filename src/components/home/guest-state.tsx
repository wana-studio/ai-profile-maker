"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useModalStore } from "@/lib/stores";
import Image from "next/image";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    type CarouselApi,
} from "@/components/ui/carousel";

// Type definition to match the one in page.tsx
type CategoryId =
    | "all"
    | "dating"
    | "work"
    | "social"
    | "anonymous"
    | "creative"
    | "travel";

const slides = [
    {
        category: "all",
        image: "/images/img-center.png",
        title: "Look like someone\npeople trust",
        description: "Your professional LinkedIn photo",
    },
    {
        category: "dating",
        image: "/images/img-right.png",
        title: "Find your perfect\nmatch",
        description: "Stand out on dating apps",
    },
    {
        category: "work",
        image: "/images/img-left.png",
        title: "Advance your\ncareer",
        description: "Professional headshots for business",
    },
    {
        category: "social",
        image: "/images/img-center.png",
        title: "Grow your social\npresence",
        description: "Engaging photos for social media",
    },
    {
        category: "anonymous",
        image: "/images/img-right.png",
        title: "Stay private but\npresent",
        description: "Artistic anonymous avatars",
    },
    {
        category: "creative",
        image: "/images/img-left.png",
        title: "Express your\ncreativity",
        description: "Unique styles for creatives",
    },
    {
        category: "travel",
        image: "/images/img-center.png",
        title: "Share your\nadventures",
        description: "Travel-themed profile pictures",
    },
];

export function GuestState({ selectedCategory }: { selectedCategory: string }) {
    const { openSignInModal } = useModalStore();
    const [api, setApi] = useState<CarouselApi>();

    useEffect(() => {
        if (!api) {
            return;
        }

        const categoryIndex = slides.findIndex(
            (slide) => slide.category === selectedCategory
        );

        if (categoryIndex !== -1) {
            api.scrollTo(categoryIndex);
        } else {
            // Default to "all" or first slide if category not found directly
            api.scrollTo(0);
        }
    }, [api, selectedCategory]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16 px-4 text-center w-full max-w-md mx-auto"
        >
            <Carousel setApi={setApi} className="w-full">
                <CarouselContent>
                    {slides.map((slide, index) => (
                        <CarouselItem key={index}>
                            <div className="flex flex-col items-center justify-center">
                                <div className="relative flex items-center justify-center mb-10 w-full h-[200px]">
                                    {/* Background Accents - Static for visual consistency or could be dynamic */}
                                    <Image
                                        src="/images/img-right.png"
                                        alt="Background"
                                        width={106}
                                        height={113}
                                        className="absolute right-0 w-[80px] h-[85px] object-cover rounded-[20px] rotate-6 opacity-20 blur-sm"
                                    />
                                    <Image
                                        src="/images/img-left.png"
                                        alt="Background"
                                        width={106}
                                        height={113}
                                        className="absolute left-0 w-[80px] h-[85px] object-cover rounded-[20px] -rotate-6 opacity-20 blur-sm"
                                    />

                                    <div className="p-3 rounded-[40px] bg-foreground/5 backdrop-blur-2xl relative z-10 transition-transform duration-500 hover:scale-105">
                                        <div
                                            className="rounded-[30px]"
                                            style={{
                                                boxShadow: "0px 33.75px 47.25px 0px #FD491326",
                                            }}
                                        >
                                            <Image
                                                src={slide.image}
                                                alt={slide.title}
                                                width={131}
                                                height={140}
                                                className="w-[131px] h-[140px] object-cover rounded-[30px]"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <h2 className="text-2xl font-bold text-white whitespace-pre-line h-[64px] flex items-center justify-center">
                                    {slide.title}
                                </h2>
                                <p className="text-muted-foreground font-medium max-w-xs mt-2.5 h-[24px]">
                                    {slide.description}
                                </p>
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
            </Carousel>

            <Button
                className="px-8 py-6 rounded-full gradient-warm text-white font-semibold text-lg mt-8"
                onClick={() => openSignInModal()}
            >
                Create it
            </Button>
        </motion.div>
    );
}
