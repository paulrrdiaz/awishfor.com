import { z } from "zod";
import { db } from "@/server/db";
import {
	recordWishlistView,
	type WishlistViewAnalyticsDatabase,
} from "@/server/services/wishlist-view-analytics.service";

export const runtime = "nodejs";

const payloadSchema = z.object({
	authorization: z.string().min(1).max(1024),
	anonymousId: z.string().min(1).max(200),
});

const emptyResponse = () =>
	new Response(null, { headers: { "cache-control": "no-store" }, status: 204 });

export async function POST(request: Request) {
	const contentLength = Number(request.headers.get("content-length") ?? "0");
	if (!Number.isFinite(contentLength) || contentLength > 2048) {
		return emptyResponse();
	}

	try {
		const payload = payloadSchema.safeParse(await request.json());
		if (!payload.success) return emptyResponse();
		await recordWishlistView(db as unknown as WishlistViewAnalyticsDatabase, {
			authorization: payload.data.authorization,
			anonymousId: payload.data.anonymousId,
		});
	} catch {
		// Analytics is deliberately best-effort and must not reveal validation state.
	}

	return emptyResponse();
}
