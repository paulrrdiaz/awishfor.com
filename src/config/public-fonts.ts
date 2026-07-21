export type PublicHeadingFontId =
	| "lora"
	| "playfair-display"
	| "cormorant-garamond"
	| "dm-serif-display"
	| "inter"
	| "nunito";

export type PublicBodyFontId =
	| "inter"
	| "nunito"
	| "figtree"
	| "source-serif-4"
	| "karla";

export type PublicFontOption = {
	id: string;
	label: string;
	/** The `next/font` CSS custom property declared in `src/lib/fonts.ts`. */
	cssVariable: string;
	fallback: string;
};

export const DEFAULT_HEADING_FONT_ID: PublicHeadingFontId = "lora";
export const DEFAULT_BODY_FONT_ID: PublicBodyFontId = "inter";

const interFont: PublicFontOption = {
	id: "inter",
	label: "Inter",
	cssVariable: "--font-inter",
	fallback: "ui-sans-serif, system-ui, sans-serif",
};

const nunitoFont: PublicFontOption = {
	id: "nunito",
	label: "Nunito",
	cssVariable: "--font-nunito",
	fallback: "ui-rounded, ui-sans-serif, system-ui, sans-serif",
};

export const PUBLIC_HEADING_FONTS: PublicFontOption[] = [
	{
		id: "lora",
		label: "Lora",
		cssVariable: "--font-lora",
		fallback: 'Georgia, Cambria, "Times New Roman", serif',
	},
	{
		id: "playfair-display",
		label: "Playfair Display",
		cssVariable: "--font-playfair-display",
		fallback: "Georgia, serif",
	},
	{
		id: "cormorant-garamond",
		label: "Cormorant Garamond",
		cssVariable: "--font-cormorant-garamond",
		fallback: "Georgia, serif",
	},
	{
		id: "dm-serif-display",
		label: "DM Serif Display",
		cssVariable: "--font-dm-serif-display",
		fallback: "Georgia, serif",
	},
	interFont,
	nunitoFont,
];

export const PUBLIC_BODY_FONTS: PublicFontOption[] = [
	interFont,
	nunitoFont,
	{
		id: "figtree",
		label: "Figtree",
		cssVariable: "--font-figtree",
		fallback: "ui-sans-serif, system-ui, sans-serif",
	},
	{
		id: "source-serif-4",
		label: "Source Serif 4",
		cssVariable: "--font-source-serif-4",
		fallback: "Georgia, serif",
	},
	{
		id: "karla",
		label: "Karla",
		cssVariable: "--font-karla",
		fallback: "ui-sans-serif, system-ui, sans-serif",
	},
];

const headingFontsById = new Map(
	PUBLIC_HEADING_FONTS.map((font) => [font.id, font]),
);
const bodyFontsById = new Map(PUBLIC_BODY_FONTS.map((font) => [font.id, font]));

const defaultHeadingFont = headingFontsById.get(
	DEFAULT_HEADING_FONT_ID,
) as PublicFontOption;
const defaultBodyFont = bodyFontsById.get(
	DEFAULT_BODY_FONT_ID,
) as PublicFontOption;

/** Legacy `fontPairing` values map to a heading/body font pair. */
export const LEGACY_FONT_PAIRING_TO_FONTS: Record<
	string,
	{ headingFont: PublicHeadingFontId; bodyFont: PublicBodyFontId }
> = {
	"serif-soft": { headingFont: "lora", bodyFont: "inter" },
	"sans-modern": { headingFont: "inter", bodyFont: "inter" },
	"rounded-friendly": { headingFont: "nunito", bodyFont: "nunito" },
};

export function resolveHeadingFont(
	headingFont: string | null | undefined,
	fontPairing?: string | null,
): PublicFontOption {
	if (headingFont) {
		const found = headingFontsById.get(headingFont);
		if (found) return found;
	}

	if (fontPairing) {
		const mapped = LEGACY_FONT_PAIRING_TO_FONTS[fontPairing];
		if (mapped)
			return headingFontsById.get(mapped.headingFont) ?? defaultHeadingFont;
	}

	return defaultHeadingFont;
}

export function resolveBodyFont(
	bodyFont: string | null | undefined,
	fontPairing?: string | null,
): PublicFontOption {
	if (bodyFont) {
		const found = bodyFontsById.get(bodyFont);
		if (found) return found;
	}

	if (fontPairing) {
		const mapped = LEGACY_FONT_PAIRING_TO_FONTS[fontPairing];
		if (mapped) return bodyFontsById.get(mapped.bodyFont) ?? defaultBodyFont;
	}

	return defaultBodyFont;
}

export function getAllHeadingFontOptions(): PublicFontOption[] {
	return PUBLIC_HEADING_FONTS;
}

export function getAllBodyFontOptions(): PublicFontOption[] {
	return PUBLIC_BODY_FONTS;
}
