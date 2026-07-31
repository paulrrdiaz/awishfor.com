// @vitest-environment jsdom

import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { render, screen } from "@testing-library/react";
import type { ImgHTMLAttributes } from "react";
import { describe, expect, it, vi } from "vitest";
import { DEMO_WISHLIST } from "@/config/demo-wishlist";
import {
	getWishlistHeading,
	toMarketingWishlistPreview,
} from "@/lib/wishlist/public-presentation";
import { ExamplePreview } from "./example-preview";

vi.mock("next/image", () => ({
	default: ({
		alt = "",
		priority,
		fill: _fill,
		...props
	}: ImgHTMLAttributes<HTMLImageElement> & {
		priority?: boolean;
		fill?: boolean;
	}) => (
		// biome-ignore lint/performance/noImgElement: next/image test double
		<img alt={alt} data-priority={priority ? "true" : "false"} {...props} />
	),
}));

describe("marketing example preview", () => {
	it("derives faithful demo content from the shared server-safe contract", () => {
		const preview = toMarketingWishlistPreview(DEMO_WISHLIST);
		expect(preview.title).toBe(getWishlistHeading(DEMO_WISHLIST));
		expect(preview.gifts.map((gift) => gift.name)).toEqual([
			"Copas de cristal",
			"Vajilla 12 piezas",
			"Mantel de lino",
		]);

		render(<ExamplePreview />);
		expect(screen.getByText("María & Tomás")).toBeInTheDocument();
		expect(
			screen.getByText(DEMO_WISHLIST.displayName ?? ""),
		).toBeInTheDocument();
		expect(screen.getAllByText("Solo ejemplo")).toHaveLength(3);
		expect(screen.queryByRole("button")).not.toBeInTheDocument();
		for (const image of screen.getAllByRole("img"))
			expect(image).toHaveAttribute("data-priority", "false");
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
