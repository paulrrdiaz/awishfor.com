import {
	Cormorant_Garamond,
	DM_Serif_Display,
	Figtree,
	Inter,
	Karla,
	Lora,
	Nunito,
	Playfair_Display,
	Source_Serif_4,
} from "next/font/google";

/**
 * All font families referenced by `src/config/public-fonts.ts` are declared
 * once here (`next/font` requires static module-scope calls) and loaded on
 * the root layout via `--font-<id>` CSS variables. Inter and Nunito double as
 * both heading and body options, so their weight range is the union of both.
 */
export const fontLora = Lora({
	subsets: ["latin"],
	weight: ["400", "500", "600", "700"],
	variable: "--font-lora",
	display: "swap",
	preload: false,
});

export const fontPlayfairDisplay = Playfair_Display({
	subsets: ["latin"],
	weight: ["400", "500", "600", "700"],
	variable: "--font-playfair-display",
	display: "swap",
	preload: false,
});

export const fontCormorantGaramond = Cormorant_Garamond({
	subsets: ["latin"],
	weight: ["400", "500", "600", "700"],
	variable: "--font-cormorant-garamond",
	display: "swap",
	preload: false,
});

export const fontDmSerifDisplay = DM_Serif_Display({
	subsets: ["latin"],
	weight: "400",
	variable: "--font-dm-serif-display",
	display: "swap",
	preload: false,
});

export const fontInter = Inter({
	subsets: ["latin"],
	weight: ["400", "500", "600", "700"],
	variable: "--font-inter",
	display: "swap",
	preload: false,
});

export const fontNunito = Nunito({
	subsets: ["latin"],
	weight: ["400", "500", "600", "700"],
	variable: "--font-nunito",
	display: "swap",
	preload: false,
});

export const fontFigtree = Figtree({
	subsets: ["latin"],
	weight: ["400", "500", "600"],
	variable: "--font-figtree",
	display: "swap",
	preload: false,
});

export const fontSourceSerif4 = Source_Serif_4({
	subsets: ["latin"],
	weight: ["400", "500", "600"],
	variable: "--font-source-serif-4",
	display: "swap",
	preload: false,
});

export const fontKarla = Karla({
	subsets: ["latin"],
	weight: ["400", "500", "600"],
	variable: "--font-karla",
	display: "swap",
	preload: false,
});

export const PUBLIC_FONT_VARIABLE_CLASSES = [
	fontLora.variable,
	fontPlayfairDisplay.variable,
	fontCormorantGaramond.variable,
	fontDmSerifDisplay.variable,
	fontInter.variable,
	fontNunito.variable,
	fontFigtree.variable,
	fontSourceSerif4.variable,
	fontKarla.variable,
].join(" ");

export const PUBLIC_FONT_VARIABLE_CLASS_BY_ID: Record<string, string> = {
	lora: fontLora.variable,
	"playfair-display": fontPlayfairDisplay.variable,
	"cormorant-garamond": fontCormorantGaramond.variable,
	"dm-serif-display": fontDmSerifDisplay.variable,
	inter: fontInter.variable,
	nunito: fontNunito.variable,
	figtree: fontFigtree.variable,
	"source-serif-4": fontSourceSerif4.variable,
	karla: fontKarla.variable,
};
