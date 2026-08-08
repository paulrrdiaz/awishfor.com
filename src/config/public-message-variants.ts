export type PublicMessageVariantPreset = {
	id: string;
	label: string;
	description: string;
};

// Countdown proposals: `Cuenta Regresiva Proposals.dc.html`
export type CountdownVariantId = (typeof COUNTDOWN_VARIANT_IDS)[number];

export const COUNTDOWN_VARIANT_IDS = [
	"filled-pill",
	"outline-pill",
	"progress-bar",
] as const;

const countdownVariantList: PublicMessageVariantPreset[] = [
	{
		// Origin: Cuenta Regresiva Proposals.dc.html, proposal 2a
		id: "filled-pill",
		label: "Píldora sólida",
		description: "Píldora de color sólido con un punto indicador.",
	},
	{
		// Origin: Cuenta Regresiva Proposals.dc.html, proposal 2d
		id: "outline-pill",
		label: "Píldora con contorno",
		description: "Píldora de contorno sutil con un punto de acento.",
	},
	{
		// Origin: Cuenta Regresiva Proposals.dc.html, proposal 1d
		id: "progress-bar",
		label: "Barra de progreso",
		description:
			"Barra que avanza desde la creación de la lista hasta el evento.",
	},
];

export const DEFAULT_COUNTDOWN_VARIANT_ID: CountdownVariantId = "outline-pill";

const countdownVariants: Record<string, PublicMessageVariantPreset> =
	Object.fromEntries(countdownVariantList.map((v) => [v.id, v]));

export function getAllCountdownVariants(): PublicMessageVariantPreset[] {
	return countdownVariantList;
}

export function resolveCountdownVariant(
	id: string | null | undefined,
): PublicMessageVariantPreset {
	return (
		countdownVariants[id ?? ""] ??
		(countdownVariants[
			DEFAULT_COUNTDOWN_VARIANT_ID
		] as PublicMessageVariantPreset)
	);
}

// Welcome proposals: `Welcome Message Proposals.dc.html`
export type WelcomeVariantId = (typeof WELCOME_VARIANT_IDS)[number];

export const WELCOME_VARIANT_IDS = [
	"postcard",
	"handwritten",
	"avatars",
] as const;

const welcomeVariantList: PublicMessageVariantPreset[] = [
	{
		// Origin: Welcome Message Proposals.dc.html, proposal 2a
		id: "postcard",
		label: "Postal",
		description: "Marco punteado con un sello «PARA TI» estático.",
	},
	{
		// Origin: Welcome Message Proposals.dc.html, proposal 1c
		id: "handwritten",
		label: "Manuscrita",
		description: "Nota ligeramente rotada con un sello de iniciales.",
	},
	{
		// Origin: Welcome Message Proposals.dc.html, proposal 1d
		id: "avatars",
		label: "Avatares",
		description: "Cita con un grupo de avatares derivados de la firma.",
	},
];

export const DEFAULT_WELCOME_VARIANT_ID: WelcomeVariantId = "postcard";

const welcomeVariants: Record<string, PublicMessageVariantPreset> =
	Object.fromEntries(welcomeVariantList.map((v) => [v.id, v]));

export function getAllWelcomeVariants(): PublicMessageVariantPreset[] {
	return welcomeVariantList;
}

export function resolveWelcomeVariant(
	id: string | null | undefined,
): PublicMessageVariantPreset {
	return (
		welcomeVariants[id ?? ""] ??
		(welcomeVariants[DEFAULT_WELCOME_VARIANT_ID] as PublicMessageVariantPreset)
	);
}

// Thank-you proposals: `Thank You Message Proposals.dc.html`
export type ThankYouVariantId = (typeof THANK_YOU_VARIANT_IDS)[number];

export const THANK_YOU_VARIANT_IDS = [
	"spotlight",
	"handwritten",
	"social-proof",
] as const;

const thankYouVariantList: PublicMessageVariantPreset[] = [
	{
		// Origin: Thank You Message Proposals.dc.html, proposal 2a
		id: "spotlight",
		label: "Destacado",
		description: "Bloque invertido con un «Gracias» grande y una firma.",
	},
	{
		// Origin: Thank You Message Proposals.dc.html, proposal 1c
		id: "handwritten",
		label: "Manuscrita",
		description: "El mismo trato de nota rotada que la bienvenida manuscrita.",
	},
	{
		// Origin: Thank You Message Proposals.dc.html, proposal 1d
		id: "social-proof",
		label: "Prueba social",
		description: "Grupo de avatares de contribuyentes con conteo.",
	},
];

export const DEFAULT_THANK_YOU_VARIANT_ID: ThankYouVariantId = "handwritten";

const thankYouVariants: Record<string, PublicMessageVariantPreset> =
	Object.fromEntries(thankYouVariantList.map((v) => [v.id, v]));

export function getAllThankYouVariants(): PublicMessageVariantPreset[] {
	return thankYouVariantList;
}

export function resolveThankYouVariant(
	id: string | null | undefined,
): PublicMessageVariantPreset {
	return (
		thankYouVariants[id ?? ""] ??
		(thankYouVariants[
			DEFAULT_THANK_YOU_VARIANT_ID
		] as PublicMessageVariantPreset)
	);
}
