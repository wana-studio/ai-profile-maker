import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Protected routes that require authentication
const isProtectedRoute = createRouteMatcher([
  "/api/generate(.*)",
  "/create(.*)",
  "/profile(.*)",
  "/gallery(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  const isProtected = isProtectedRoute(req);

  // If accessing a protected route without authentication
  if (isProtected && !userId) {
    // For API routes, return 401
    if (req.nextUrl.pathname.startsWith("/api/")) {
      await auth.protect();
    }
    // For page routes, redirect to home
    // The client-side will handle showing the sign-in modal
    else {
      const url = new URL("/", req.url);
      return NextResponse.redirect(url);
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
