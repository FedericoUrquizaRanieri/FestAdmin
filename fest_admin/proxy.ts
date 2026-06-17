import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isProtectedRoute = createRouteMatcher([
    "/dashboard(.*)",
    "/homePage(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
    // Early bypass for public WhatsApp webhook and Vercel Cron endpoints
    const url = new URL(req.url);
    if (
        url.pathname.startsWith("/api/webhook/whatsapp") ||
        url.pathname.startsWith("/api/cron/process-conversations")
    ) {
        return;
    }

    if (isProtectedRoute(req)) {
        await auth.protect();
    }
});

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes except whatsapp webhook and process-conversations cron
        '/api/((?!webhook/whatsapp|cron/process-conversations).*)',
        '/trpc(.*)',
        // Always run for Clerk-specific frontend API routes
        '/__clerk/(.*)',
    ],
}