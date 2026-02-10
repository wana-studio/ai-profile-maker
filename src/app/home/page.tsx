import type { Metadata } from "next";
import { LandingPage } from "./landing-page";

export const metadata: Metadata = {
    title: "Selfio — Your Best Photos, Without Effort",
    description:
        "Upload one selfie, get thousands of stunning portraits and headshots. Perfect for social media, dating apps, LinkedIn, and more. Free to try.",
    keywords: [
        "AI selfie",
        "AI portrait",
        "professional headshot",
        "dating app photos",
        "social media photos",
        "AI photo enhancer",
        "selfie generator",
        "profile picture maker",
    ],
    openGraph: {
        title: "Selfio — Your Best Photos, Without Effort",
        description:
            "Upload one selfie, get thousands of stunning portraits. Try free.",
        type: "website",
        siteName: "Selfio",
    },
    twitter: {
        card: "summary_large_image",
        title: "Selfio — Your Best Photos, Without Effort",
        description:
            "Upload one selfie, get thousands of stunning portraits. Try free.",
    },
};

export default function HomePage() {
    return <LandingPage />;
}
