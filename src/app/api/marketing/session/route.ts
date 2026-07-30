import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/** A private, deliberately minimal post-paint marketing enhancement payload. */
export async function GET() {
	const { userId } = await auth();
	return NextResponse.json(
		{ authenticated: Boolean(userId) },
		{ headers: { "Cache-Control": "private, no-store" } },
	);
}
