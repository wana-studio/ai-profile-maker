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
import { cn } from "@/lib/utils";

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

    const [current, setCurrent] = useState(0);

    // Sync carousel with selected category
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
            api.scrollTo(0);
        }
    }, [api, selectedCategory]);

    // Handle scroll animations for coverflow effect
    useEffect(() => {
        if (!api) return;

        const onScroll = () => {
            const scrollProgress = api.scrollProgress();

            api.scrollSnapList().forEach((scrollSnap, index) => {
                const slideNode = api.slideNodes()[index];
                const slideBody = slideNode.querySelector('.slide-body') as HTMLElement;
                if (!slideBody) return;

                // Calculate distance from center
                // Embla's scrollProgress goes from 0 to 1 (or more if looped)
                // We need to normalize it relative to the current slide's snap point

                let diff = scrollProgress - scrollSnap;

                // Handle wrap-around for loop mode
                if (diff < -0.5) diff += 1;
                if (diff > 0.5) diff -= 1;

                // Scale and Opacity calculations
                const scale = 1 - Math.abs(diff * 4); // Reduces scale as it moves away
                const opacity = 1 - Math.abs(diff * 3);

                // Rotation
                const rotate = diff * -40; // Rotates based on position

                // Clamping values
                const clampedScale = Math.max(0.7, scale);
                const clampedOpacity = Math.max(0.3, opacity);

                // Apply styles
                slideBody.style.transform = `scale(${clampedScale}) rotate(${rotate}deg)`;
                slideBody.style.opacity = `${clampedOpacity}`;
                slideBody.style.zIndex = `${Math.round(clampedOpacity * 25)}`;
            });
        };

        api.on("scroll", onScroll);
        api.on("reInit", onScroll);
        // Trigger once on init
        onScroll();

        return () => {
            api.off("scroll", onScroll);
            api.off("reInit", onScroll);
        };
    }, [api]);

    // Handle select event to update text
    useEffect(() => {
        if (!api) {
            return;
        }

        const onSelect = () => {
            setCurrent(api.selectedScrollSnap());
        };

        api.on("select", onSelect);
        api.on("reInit", onSelect);
        onSelect();

        return () => {
            api.off("select", onSelect);
            api.off("reInit", onSelect);
        };
    }, [api]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16 px-4 text-center w-full max-w-4xl mx-auto overflow-hidden"
        >
            <Carousel
                setApi={setApi}
                className="w-full"
                opts={{
                    align: "center",
                    loop: true,
                    containScroll: false,
                }}
            >
                <CarouselContent className="items-center -ml-4">
                    {slides.map((slide, index) => (
                        <CarouselItem key={index} className="basis-1/3 min-w-[200px] pl-4">
                            <div className="flex flex-col items-center justify-center select-none">
                                <div className="relative flex items-center justify-center mb-10 w-full h-[180px]">
                                    <div className="slide-body transition-all duration-75 ease-out rounded-[40px] bg-foreground/5 backdrop-blur-2xl p-3">
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
                                                draggable={false}
                                            />
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
            </Carousel>

            <motion.div
                key={current}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col items-center justify-center mt-6"
            >
                <h2 className="text-2xl font-bold text-white whitespace-pre-line text-center">
                    {slides[current]?.title}
                </h2>
                <p className="text-muted-foreground font-medium max-w-xs mt-2.5 text-center">
                    {slides[current]?.description}
                </p>
            </motion.div>

            <Button
                className="px-8 py-6 rounded-full gradient-warm text-white font-semibold text-lg mt-8"
                onClick={() => openSignInModal()}
            >
                Create it
            </Button>
        </motion.div>
    );
}
