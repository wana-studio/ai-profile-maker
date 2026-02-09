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
          <meta
            name="viewport"
            content="viewport-fit=cover, width=device-width, initial-scale=1.0, interactive-widget=resizes-content"
          />
          <meta name="apple-mobile-web-app-title" content="Selfio" />
          <meta name="mobile-web-app-capable" content="yes" />
          <meta
            name="apple-mobile-web-app-status-bar-style"
            content="black-translucent"
          />
          <meta name="mobile-web-app-capable" content="yes" />
          <meta
            name="apple-mobile-web-app-status-bar-style"
            content="black-translucent"
          />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-title" content="Selfio" />
          <meta name="format-detection" content="telephone=no" />
          <meta name="msapplication-tap-highlight" content="no" />
          <meta name="msapplication-TileColor" content="#fe653d" />
          <link
            rel="apple-touch-icon"
            href="/favicon.ico/apple-touch-icon.png"
          />
          <link rel="icon" type="image/png" sizes="32x32" href="/favicon.ico/favicon-32x32.png" />
          <link rel="icon" type="image/png" sizes="16x16" href="/favicon.ico/favicon-16x16.png" />
          <link rel="mask-icon" href="/icon.svg" color="#fe653d" />
        </head>
        <body className="antialiased min-h-screen bg-background text-foreground overflow-x-hidden">
          <PostHogProvider>{children}</PostHogProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
