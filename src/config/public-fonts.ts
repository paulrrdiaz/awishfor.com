export type PublicFontPairingId =
	| "serif-soft"
	| "sans-modern"
	| "rounded-friendly";

export type PublicFontPairing = {
	id: PublicFontPairingId;
	label: string;
	description: string;
	dataAttribute: PublicFontPairingId;
};

export const DEFAULT_FONT_PAIRING_ID =
	"serif-soft" satisfies PublicFontPairingId;

const serifSoft: PublicFontPairing = {
	id: "serif-soft",
	label: "Serif suave",
	description: "Lora para títulos e Inter para lectura cómoda.",
	dataAttribute: "serif-soft",
};

export const PUBLIC_FONT_PAIRINGS: PublicFontPairing[] = [
	serifSoft,
	{
		id: "sans-modern",
		label: "Sans moderna",
		description: "Inter para títulos, cuerpo e interfaz.",
		dataAttribute: "sans-modern",
	},
	{
		id: "rounded-friendly",
		label: "Redonda amable",
		description: "Nunito para una lectura más cercana y familiar.",
		dataAttribute: "rounded-friendly",
	},
];

const pairingsById = new Map(
	PUBLIC_FONT_PAIRINGS.map((pairing) => [pairing.id, pairing]),
);

export function resolveFontPairing(
	id: string | null | undefined,
): PublicFontPairing {
	return pairingsById.get(id as PublicFontPairingId) ?? serifSoft;
}

export type FontPairingOption = Pick<PublicFontPairing, "id" | "label">;

export function getAllFontPairingOptions(): FontPairingOption[] {
	return PUBLIC_FONT_PAIRINGS.map(({ id, label }) => ({ id, label }));
}
