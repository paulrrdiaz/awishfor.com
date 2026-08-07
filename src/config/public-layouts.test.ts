import { describe, expect, it } from "vitest";
import {
	buildImageGuidanceHint,
	DEFAULT_LAYOUT_ID,
	getAllLayouts,
	IMAGE_ORIENTATION_GLYPHS,
	resolveLayout,
} from "./public-layouts";

describe("resolveLayout", () => {
	it("resolves an explicit layout id", () => {
		expect(resolveLayout("carousel-hero").id).toBe("carousel-hero");
	});

	it("falls back to the default when the id is null", () => {
		expect(resolveLayout(null).id).toBe(DEFAULT_LAYOUT_ID);
	});

	it("falls back to the default when the id is unknown", () => {
		expect(resolveLayout("not-a-real-layout").id).toBe(DEFAULT_LAYOUT_ID);
	});

	it("falls back to the default for a retired layout id", () => {
		for (const id of [
			"grid",
			"editorial",
			"minimal",
			"hero-cinematic",
			"arch-split",
			"wedding-formal",
			"panoramic-band",
			"diagonal-duo",
		]) {
			expect(resolveLayout(id).id).toBe(DEFAULT_LAYOUT_ID);
		}
	});
});

describe("getAllLayouts", () => {
	const layouts = getAllLayouts();

	it("exposes exactly the nine design layouts", () => {
		expect(layouts).toHaveLength(9);
		expect(layouts.map((layout) => layout.id).sort()).toEqual(
			[
				"arch-hero-party",
				"arch-trio",
				"carousel-hero",
				"collage-staggered",
				"magazine-editorial",
				"overlap-duo",
				"portrait-frame-split",
				"scrapbook-polaroids",
				"split-image-right",
			].sort(),
		);
	});

	it("does not flag any layout as deprecated", () => {
		for (const layout of layouts) {
			expect(layout).not.toHaveProperty("deprecated");
		}
	});

	it("default layout resolves within the catalog", () => {
		const ids = layouts.map((layout) => layout.id);
		expect(ids).toContain(DEFAULT_LAYOUT_ID);
	});

	it("declares heroImageSlots and supportsCarousel for every layout", () => {
		for (const layout of layouts) {
			expect(typeof layout.heroImageSlots).toBe("number");
			expect(typeof layout.supportsCarousel).toBe("boolean");
			expect(layout.imageGuidance).toBeDefined();
		}
	});

	it("gives fixed-slot layouts the right slot counts and capabilities", () => {
		const byId = Object.fromEntries(layouts.map((l) => [l.id, l]));
		expect(byId["overlap-duo"]?.heroImageSlots).toBe(2);
		expect(byId["overlap-duo"]?.supportsCarousel).toBe(false);
		expect(byId["split-image-right"]?.heroImageSlots).toBe(2);
		expect(byId["split-image-right"]?.supportsCarousel).toBe(false);
		expect(byId["collage-staggered"]?.heroImageSlots).toBe(3);
		expect(byId["collage-staggered"]?.supportsCarousel).toBe(true);
		expect(byId["collage-staggered"]?.giftCardStyle).toBe("collage");
		for (const id of ["arch-trio", "scrapbook-polaroids"]) {
			expect(byId[id]?.heroImageSlots).toBe(3);
			expect(byId[id]?.supportsCarousel).toBe(false);
		}
		for (const id of ["magazine-editorial", "portrait-frame-split"]) {
			expect(byId[id]?.heroImageSlots).toBe(1);
			expect(byId[id]?.supportsCarousel).toBe(false);
		}
	});

	it("gives gallery/carousel layouts a 6-image cap with carousel support", () => {
		const byId = Object.fromEntries(layouts.map((l) => [l.id, l]));
		for (const id of ["arch-hero-party", "carousel-hero"]) {
			expect(byId[id]?.heroImageSlots).toBe(6);
			expect(byId[id]?.supportsCarousel).toBe(true);
		}
	});
});

describe("layout image guidance", () => {
	it("uses sourced image guidance for active layouts", () => {
		const byId = Object.fromEntries(
			getAllLayouts().map((layout) => [layout.id, layout]),
		);
		expect(byId["carousel-hero"]?.imageGuidance).toEqual({
			ratio: "16:9",
			orientation: "landscape",
		});
		expect(byId["arch-trio"]?.imageGuidance).toMatchObject({
			ratio: "1:1",
			orientation: "square",
			centeredSubject: true,
		});
		expect(byId["collage-staggered"]?.imageGuidance).toMatchObject({
			ratio: "3:4",
			orientation: "portrait",
			mixed: true,
		});
	});

	it("builds one shared, readable hint with the orientation glyph", () => {
		expect(IMAGE_ORIENTATION_GLYPHS).toEqual({
			landscape: "▭",
			portrait: "▯",
			square: "◻",
		});
		expect(buildImageGuidanceHint(resolveLayout("carousel-hero"))).toBe(
			"Este diseño muestra 6 fotos · horizontal ▭ 16:9",
		);
		expect(buildImageGuidanceHint(resolveLayout("arch-trio"))).toBe(
			"Este diseño muestra 3 fotos · cuadrada ◻ 1:1 · centra el sujeto",
		);
	});
});
