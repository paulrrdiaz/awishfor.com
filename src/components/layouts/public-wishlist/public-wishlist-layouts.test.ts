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

describe("public wishlist RSVP integration", () => {
	const SELF_CONTAINED_FILES = [
		"arch-trio-layout.tsx",
		"collage-staggered-layout.tsx",
		"split-image-right-layout.tsx",
	];
	const SHARED_BODY_FILES = LAYOUT_FILES.filter(
		(file) => !SELF_CONTAINED_FILES.includes(file),
	);

	it("mounts RsvpSection wired to the guest field in every self-contained layout", async () => {
		for (const file of SELF_CONTAINED_FILES) {
			const source = await readFile(layoutPath(file), "utf8");
			expect(source).toContain(
				'import { RsvpSection } from "@/components/shared/rsvp-section"',
			);
			expect(source).toContain("<RsvpSection");
			expect(source).toContain("guest={wishlist.guest}");
		}
	});

	it("routes every other layout's RSVP section through the shared body", async () => {
		const bodySource = await readFile(
			sharedPath("public-wishlist-body.tsx"),
			"utf8",
		);
		expect(bodySource).toContain(
			'import { RsvpSection } from "@/components/shared/rsvp-section"',
		);
		expect(bodySource).toContain("<RsvpSection");
		expect(bodySource).toContain("guest={wishlist.guest}");

		for (const file of SHARED_BODY_FILES) {
			const source = await readFile(layoutPath(file), "utf8");
			expect(source).toContain(
				'import { PublicWishlistBody } from "@/components/shared/public-wishlist-body"',
			);
		}
	});

	it("removed the retired guest welcome section and inline RSVP control everywhere", async () => {
		const bodySource = await readFile(
			sharedPath("public-wishlist-body.tsx"),
			"utf8",
		);
		expect(bodySource).not.toContain("GuestWelcomeSection");
		expect(bodySource).not.toContain("RsvpControl");

		for (const file of LAYOUT_FILES) {
			const source = await readFile(layoutPath(file), "utf8");
			expect(source).not.toContain("GuestWelcomeSection");
			expect(source).not.toContain("RsvpControl");
		}
	});

	it("never prints the guest's name outside the RSVP section", async () => {
		for (const file of LAYOUT_FILES) {
			const source = await readFile(layoutPath(file), "utf8");
			expect(source).not.toContain("primaryName");
			expect(source).not.toContain("guest?.");
		}
	});
});

describe("public wishlist gift list band", () => {
	const SELF_CONTAINED_FILES = [
		"arch-trio-layout.tsx",
		"collage-staggered-layout.tsx",
		"split-image-right-layout.tsx",
	];

	it("wraps the gift section in the shared band at every self-contained call site, preserving its anchor", async () => {
		for (const file of SELF_CONTAINED_FILES) {
			const source = await readFile(layoutPath(file), "utf8");
			expect(source).toContain(
				'import { GiftListBand } from "@/components/shared/gift-list-band"',
			);
			expect(source).toContain("<GiftListBand");
			expect(source).toContain('id="regalos"');
		}
	});

	it("wraps the shared body's gift section in the same band", async () => {
		const bodySource = await readFile(
			sharedPath("public-wishlist-body.tsx"),
			"utf8",
		);
		expect(bodySource).toContain(
			'import { GiftListBand } from "@/components/shared/gift-list-band"',
		);
		expect(bodySource).toContain("<GiftListBand");
		expect(bodySource).toContain('id="regalos"');
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
		const archTrioSource = await readFile(
			layoutPath("arch-trio-layout.tsx"),
			"utf8",
		);

		expect(bodySource).toContain("<WishlistThankYou");
		expect(bodySource).toContain("message={wishlist.thankYouMessage}");
		expect(collageSource).toContain("<WishlistThankYou");
		expect(collageSource).toContain("message={wishlist.thankYouMessage}");
		expect(archTrioSource).toContain("<WishlistThankYou");
		expect(archTrioSource).toContain("message={wishlist.thankYouMessage}");
		expect(bodySource).not.toContain("WishlistFooter");
		expect(collageSource).not.toContain("WishlistFooter");
		expect(archTrioSource).not.toContain("WishlistFooter");
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
