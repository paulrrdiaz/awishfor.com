import { describe, expect, it } from "vitest";
import { PUBLIC_THEME_PRESETS } from "@/config/public-themes";
import {
	getMotifsForEventType,
	MOTIF_PRESETS,
	resolveMotif,
	resolveMotifPalette,
	resolveMotifTreatment,
} from "./motifs";

describe("MOTIF_PRESETS", () => {
	it("contains exactly nine entries", () => {
		expect(MOTIF_PRESETS).toHaveLength(9);
	});

	it("gives every entry a non-empty eventTypes array", () => {
		for (const motif of MOTIF_PRESETS) {
			expect(motif.eventTypes.length).toBeGreaterThan(0);
		}
	});

	it("gives every entry a suggestedThemeId present in PUBLIC_THEME_PRESETS", () => {
		const themeIds = new Set(PUBLIC_THEME_PRESETS.map((theme) => theme.id));
		for (const motif of MOTIF_PRESETS) {
			expect(themeIds.has(motif.suggestedThemeId)).toBe(true);
		}
	});

	it("gives bow-bloom a secondaryColors override and a valid suggestedThemeId", () => {
		const bowBloom = resolveMotif("bow-bloom");
		const themeIds = new Set(PUBLIC_THEME_PRESETS.map((theme) => theme.id));
		expect(bowBloom).not.toBeNull();
		expect(bowBloom?.secondaryColors).toBeDefined();
		expect(themeIds.has(bowBloom?.suggestedThemeId ?? "cielo-suave")).toBe(
			true,
		);
	});
});

describe("resolveMotif", () => {
	it("returns null for null, empty, or unknown ids without throwing", () => {
		expect(resolveMotif(null)).toBeNull();
		expect(resolveMotif(undefined)).toBeNull();
		expect(resolveMotif("")).toBeNull();
		expect(() => resolveMotif("not-a-motif")).not.toThrow();
		expect(resolveMotif("not-a-motif")).toBeNull();
	});

	it("resolves a known id to its preset", () => {
		expect(resolveMotif("bear-cloud")?.id).toBe("bear-cloud");
	});
});

describe("getMotifsForEventType", () => {
	it("returns exactly unicorn-rainbow, elephant-balloon, moon-stars and bow-bloom for birthday", () => {
		const ids = getMotifsForEventType("birthday")
			.map((motif) => motif.id)
			.sort();
		expect(ids).toEqual(
			["bow-bloom", "elephant-balloon", "moon-stars", "unicorn-rainbow"].sort(),
		);
	});

	it("returns all nine sets for baby_shower", () => {
		expect(getMotifsForEventType("baby_shower")).toHaveLength(9);
	});
});

describe("resolveMotifTreatment", () => {
	it("defaults to scene for invalid or missing values", () => {
		expect(resolveMotifTreatment(null)).toBe("scene");
		expect(resolveMotifTreatment(undefined)).toBe("scene");
		expect(resolveMotifTreatment("not-a-treatment")).toBe("scene");
	});

	it("accepts band", () => {
		expect(resolveMotifTreatment("band")).toBe("band");
	});
});

describe("resolveMotifPalette", () => {
	it("defaults to fixed for invalid or missing values", () => {
		expect(resolveMotifPalette(null)).toBe("fixed");
		expect(resolveMotifPalette(undefined)).toBe("fixed");
		expect(resolveMotifPalette("not-a-palette")).toBe("fixed");
	});

	it("accepts themed", () => {
		expect(resolveMotifPalette("themed")).toBe("themed");
	});
});
