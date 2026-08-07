// @vitest-environment node
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const LAYOUT_FILES = [
	"carousel-hero-layout.tsx",
	"scrapbook-polaroids-layout.tsx",
	"portrait-frame-split-layout.tsx",
	"arch-hero-party-layout.tsx",
	"arch-trio-layout.tsx",
	"overlap-duo-layout.tsx",
	"split-image-right-layout.tsx",
	"collage-staggered-layout.tsx",
	"magazine-editorial-layout.tsx",
];

const layoutPath = (file: string) => resolve(import.meta.dirname, file);
const sharedPath = (file: string) =>
	resolve(import.meta.dirname, "../../shared", file);

const routePath = (...segments: string[]) =>
	resolve(import.meta.dirname, "../../../app/w", ...segments);

describe("public wishlist drawer integration", () => {
	it("passes the enabled setting through every non-compact hero CTA", async () => {
		for (const file of LAYOUT_FILES) {
			const source = await readFile(layoutPath(file), "utf8");
			expect(source).toContain("showHowItWorks={wishlist.showHowItWorks}");
			expect(source).toContain('mode === "compact"');
		}
	});

	it("keeps the shared body free of the retired inline section", async () => {
		const source = await readFile(
			sharedPath("public-wishlist-body.tsx"),
			"utf8",
		);

		expect(source).not.toContain("HowItWorks");
		expect(source).not.toContain("como-funciona");
	});
});

describe("public wishlist footer integration", () => {
	it("centralizes one footer after the selected layout for all nine variants", async () => {
		const pageSource = await readFile(
			layoutPath("public-wishlist-page.tsx"),
			"utf8",
		);

		expect(pageSource.match(/<WishlistFooter/g)).toHaveLength(1);
		expect(pageSource.indexOf("<LayoutComponent")).toBeLessThan(
			pageSource.indexOf("<WishlistFooter"),
		);

		for (const file of LAYOUT_FILES) {
			const source = await readFile(layoutPath(file), "utf8");
			expect(source).not.toContain("WishlistFooter");
		}

		for (const layoutId of [
			"split-image-right",
			"collage-staggered",
			"magazine-editorial",
			"overlap-duo",
			"arch-hero-party",
			"arch-trio",
			"carousel-hero",
			"scrapbook-polaroids",
			"portrait-frame-split",
		]) {
			expect(pageSource).toContain(`"${layoutId}":`);
		}
	});

	it("keeps thank-you content before shell-owned footer composition", async () => {
		const bodySource = await readFile(
			sharedPath("public-wishlist-body.tsx"),
			"utf8",
		);
		const collageSource = await readFile(
			layoutPath("collage-staggered-layout.tsx"),
			"utf8",
		);

		expect(bodySource).toContain(
			"<WishlistThankYou message={wishlist.thankYouMessage}",
		);
		expect(collageSource).toContain(
			"<WishlistThankYou message={wishlist.thankYouMessage}",
		);
		expect(bodySource).not.toContain("WishlistFooter");
		expect(collageSource).not.toContain("WishlistFooter");
	});

	it("defaults embedded callers to compact and omits every footer in compact mode", async () => {
		const source = await readFile(
			layoutPath("public-wishlist-page.tsx"),
			"utf8",
		);

		expect(source).toContain('surface = "embedded"');
		expect(source).toContain('mode !== "compact"');
		expect(source).toContain(
			'variant={surface === "standalone" ? "expanded" : "compact"}',
		);
	});

	it("opts published, owner-preview, and personalized routes into standalone", async () => {
		const publicRoute = await readFile(routePath("[slug]", "page.tsx"), "utf8");
		const personalizedRoute = await readFile(
			routePath("[slug]", "[guestSlug]", "page.tsx"),
			"utf8",
		);

		expect(publicRoute).toContain('surface="standalone"');
		expect(publicRoute).toContain(
			'result.kind === "preview" ? "preview" : "full"',
		);
		expect(personalizedRoute).toContain('surface="standalone"');
		expect(personalizedRoute).toContain('mode="full"');
	});
});
