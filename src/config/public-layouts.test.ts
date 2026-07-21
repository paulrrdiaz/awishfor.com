import { describe, expect, it } from "vitest";
import {
	DEFAULT_LAYOUT_ID,
	getAllLayouts,
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
