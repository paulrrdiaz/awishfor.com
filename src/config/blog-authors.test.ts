import { describe, expect, it } from "vitest";
import {
	BLOG_AUTHOR_KEYS,
	BLOG_AUTHORS,
	isBlogAuthorKey,
} from "./blog-authors";

describe("blog author registry", () => {
	it("resolves a display name and avatar initial for every registered key", () => {
		for (const key of BLOG_AUTHOR_KEYS) {
			const author = BLOG_AUTHORS[key];
			expect(author.name).toBeTruthy();
			expect(author.initial).toHaveLength(1);
		}
	});

	it("recognizes registered author keys", () => {
		expect(isBlogAuthorKey("valentina")).toBe(true);
	});

	it("rejects an unmapped author key", () => {
		expect(isBlogAuthorKey("no-existe")).toBe(false);
	});
});
