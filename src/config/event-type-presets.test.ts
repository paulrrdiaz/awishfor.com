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
		expect(typeof preset.defaultHeroTitleTemplate).toBe("string");
		expect(preset.defaultHeroTitleTemplate.length).toBeGreaterThan(0);
		expect(typeof preset.defaultWelcomeMessage).toBe("string");
		expect(preset.defaultWelcomeMessage.length).toBeGreaterThan(0);
		expect(typeof preset.defaultThankYouMessage).toBe("string");
		expect(preset.defaultThankYouMessage.length).toBeGreaterThan(0);
		expect(Array.isArray(preset.defaultCategories)).toBe(true);
		expect(preset.defaultCategories.length).toBeGreaterThan(0);
		expect(Array.isArray(preset.sampleGifts)).toBe(true);
		expect(preset.sampleGifts.length).toBeGreaterThan(0);
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
});
