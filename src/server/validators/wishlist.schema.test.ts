import { describe, expect, it } from "vitest";
import {
	restoreWishlistSchema,
	wishlistRestoreTargetStatusSchema,
} from "@/server/validators/wishlist.schema";

describe("wishlist restore validation", () => {
	it("accepts draft and published as restore target states", () => {
		expect(wishlistRestoreTargetStatusSchema.parse("draft")).toBe("draft");
		expect(wishlistRestoreTargetStatusSchema.parse("published")).toBe(
			"published",
		);
	});

	it("rejects archived as a restore target state", () => {
		expect(() =>
			restoreWishlistSchema.parse({
				wishlistId: "wishlist_123",
				targetStatus: "archived",
			}),
		).toThrow();
	});
});
