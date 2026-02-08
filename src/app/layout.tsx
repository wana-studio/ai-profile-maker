import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { PostHogProvider } from "@/lib/posthog";
import "./globals.css";

export const metadata: Metadata = {
  title: "Selfio - AI Selfie Enhancer",
  description:
    "Create stunning, realistic profile photos for dating apps, work, social media, and more using AI.",
  keywords: [
    "AI photos",
    "profile pictures",
    "dating app photos",
    "professional headshots",
    "AI selfie enhancement",
  ],
  openGraph: {
    title: "Selfio - AI Selfie Enhancer",
    description: "Create stunning, realistic selfies using AI",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0a0a0f",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: "#a855f7",
          colorBackground: "#0a0a0f",
          borderRadius: "1rem",
        },
      }}
    >
      <html lang="en" className="dark">
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link
            rel="preconnect"
            href="https://fonts.gstatic.com"
            crossOrigin="anonymous"
          />
        </head>
        <body className="antialiased min-h-screen bg-background text-foreground overflow-x-hidden">
          <PostHogProvider>{children}</PostHogProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
