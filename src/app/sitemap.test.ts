import { describe, expect, it, vi } from "vitest";

// sitemap.ts trusts getAllPosts to already have excluded drafts (tested at
// the loader level in src/server/blog/posts.test.ts) — this suite only
// verifies composition: static routes + whatever the loader returns, and
// that no wishlist/dashboard/auth path is ever listed.
vi.mock("@/server/blog/posts", () => ({
	getAllPosts: () => [
		{ slug: "post-a", date: new Date("2026-01-01") },
		{ slug: "post-b", date: new Date("2026-02-01") },
	],
}));

const { default: sitemap } = await import("./sitemap");

describe("sitemap", () => {
	it("lists the static public routes", () => {
		const urls = sitemap().map((entry) => entry.url);
		expect(urls).toContain("http://localhost:4000/");
		expect(urls).toContain("http://localhost:4000/create");
		expect(urls).toContain("http://localhost:4000/blog");
		expect(urls).toContain("http://localhost:4000/terms");
		expect(urls).toContain("http://localhost:4000/privacy");
	});

	it("lists one entry per post the loader returns", () => {
		const urls = sitemap().map((entry) => entry.url);
		expect(urls).toContain("http://localhost:4000/blog/post-a");
		expect(urls).toContain("http://localhost:4000/blog/post-b");
	});

	it("never lists a public wishlist, dashboard, or auth route", () => {
		const urls = sitemap().map((entry) => entry.url);
		expect(urls.some((url) => url.includes("/w/"))).toBe(false);
		expect(urls.some((url) => url.includes("/dashboard"))).toBe(false);
		expect(urls.some((url) => url.includes("/sign-in"))).toBe(false);
		expect(urls.some((url) => url.includes("/api"))).toBe(false);
	});
});
