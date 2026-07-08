import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { resolveRedirectPath } from "@/lib/auth/safe-redirect";

const isPublicRoute = createRouteMatcher([
	"/",
	"/sign-in(.*)",
	"/sign-up(.*)",
	"/sso-callback(.*)",
	"/api/webhooks(.*)",
	"/api/uploadthing(.*)",
	"/api/trpc(.*)",
	"/w/(.*)",
	"/create(.*)",
]);

const isAuthRoute = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)"]);

export default clerkMiddleware(async (auth, req) => {
	const { userId } = await auth();

	if (isAuthRoute(req) && userId) {
		const redirectPath = resolveRedirectPath(
			req.nextUrl.searchParams.get("redirect_url"),
		);
		return NextResponse.redirect(new URL(redirectPath, req.url));
	}

	if (!isPublicRoute(req)) {
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
