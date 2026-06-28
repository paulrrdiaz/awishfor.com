export const PUBLIC_WISHLIST_ORIGIN = "https://awishfor.com";

export type WishlistShareMetadata = {
	wishlistId: string;
	slug: string;
	publicUrlPath: string;
	dashboardUrlPath: string;
};

export const toCanonicalWishlistUrl = (publicUrlPath: string) =>
	new URL(publicUrlPath, PUBLIC_WISHLIST_ORIGIN).toString();

const WHATSAPP_TEMPLATES: Record<string, (url: string) => string> = {
	baby_shower: (url) =>
		`¡Mi baby shower se acerca! 🍼 Te comparto mi lista de deseos para que puedas elegir el regalo perfecto: ${url}`,
	birthday: (url) =>
		`¡Es mi cumpleaños! 🎂 Te comparto mi wishlist para que elijas lo que más te guste: ${url}`,
	wedding: (url) =>
		`¡Nos casamos! 💍 Te compartimos nuestra lista de boda para celebrar con nosotros: ${url}`,
	housewarming: (url) =>
		`¡Nos mudamos a nuestro nuevo hogar! 🏡 Te compartimos nuestra lista de deseos: ${url}`,
	general: (url) =>
		`Te comparto mi wishlist de awishfor. Mira la lista aquí: ${url}`,
};

export function whatsAppMessageForEvent(
	eventType: string | null | undefined,
	publicUrl: string,
): string {
	const template =
		eventType && eventType in WHATSAPP_TEMPLATES
			? WHATSAPP_TEMPLATES[eventType]
			: WHATSAPP_TEMPLATES.general;
	return (template as (url: string) => string)(publicUrl);
}

export const toWhatsAppShareUrl = (
	publicUrl: string,
	eventType?: string | null,
) => {
	const message = whatsAppMessageForEvent(eventType, publicUrl);
	return `https://wa.me/?text=${encodeURIComponent(message)}`;
};
