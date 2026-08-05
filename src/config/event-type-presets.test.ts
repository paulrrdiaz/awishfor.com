import { describe, expect, it } from "vitest";
import { EventType } from "@/generated/prisma/enums";
import { EVENT_TYPE_PRESETS } from "./event-type-presets";
import { resolveLayout } from "./public-layouts";
import { resolveTheme } from "./public-themes";

const ALL_EVENT_TYPES = Object.values(EventType) as Array<
	(typeof EventType)[keyof typeof EventType]
>;

describe("EVENT_TYPE_PRESETS", () => {
	it("has a preset for every EventType", () => {
		for (const type of ALL_EVENT_TYPES) {
			expect(EVENT_TYPE_PRESETS[type]).toBeDefined();
		}
	});

	it.each(ALL_EVENT_TYPES)("preset %s has all required fields", (type) => {
		const preset = EVENT_TYPE_PRESETS[type];
		expect(preset.eventType).toBe(type);
		expect(typeof preset.label).toBe("string");
		expect(preset.label.length).toBeGreaterThan(0);
		expect(typeof preset.defaultWelcomeMessage).toBe("string");
		expect(preset.defaultWelcomeMessage.length).toBeGreaterThan(0);
		expect(typeof preset.defaultThankYouMessage).toBe("string");
		expect(preset.defaultThankYouMessage.length).toBeGreaterThan(0);
		expect(Array.isArray(preset.defaultCategories)).toBe(true);
		expect(preset.defaultCategories.length).toBeGreaterThan(0);
		expect(Array.isArray(preset.sampleGifts)).toBe(true);
		expect(preset.sampleGifts.length).toBeGreaterThan(0);
	});

	it("exposes no hero-title template on any preset", () => {
		for (const type of ALL_EVENT_TYPES) {
			expect(EVENT_TYPE_PRESETS[type]).not.toHaveProperty(
				"defaultHeroTitleTemplate",
			);
		}
	});

	it.each(
		ALL_EVENT_TYPES,
	)("preset %s theme and layout ids resolve to real presets", (type) => {
		const preset = EVENT_TYPE_PRESETS[type];
		const theme = resolveTheme(preset.defaultThemeId);
		expect(theme.id).toBe(preset.defaultThemeId);
		const layout = resolveLayout(preset.defaultLayoutId);
		expect(layout.id).toBe(preset.defaultLayoutId);
	});

	it("default layouts match the design-exploration table and avoid retired presets", () => {
		const expected: Record<string, string> = {
			baby_shower: "collage-staggered",
			birthday: "arch-hero-party",
			wedding: "carousel-hero",
			housewarming: "split-image-right",
			general: "magazine-editorial",
		};
		const retiredIds = new Set([
			"grid",
			"editorial",
			"minimal",
			"hero-cinematic",
			"arch-split",
			"wedding-formal",
			"panoramic-band",
			"diagonal-duo",
		]);

		for (const type of ALL_EVENT_TYPES) {
			const preset = EVENT_TYPE_PRESETS[type];
			expect(preset.defaultLayoutId).toBe(expected[type]);
			expect(retiredIds.has(preset.defaultLayoutId)).toBe(false);
		}
	});

	it("baby_shower has correct Spanish label and PRD categories", () => {
		const preset = EVENT_TYPE_PRESETS.baby_shower;
		expect(preset.label).toBe("Baby shower");
		expect(preset.defaultCategories).toEqual([
			"Pañales",
			"Ropa",
			"Lactancia",
			"Baño",
			"Dormitorio",
			"Juguetes",
			"Otros",
		]);
	});

	it.each(
		ALL_EVENT_TYPES,
	)("preset %s has landscape and portrait sample cover images", (type) => {
		const preset = EVENT_TYPE_PRESETS[type];
		expect(Array.isArray(preset.sampleCoverImages.landscape)).toBe(true);
		expect(Array.isArray(preset.sampleCoverImages.portrait)).toBe(true);
		expect(preset.sampleCoverImages.landscape.length).toBeGreaterThan(0);
		expect(preset.sampleCoverImages.portrait.length).toBeGreaterThan(0);
		for (const sample of [
			...preset.sampleCoverImages.landscape,
			...preset.sampleCoverImages.portrait,
		]) {
			expect(typeof sample.url).toBe("string");
			expect(typeof sample.width).toBe("number");
			expect(typeof sample.height).toBe("number");
			expect(["landscape", "portrait", "square"]).toContain(sample.orientation);
		}
	});

	it("supplies enough samples per orientation to fill the largest heroImageSlots", () => {
		const largestSlots = Math.max(
			...["arch-hero-party", "carousel-hero"].map(
				(id) => resolveLayout(id).heroImageSlots,
			),
		);
		for (const type of ALL_EVENT_TYPES) {
			const preset = EVENT_TYPE_PRESETS[type];
			expect(preset.sampleCoverImages.landscape.length).toBeGreaterThanOrEqual(
				largestSlots,
			);
			expect(preset.sampleCoverImages.portrait.length).toBeGreaterThanOrEqual(
				largestSlots,
			);
		}
	});

	it("sample cover image hosts are already configured for next/image", () => {
		for (const type of ALL_EVENT_TYPES) {
			const preset = EVENT_TYPE_PRESETS[type];
			for (const sample of [
				...preset.sampleCoverImages.landscape,
				...preset.sampleCoverImages.portrait,
			]) {
				expect(new URL(sample.url).hostname).toBe("images.unsplash.com");
			}
		}
	});
});
