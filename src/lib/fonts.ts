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
});

export const fontPlayfairDisplay = Playfair_Display({
	subsets: ["latin"],
	weight: ["400", "500", "600", "700"],
	variable: "--font-playfair-display",
	display: "swap",
});

export const fontCormorantGaramond = Cormorant_Garamond({
	subsets: ["latin"],
	weight: ["400", "500", "600", "700"],
	variable: "--font-cormorant-garamond",
	display: "swap",
});

export const fontDmSerifDisplay = DM_Serif_Display({
	subsets: ["latin"],
	weight: "400",
	variable: "--font-dm-serif-display",
	display: "swap",
});

export const fontInter = Inter({
	subsets: ["latin"],
	weight: ["400", "500", "600", "700"],
	variable: "--font-inter",
	display: "swap",
});

export const fontNunito = Nunito({
	subsets: ["latin"],
	weight: ["400", "500", "600", "700"],
	variable: "--font-nunito",
	display: "swap",
});

export const fontFigtree = Figtree({
	subsets: ["latin"],
	weight: ["400", "500", "600"],
	variable: "--font-figtree",
	display: "swap",
});

export const fontSourceSerif4 = Source_Serif_4({
	subsets: ["latin"],
	weight: ["400", "500", "600"],
	variable: "--font-source-serif-4",
	display: "swap",
});

export const fontKarla = Karla({
	subsets: ["latin"],
	weight: ["400", "500", "600"],
	variable: "--font-karla",
	display: "swap",
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
