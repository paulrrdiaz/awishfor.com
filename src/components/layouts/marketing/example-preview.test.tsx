// @vitest-environment jsdom

import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DEMO_WISHLIST } from "@/config/demo-wishlist";
import {
	getWishlistHeading,
	toMarketingWishlistPreview,
} from "@/lib/wishlist/public-presentation";
import { ExamplePreview } from "./example-preview";

describe("marketing example preview", () => {
	it("derives faithful demo content from the shared server-safe contract", () => {
		const preview = toMarketingWishlistPreview(DEMO_WISHLIST);
		expect(preview.title).toBe(getWishlistHeading(DEMO_WISHLIST));
		expect(preview.eyebrow).toBe("Baby Shower");
		expect(preview.gifts).toHaveLength(8);
		expect(preview.coverImageUrls).toHaveLength(3);
	});

	it("carries full gift-state coverage: priority, available, partial and purchased", () => {
		const preview = toMarketingWishlistPreview(DEMO_WISHLIST);
		const statuses = preview.gifts.map((gift) => gift.status);
		expect(statuses).toContain("available");
		expect(statuses).toContain("partial");
		expect(statuses).toContain("purchased");
		expect(preview.gifts.some((gift) => gift.priority === "high")).toBe(true);
	});

	it("renders every gift-state badge from fixture data with no client-side purchase behavior", () => {
		render(<ExamplePreview />);

		expect(screen.getByText("Esperando a Mateo")).toBeInTheDocument();

		const highPriorityCount = DEMO_WISHLIST.gifts.filter(
			(gift) => gift.priority === "high",
		).length;
		const purchasedCount = DEMO_WISHLIST.gifts.filter(
			(gift) => gift.status === "purchased",
		).length;
		expect(screen.getAllByText("★ Infaltable")).toHaveLength(highPriorityCount);
		expect(screen.getAllByText("✓ Comprado")).toHaveLength(purchasedCount);

		// Purchased gift names render struck through.
		const mantita = screen.getByText("Mantita de algodón");
		expect(mantita.className).toContain("line-through");

		expect(screen.queryByRole("button")).not.toBeInTheDocument();
	});

	it("does not import the production layout registry or purchase flow", async () => {
		const source = await readFile(
			resolve(
				process.cwd(),
				"src/components/layouts/marketing/example-preview.tsx",
			),
			"utf8",
		);
		expect(source).not.toContain("PublicWishlistPage");
		expect(source).not.toContain("public-wishlist-page");
		expect(source).not.toContain("purchase-gift-modal");
		expect(source).not.toContain("@/trpc/");
		expect(source).not.toContain('"use client"');
	});
});
