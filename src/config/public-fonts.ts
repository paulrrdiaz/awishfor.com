import {
	Cormorant_Garamond,
	Inter,
	Lato,
	Montserrat,
	Nunito,
	Playfair_Display,
} from "next/font/google";

// Heading fonts — all expose --public-font-heading
const playfairDisplay = Playfair_Display({
	subsets: ["latin"],
	variable: "--public-font-heading",
	display: "swap",
});

const cormorantGaramond = Cormorant_Garamond({
	subsets: ["latin"],
	weight: ["300", "400", "600"],
	variable: "--public-font-heading",
	display: "swap",
});

const interHeading = Inter({
	subsets: ["latin"],
	variable: "--public-font-heading",
	display: "swap",
});

const nunitoHeading = Nunito({
	subsets: ["latin"],
	variable: "--public-font-heading",
	display: "swap",
});

// Body fonts — all expose --public-font-body
const latoBody = Lato({
	subsets: ["latin"],
	weight: ["400", "700"],
	variable: "--public-font-body",
	display: "swap",
});

const montserratBody = Montserrat({
	subsets: ["latin"],
	variable: "--public-font-body",
	display: "swap",
});

const interBody = Inter({
	subsets: ["latin"],
	variable: "--public-font-body",
	display: "swap",
});

const nunitoBody = Nunito({
	subsets: ["latin"],
	variable: "--public-font-body",
	display: "swap",
});

export type PublicFontPairing = {
	id: string;
	label: string;
	heading: { className: string; variable: string };
	body: { className: string; variable: string };
};

const classic: PublicFontPairing = {
	id: "classic",
	label: "Classic",
	heading: playfairDisplay,
	body: latoBody,
};

const fontPairings: Record<string, PublicFontPairing> = {
	classic,
	modern: {
		id: "modern",
		label: "Modern",
		heading: interHeading,
		body: interBody,
	},
	romantic: {
		id: "romantic",
		label: "Romantic",
		heading: cormorantGaramond,
		body: montserratBody,
	},
	playful: {
		id: "playful",
		label: "Playful",
		heading: nunitoHeading,
		body: nunitoBody,
	},
};

export function resolveFontPairing(
	id: string | null | undefined,
): PublicFontPairing {
	return fontPairings[id ?? ""] ?? classic;
}

export type FontPairingOption = { id: string; label: string };

export function getAllFontPairingOptions(): FontPairingOption[] {
	return Object.values(fontPairings).map(({ id, label }) => ({ id, label }));
}
