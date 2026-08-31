import { env } from "@/env";

export const PUBLIC_WISHLIST_ORIGIN = env.NEXT_PUBLIC_APP_URL;

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

const EMAIL_SUBJECTS: Record<string, string> = {
	baby_shower: "Mi lista de deseos para el baby shower",
	birthday: "Mi wishlist de cumpleaños",
	wedding: "Nuestra lista de boda",
	housewarming: "Nuestra lista de deseos para el nuevo hogar",
	general: "Mi wishlist",
};

export const toEmailShareUrl = (
	publicUrl: string,
	eventType?: string | null,
) => {
	const subject =
		(eventType && EMAIL_SUBJECTS[eventType]) ?? EMAIL_SUBJECTS.general;
	const body = whatsAppMessageForEvent(eventType, publicUrl);
	return `mailto:?subject=${encodeURIComponent(subject as string)}&body=${encodeURIComponent(body)}`;
};

export type SharePurpose = "invitation" | "reminder" | "thanks";

export const SHARE_PURPOSE_LABELS: Record<SharePurpose, string> = {
	invitation: "Invitación",
	reminder: "Recordatorio",
	thanks: "Gracias",
};

type GuestTemplate = (name: string, url: string) => string;

const GUEST_TEMPLATES: Record<SharePurpose, Record<string, GuestTemplate>> = {
	invitation: {
		baby_shower: (name, url) =>
			`¡Hola ${name}! 🍼 Mi baby shower se acerca y quiero invitarte a ver mi lista de deseos y confirmar tu asistencia aquí: ${url}`,
		birthday: (name, url) =>
			`¡Hola ${name}! 🎂 Es mi cumpleaños y me encantaría que vieras mi wishlist y confirmes si nos acompañas: ${url}`,
		wedding: (name, url) =>
			`¡Hola ${name}! 💍 Nos casamos y queremos invitarte a celebrar con nosotros. Aquí puedes ver nuestra lista y confirmar tu asistencia: ${url}`,
		housewarming: (name, url) =>
			`¡Hola ${name}! 🏡 Nos mudamos a nuestro nuevo hogar y queremos invitarte a celebrar con nosotros. Aquí puedes ver nuestra lista y confirmar tu asistencia: ${url}`,
		general: (name, url) =>
			`¡Hola ${name}! Te invito a ver mi wishlist y confirmar tu asistencia aquí: ${url}`,
	},
	reminder: {
		baby_shower: (name, url) =>
			`¡Hola ${name}! 🍼 Un recordatorio de mi baby shower — aún no he recibido tu confirmación. Puedes ver la lista y responder aquí: ${url}`,
		birthday: (name, url) =>
			`¡Hola ${name}! 🎂 Te recuerdo mi cumpleaños — aún no he recibido tu confirmación. Puedes ver la lista y responder aquí: ${url}`,
		wedding: (name, url) =>
			`¡Hola ${name}! 💍 Un recordatorio de nuestra boda — aún no hemos recibido tu confirmación. Puedes ver la lista y responder aquí: ${url}`,
		housewarming: (name, url) =>
			`¡Hola ${name}! 🏡 Te recuerdo la inauguración de nuestro nuevo hogar — aún no he recibido tu confirmación. Puedes ver la lista y responder aquí: ${url}`,
		general: (name, url) =>
			`¡Hola ${name}! Un recordatorio — aún no he recibido tu confirmación. Puedes ver la lista y responder aquí: ${url}`,
	},
	thanks: {
		baby_shower: (name, url) =>
			`¡Hola ${name}! 🍼 Muchas gracias por acompañarme en mi baby shower y por tu regalo, significó mucho para mí. Aquí puedes ver la lista si quieres revisarla de nuevo: ${url}`,
		birthday: (name, url) =>
			`¡Hola ${name}! 🎂 Muchas gracias por acompañarme en mi cumpleaños y por tu regalo, significó mucho para mí. Aquí puedes ver la lista si quieres revisarla de nuevo: ${url}`,
		wedding: (name, url) =>
			`¡Hola ${name}! 💍 Muchas gracias por celebrar con nosotros nuestra boda y por tu regalo, significó mucho para nosotros. Aquí puedes ver la lista si quieres revisarla de nuevo: ${url}`,
		housewarming: (name, url) =>
			`¡Hola ${name}! 🏡 Muchas gracias por acompañarnos en la inauguración de nuestro hogar y por tu regalo, significó mucho para nosotros. Aquí puedes ver la lista si quieres revisarla de nuevo: ${url}`,
		general: (name, url) =>
			`¡Hola ${name}! Muchas gracias por tu regalo, significó mucho. Aquí puedes ver la lista si quieres revisarla de nuevo: ${url}`,
	},
};

export function guestWhatsAppMessage({
	purpose,
	eventType,
	guestName,
	inviteUrl,
}: {
	purpose: SharePurpose;
	eventType: string | null | undefined;
	guestName: string;
	inviteUrl: string;
}): string {
	const table = GUEST_TEMPLATES[purpose];
	const template =
		eventType && eventType in table ? table[eventType] : table.general;
	return (template as GuestTemplate)(guestName, inviteUrl);
}

export function toGuestWhatsAppShareUrl(input: {
	purpose: SharePurpose;
	eventType: string | null | undefined;
	guestName: string;
	inviteUrl: string;
}): string {
	return `https://wa.me/?text=${encodeURIComponent(guestWhatsAppMessage(input))}`;
}
