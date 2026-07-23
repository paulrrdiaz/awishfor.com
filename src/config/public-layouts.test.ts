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
		expect(resolveLayout("arch-split").id).toBe("arch-split");
	});

	it("falls back to the default when the id is null", () => {
		expect(resolveLayout(null).id).toBe(DEFAULT_LAYOUT_ID);
	});

	it("falls back to the default when the id is unknown", () => {
		expect(resolveLayout("not-a-real-layout").id).toBe(DEFAULT_LAYOUT_ID);
	});

	it("still resolves a legacy wishlist referencing a deprecated layout", () => {
		const layout = resolveLayout("grid");
		expect(layout.id).toBe("grid");
		expect(layout.deprecated).toBe(true);
	});
});

describe("getAllLayouts", () => {
	const layouts = getAllLayouts();

	it("exposes 17 layout presets (14 new + 3 legacy)", () => {
		expect(layouts).toHaveLength(17);
	});

	it("flags grid, editorial, and minimal as deprecated", () => {
		const deprecatedIds = layouts
			.filter((layout) => layout.deprecated)
			.map((layout) => layout.id);
		expect(deprecatedIds.sort()).toEqual(["editorial", "grid", "minimal"]);
	});

	it("sorts deprecated layouts after the new explorations", () => {
		const ids = layouts.map((layout) => layout.id);
		const lastNewIndex = ids.indexOf("portrait-frame-split");
		const firstDeprecatedIndex = ids.findIndex(
			(id) => id === "grid" || id === "editorial" || id === "minimal",
		);
		expect(lastNewIndex).toBeLessThan(firstDeprecatedIndex);
	});

	it("declares heroImageSlots and supportsCarousel for every layout", () => {
		for (const layout of layouts) {
			expect(typeof layout.heroImageSlots).toBe("number");
			expect(typeof layout.supportsCarousel).toBe("boolean");
			expect(layout.imageGuidance).toBeDefined();
		}
	});

	it("gives fixed-slot layouts the right slot counts without carousel support", () => {
		const byId = Object.fromEntries(layouts.map((l) => [l.id, l]));
		expect(byId["overlap-duo"]?.heroImageSlots).toBe(2);
		expect(byId["overlap-duo"]?.supportsCarousel).toBe(false);
		for (const id of [
			"collage-staggered",
			"arch-trio",
			"diagonal-duo",
			"scrapbook-polaroids",
		]) {
			expect(byId[id]?.heroImageSlots).toBe(3);
			expect(byId[id]?.supportsCarousel).toBe(false);
		}
		for (const id of [
			"split-image-right",
			"magazine-editorial",
			"wedding-formal",
			"portrait-frame-split",
		]) {
			expect(byId[id]?.heroImageSlots).toBe(1);
			expect(byId[id]?.supportsCarousel).toBe(false);
		}
	});

	it("gives gallery/carousel layouts a 6-image cap with carousel support", () => {
		const byId = Object.fromEntries(layouts.map((l) => [l.id, l]));
		for (const id of [
			"hero-cinematic",
			"arch-split",
			"arch-hero-party",
			"panoramic-band",
			"carousel-hero",
		]) {
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
		expect(byId["hero-cinematic"]?.imageGuidance).toEqual({
			ratio: "16:9",
			orientation: "landscape",
		});
		expect(byId["arch-trio"]?.imageGuidance).toMatchObject({
			ratio: "1:1",
			orientation: "square",
			centeredSubject: true,
		});
		expect(byId["diagonal-duo"]?.imageGuidance.centeredSubject).toBe(true);
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
		expect(buildImageGuidanceHint(resolveLayout("hero-cinematic"))).toBe(
			"Este diseño muestra 6 fotos · horizontal ▭ 16:9",
		);
		expect(buildImageGuidanceHint(resolveLayout("arch-trio"))).toBe(
			"Este diseño muestra 3 fotos · cuadrada ◻ 1:1 · centra el sujeto",
		);
	});
});
