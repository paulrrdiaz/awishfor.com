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
	it("renders shared-body CTAs once after the welcome message", async () => {
		const bodySource = await readFile(
			sharedPath("public-wishlist-body.tsx"),
			"utf8",
		);
		expect(bodySource.match(/<HeroCtas/g)).toHaveLength(1);
		expect(bodySource.indexOf("<WishlistMessage")).toBeLessThan(
			bodySource.indexOf("<HeroCtas"),
		);
		expect(bodySource).toContain("showHowItWorks={wishlist.showHowItWorks}");

		for (const file of [
			"carousel-hero-layout.tsx",
			"scrapbook-polaroids-layout.tsx",
			"portrait-frame-split-layout.tsx",
			"arch-hero-party-layout.tsx",
			"overlap-duo-layout.tsx",
			"magazine-editorial-layout.tsx",
		]) {
			const source = await readFile(layoutPath(file), "utf8");
			expect(source).not.toContain("HeroCtas");
		}
	});

	it("keeps one non-compact CTA group in every self-contained layout", async () => {
		for (const file of [
			"arch-trio-layout.tsx",
			"split-image-right-layout.tsx",
			"collage-staggered-layout.tsx",
		]) {
			const source = await readFile(layoutPath(file), "utf8");
			expect(source.match(/<HeroCtas/g), file).toHaveLength(1);
			expect(source).toContain("showHowItWorks={wishlist.showHowItWorks}");
			expect(source).toContain('mode === "compact"');
		}
	});

	it("renders the optional subtitle in every layout", async () => {
		for (const file of LAYOUT_FILES) {
			const source = await readFile(layoutPath(file), "utf8");
			expect(source).toContain("wishlist.subtitle");
		}
	});

	it("keeps the shared body free of the retired inline section", async () => {
		const source = await readFile(
			sharedPath("public-wishlist-body.tsx"),
			"utf8",
		);

		expect(source).not.toContain("HowItWorksDrawer");
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

	it("mounts the route-provided RSVP slot in every self-contained layout", async () => {
		for (const file of SELF_CONTAINED_FILES) {
			const source = await readFile(layoutPath(file), "utf8");
			expect(source).not.toContain("rsvp-section");
			expect(source).toContain("rsvpSection?: ReactNode");
			expect(source).toContain("{rsvpSection}");
		}
	});

	it("keeps the shared body free of personalized mutation code", async () => {
		const bodySource = await readFile(
			sharedPath("public-wishlist-body.tsx"),
			"utf8",
		);
		expect(bodySource).not.toContain("rsvp-section");
		expect(bodySource).toContain("{rsvpSection}");

		const pageSource = await readFile(
			layoutPath("public-wishlist-page.tsx"),
			"utf8",
		);
		expect(pageSource).toContain("rsvpSection={rsvpSection}");
		expect(pageSource).not.toContain("!isSelfContainedLayout && rsvpSection");

		for (const file of SHARED_BODY_FILES) {
			const source = await readFile(layoutPath(file), "utf8");
			expect(source).toContain(
				'import { PublicWishlistBody } from "@/components/shared/public-wishlist-body"',
			);
			expect(source).toContain("rsvpSection?: ReactNode");
			expect(source).toContain("rsvpSection={rsvpSection}");
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
				'import { GiftSection } from "@/components/shared/gift-section"',
			);
			expect(source).toContain("<GiftSection");
			expect(source).toContain('id="regalos"');
		}
	});

	it("wraps the shared body's gift section in the same band", async () => {
		const bodySource = await readFile(
			sharedPath("public-wishlist-body.tsx"),
			"utf8",
		);
		expect(bodySource).toContain(
			'import { GiftSection } from "@/components/shared/gift-section"',
		);
		expect(bodySource).toContain("<GiftSection");
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

describe("public wishlist image priority", () => {
	it("declares exactly one non-compact hero priority in every layout", async () => {
		for (const file of LAYOUT_FILES) {
			const source = await readFile(layoutPath(file), "utf8");
			expect(
				source.match(/priority=\{!isCompact(?:\s*&&\s*index\s*===\s*0)?\}/g),
				file,
			).toHaveLength(1);
		}
	});

	it("leaves gift images on Next Image's lazy default", async () => {
		const source = await readFile(sharedPath("gift-card.tsx"), "utf8");
		expect(source).not.toMatch(/<Image[\s\S]{0,240}priority=/);
		expect(source).not.toContain('loading="eager"');
	});
});
