import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { resolveRedirectPath } from "@/lib/auth/safe-redirect";

// Only the dashboard actually requires auth. Everything else — marketing
// pages, public wishlists, and any URL that matches no route — must stay
// reachable by anonymous visitors so unmatched routes can render the
// marketing not-found page instead of redirecting to sign-in.
const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

const isAuthRoute = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)"]);

export default clerkMiddleware(async (auth, req) => {
	const { userId } = await auth();

	if (isAuthRoute(req) && userId) {
		const redirectPath = resolveRedirectPath(
			req.nextUrl.searchParams.get("redirect_url"),
		);
		return NextResponse.redirect(new URL(redirectPath, req.url));
	}

	if (isProtectedRoute(req)) {
		await auth.protect();
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
