import type { ThemePresetId } from "@/config/public-themes";
import type { EventType } from "@/generated/prisma/enums";

// Motif proposals: `Motif Proposals.dc.html`
export type MotifId =
	| "bear-cloud"
	| "flower-bunny"
	| "unicorn-rainbow"
	| "forest-fox"
	| "duck-boat"
	| "elephant-balloon"
	| "moon-stars"
	| "dino-leaf"
	| "bow-bloom";

export const MOTIF_IDS: MotifId[] = [
	"bear-cloud",
	"flower-bunny",
	"unicorn-rainbow",
	"forest-fox",
	"duck-boat",
	"elephant-balloon",
	"moon-stars",
	"dino-leaf",
	"bow-bloom",
];

export type MotifShape =
	| "cloud"
	| "bear"
	| "flower"
	| "bunny"
	| "rainbow"
	| "unicorn"
	| "star"
	| "tree"
	| "fox"
	| "duck"
	| "boat"
	| "elephant"
	| "balloon"
	| "moon"
	| "leaf"
	| "dino"
	| "bow"
	| "bloom";

export type MotifTreatment = "scene" | "band";
export const MOTIF_TREATMENTS: MotifTreatment[] = ["scene", "band"];
export const DEFAULT_MOTIF_TREATMENT: MotifTreatment = "scene";

export type MotifPalette = "fixed" | "themed";
export const MOTIF_PALETTES: MotifPalette[] = ["fixed", "themed"];
export const DEFAULT_MOTIF_PALETTE: MotifPalette = "fixed";

export type MotifColors = {
	m1: string;
	m2: string;
	m3: string;
	mc1?: string;
};

export type MotifPreset = {
	id: MotifId;
	label: string;
	/** [primary (figurative, carries the fixed palette), secondary (prop/accent)] */
	shapes: [MotifShape, MotifShape];
	eventTypes: EventType[];
	colors: MotifColors;
	/**
	 * Fixed-palette-only color identity for the secondary shape, where the
	 * design gives it its own natural color (e.g. an orange fox) rather than
	 * the set's ambient palette. Absent when the secondary shape shares the
	 * primary's tokens. Never applied under the `themed` palette.
	 */
	secondaryColors?: Partial<MotifColors>;
	/**
	 * Feature ink used on `data-motif-surface="primary"` (the `band`
	 * treatment's countdown chip and gift sticker). Either a hex lifted from
	 * the design's `band` card, or the literal `var(--primary-foreground)`
	 * where the design did not override `--m3` for that set.
	 */
	m3Inverted: string;
	suggestedThemeId: ThemePresetId;
};

export const MOTIF_PRESETS: MotifPreset[] = [
	{
		id: "bear-cloud",
		label: "Osito y nube",
		shapes: ["bear", "cloud"],
		eventTypes: ["baby_shower"],
		colors: { m1: "#C99A6B", m2: "#F7EFE3", m3: "#4A3324", mc1: "#FFFFFF" },
		m3Inverted: "#1B2A40",
		suggestedThemeId: "cielo-suave",
	},
	{
		id: "flower-bunny",
		label: "Flores y conejito",
		shapes: ["flower", "bunny"],
		eventTypes: ["baby_shower"],
		colors: { m1: "#E8637E", m2: "#F6D9A8", m3: "#7A2E42" },
		m3Inverted: "var(--primary-foreground)",
		suggestedThemeId: "dulce-rosa",
	},
	{
		id: "unicorn-rainbow",
		label: "Unicornio y arcoíris",
		shapes: ["unicorn", "rainbow"],
		eventTypes: ["baby_shower", "birthday"],
		colors: { m1: "#A78BDE", m2: "#EF9FC0", m3: "#F2C464" },
		m3Inverted: "var(--primary-foreground)",
		suggestedThemeId: "lavanda-fiesta",
	},
	{
		id: "forest-fox",
		label: "Bosque y zorrito",
		shapes: ["tree", "fox"],
		eventTypes: ["baby_shower"],
		colors: { m1: "#6E9B6E", m2: "#A9714A", m3: "#3A2A1D" },
		secondaryColors: { m1: "#D98A55", m2: "#F7EFE3" },
		m3Inverted: "#22382A",
		suggestedThemeId: "jardin-verde",
	},
	{
		id: "duck-boat",
		label: "Patito y velero",
		shapes: ["duck", "boat"],
		eventTypes: ["baby_shower"],
		colors: { m1: "#F2C464", m2: "#E8834A", m3: "#2A3F52" },
		secondaryColors: { m1: "#2F5C82", m2: "#FDF6E8", m3: "#1F3346" },
		m3Inverted: "#1B2A40",
		suggestedThemeId: "cielo-suave",
	},
	{
		id: "elephant-balloon",
		label: "Elefante y globo",
		shapes: ["elephant", "balloon"],
		eventTypes: ["baby_shower", "birthday"],
		colors: { m1: "#8FB6AA", m2: "#C9E6DC", m3: "#33473F" },
		secondaryColors: { m1: "#EE8A6E", m3: "#5C3A2E" },
		m3Inverted: "#9A4E36",
		suggestedThemeId: "jardin-verde",
	},
	{
		id: "moon-stars",
		label: "Luna y estrellas",
		shapes: ["moon", "star"],
		eventTypes: ["baby_shower", "birthday"],
		colors: { m1: "#E8C468", m2: "#E8C468", m3: "#2E3350" },
		m3Inverted: "var(--primary-foreground)",
		suggestedThemeId: "lavanda-fiesta",
	},
	{
		id: "dino-leaf",
		label: "Dino y hoja",
		shapes: ["dino", "leaf"],
		eventTypes: ["baby_shower"],
		colors: { m1: "#8C9A5D", m2: "#D9A441", m3: "#3B3C29" },
		secondaryColors: { m1: "#5E7A48", m3: "#33421F" },
		m3Inverted: "#3B4F2A",
		suggestedThemeId: "jardin-verde",
	},
	{
		id: "bow-bloom",
		label: "Lazos y flores",
		shapes: ["bow", "bloom"],
		eventTypes: ["baby_shower", "birthday"],
		colors: { m1: "#E3A0B4", m2: "#F5E7D8", m3: "#6B3D4C" },
		secondaryColors: { m1: "#EFB98A" },
		m3Inverted: "#5A2F3C",
		suggestedThemeId: "cielo-suave-rosa",
	},
];

const motifsById = new Map(MOTIF_PRESETS.map((motif) => [motif.id, motif]));

export function resolveMotif(
	id: string | null | undefined,
): MotifPreset | null {
	if (!id) {
		return null;
	}
	return motifsById.get(id as MotifId) ?? null;
}

export function getAllMotifs(): MotifPreset[] {
	return MOTIF_PRESETS;
}

export function getMotifsForEventType(eventType: EventType): MotifPreset[] {
	return MOTIF_PRESETS.filter((motif) => motif.eventTypes.includes(eventType));
}

/** Event types the motif picker is offered for. */
export const MOTIF_GATED_EVENT_TYPES: EventType[] = ["baby_shower", "birthday"];

export function isMotifGatedEventType(eventType: EventType): boolean {
	return MOTIF_GATED_EVENT_TYPES.includes(eventType);
}

export function resolveMotifTreatment(
	value: string | null | undefined,
): MotifTreatment {
	return value === "band" ? "band" : DEFAULT_MOTIF_TREATMENT;
}

export function resolveMotifPalette(
	value: string | null | undefined,
): MotifPalette {
	return value === "themed" ? "themed" : DEFAULT_MOTIF_PALETTE;
}
