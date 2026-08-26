import { describe, expect, it, vi } from "vitest";

const recordWishlistView = vi.hoisted(() => vi.fn());

vi.mock("@/server/db", () => ({ db: {} }));
vi.mock("@/server/services/wishlist-view-analytics.service", () => ({
	recordWishlistView,
}));

import { POST } from "./route";

describe("POST /api/analytics/wishlist-view", () => {
	it("records a bounded, signed browser signal and returns no analytics data", async () => {
		recordWishlistView.mockResolvedValue("recorded");
		const response = await POST(
			new Request("https://awishfor.test/api/analytics/wishlist-view", {
				body: JSON.stringify({
					anonymousId: "anonymous_1",
					authorization: "signed-token",
				}),
				headers: { "content-type": "application/json" },
				method: "POST",
			}),
		);

		expect(response.status).toBe(204);
		expect(await response.text()).toBe("");
		expect(recordWishlistView).toHaveBeenCalledWith(expect.anything(), {
			anonymousId: "anonymous_1",
			authorization: "signed-token",
		});
	});

	it("ignores malformed or oversized payloads", async () => {
		await POST(
			new Request("https://awishfor.test/api/analytics/wishlist-view", {
				body: JSON.stringify({ anonymousId: "anonymous_1" }),
				headers: { "content-type": "application/json" },
				method: "POST",
			}),
		);
		await POST(
			new Request("https://awishfor.test/api/analytics/wishlist-view", {
				body: "{}",
				headers: { "content-length": "2049" },
				method: "POST",
			}),
		);

		expect(recordWishlistView).toHaveBeenCalledTimes(1);
	});
});
