import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: "Selfio",
        short_name: "Selfio",
        description: "Selfio, your Selfie Ai assistant",
        start_url: "/app",
        display: "standalone",
        orientation: "portrait-primary",
        background_color: "#fe653d",
        theme_color: "#000000",
        categories: ["productivity", "education", "utilities"],
        lang: "en",
        dir: "ltr",
        scope: "/",
        icons: [
            {
                src: "/favicon.ico/android-chrome-192x192.png",
                sizes: "192x192",
                type: "image/png",
                purpose: "maskable",
            },
            {
                src: "/favicon.ico/android-chrome-512x512.png",
                sizes: "512x512",
                type: "image/png",
                purpose: "maskable",
            },
        ],
    };
}
