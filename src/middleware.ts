import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Only these routes require authentication
const isProtectedRoute = createRouteMatcher([
    '/api/generate(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
    // Only protect specific API routes - everything else is public
    if (isProtectedRoute(req)) {
        await auth.protect();
    }
});

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
};
