import { describe, expect, it } from "vitest";
import {
	BLOG_CATEGORIES,
	BLOG_CATEGORY_KEYS,
	isBlogCategoryKey,
} from "./blog-categories";

describe("blog category registry", () => {
	it("resolves label and badge colors for every registered key", () => {
		for (const key of BLOG_CATEGORY_KEYS) {
			const category = BLOG_CATEGORIES[key];
			expect(category.label).toBeTruthy();
			expect(category.badgeBg).toMatch(/^#[0-9a-f]{6}$/i);
			expect(category.badgeFg).toMatch(/^#[0-9a-f]{6}$/i);
		}
	});

	it("recognizes registered category keys", () => {
		expect(isBlogCategoryKey("planeacion")).toBe(true);
		expect(isBlogCategoryKey("guias")).toBe(true);
		expect(isBlogCategoryKey("producto")).toBe(true);
	});

	it("rejects an unmapped category key", () => {
		expect(isBlogCategoryKey("no-existe")).toBe(false);
	});
});
