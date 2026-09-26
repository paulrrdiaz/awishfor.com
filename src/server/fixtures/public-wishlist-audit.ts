import "server-only";

import { buildSeatingPass } from "@/lib/seating/seating-pass";
import type {
	PublicGiftViewModel,
	PublicGuestViewModel,
	PublicWishlistViewModel,
	SeatingPassViewModel,
} from "@/server/mappers/view-models";

export const PUBLIC_WISHLIST_AUDIT_MODE_ENV =
	"PUBLIC_WISHLIST_AUDIT_MODE" as const;
export const PUBLIC_WISHLIST_AUDIT_SLUGS = {
	light: "__audit-public-wishlist-light",
	heavy: "__audit-public-wishlist-heavy",
} as const;
export const PUBLIC_WISHLIST_AUDIT_GUEST_SLUG =
	"__audit-personalized-guest" as const;
export const PUBLIC_WISHLIST_AUDIT_SEATED_GUEST_SLUG =
	"__audit-seated-guest" as const;
// Fixed clock so the seated audit guest is always inside the 5-day window
// of the fixtures' 2027-06-26 event.
const AUDIT_SEATED_NOW = new Date("2027-06-22T17:00:00.000Z");

const CREATED_AT = "2026-01-15T00:00:00.000Z";
const categories = [
	{ id: "audit-category-home", name: "Hogar", sortOrder: 0 },
	{ id: "audit-category-experience", name: "Experiencias", sortOrder: 1 },
	{ id: "audit-category-details", name: "Detalles", sortOrder: 2 },
];

function gifts(count: number): PublicGiftViewModel[] {
	return Array.from({ length: count }, (_, index) => {
		const purchased = index % 7 === 5;
		const partial = index % 7 === 3;
		const quantityNeeded = partial ? 2 : 1;
		return {
			id: `audit-gift-${index + 1}`,
			name: `Regalo de auditoría ${String(index + 1).padStart(2, "0")}`,
			productUrl: `https://example.com/audit-gift-${index + 1}`,
			imageUrl: "/assets/hero/wedding-hero-mobile-300.jpg",
			storeName: "Tienda local",
			priceAmount: String(80 + index * 5),
			priceCurrency: "PEN",
			quantityNeeded,
			priority: index < 2 ? "high" : "medium",
			publicNote: index % 4 === 0 ? "Un detalle elegido con cariño." : null,
			sortOrder: index,
			categoryId: categories[index % categories.length]?.id ?? null,
			status: purchased ? "purchased" : partial ? "partial" : "available",
			remainingQuantity: purchased ? 0 : partial ? 1 : quantityNeeded,
		};
	});
}

function fixture({
	slug,
	title,
	layoutId,
	themeId,
	giftCount,
	images,
}: {
	slug: string;
	title: string;
	layoutId: string;
	themeId: string;
	giftCount: number;
	images: PublicWishlistViewModel["images"];
}): PublicWishlistViewModel {
	const fixtureGifts = gifts(giftCount);
	const purchasedUnits = fixtureGifts.reduce(
		(sum, gift) => sum + gift.quantityNeeded - gift.remainingQuantity,
		0,
	);
	return {
		id: `audit-${slug}`,
		slug,
		title,
		subtitle: null,
		eventType: "wedding",
		language: "es",
		currency: "PEN",
		welcomeMessage:
			"Una lista determinista para verificar la experiencia pública de A Wish For.",
		welcomeMessageAttribution: "A Wish For",
		thankYouMessage: "Gracias por acompañarnos.",
		giftListMessage:
			"Tu presencia es el mejor regalo, pero si quieres traer algo, aquí tienes algunas ideas.",
		eventDate: "2027-06-26T00:00:00.000Z",
		eventTime: "18:00",
		endTime: null,
		rsvpDeadline: null,
		eventLocation: "Lima, Perú",
		dressCode: "Elegante",
		deliveryRecipientName: "Auditoría local",
		deliveryDocumentId: null,
		deliveryAddress: "Dirección de prueba",
		deliveryPhone: null,
		images,
		themeId,
		layoutId,
		buttonStyle: "pill",
		headingFont: "lora",
		bodyFont: "inter",
		countdownVariant: null,
		welcomeMessageVariant: null,
		thankYouMessageVariant: null,
		motifId: null,
		motifTreatment: null,
		motifPalette: null,
		showHowItWorks: true,
		seatingPassVariant: "pass",
		seatingPassShowMates: true,
		seatingPassShowMap: true,
		categories,
		gifts: fixtureGifts,
		progress: {
			availableGiftCount: fixtureGifts.filter(
				(gift) => gift.status !== "purchased",
			).length,
			purchasedUnits,
			totalUnits: fixtureGifts.reduce(
				(sum, gift) => sum + gift.quantityNeeded,
				0,
			),
		},
		contributors: { count: 2, initials: ["AM", "LP"] },
		createdAt: CREATED_AT,
	};
}

const fixtures = new Map<string, PublicWishlistViewModel>([
	[
		PUBLIC_WISHLIST_AUDIT_SLUGS.light,
		fixture({
			slug: PUBLIC_WISHLIST_AUDIT_SLUGS.light,
			title: "Lista ligera de auditoría",
			layoutId: "magazine-editorial",
			themeId: "crema-elegante",
			giftCount: 8,
			images: [
				{
					url: "/assets/hero/wedding-hero-mobile-300.jpg",
					width: 300,
					height: 510,
					orientation: "portrait",
				},
			],
		}),
	],
	[
		PUBLIC_WISHLIST_AUDIT_SLUGS.heavy,
		fixture({
			slug: PUBLIC_WISHLIST_AUDIT_SLUGS.heavy,
			title: "Lista completa de auditoría",
			layoutId: "collage-staggered",
			themeId: "cielo-suave",
			giftCount: 24,
			images: [
				{
					url: "/assets/hero/wedding-hero-mobile-300.jpg",
					width: 300,
					height: 510,
					orientation: "portrait",
				},
				{
					url: "/assets/motif/joyful-unicorn.svg",
					width: 512,
					height: 512,
					orientation: "square",
				},
				{
					url: "/assets/motif/surprised-unicorn.svg",
					width: 512,
					height: 512,
					orientation: "square",
				},
			],
		}),
	],
]);

/**
 * `undefined`: ordinary slug; `null`: reserved audit slug while audit mode is
 * disabled; wishlist: enabled server-only fixture.
 */
export function getPublicWishlistAuditFixture(
	slug: string,
): PublicWishlistViewModel | null | undefined {
	const auditFixture = fixtures.get(slug);
	if (!auditFixture) return undefined;
	return process.env[PUBLIC_WISHLIST_AUDIT_MODE_ENV] === "1"
		? auditFixture
		: null;
}

/** Returns a deterministic invite only for enabled audit wishlist fixtures. */
export function getPublicWishlistAuditGuest(
	wishlistId: string,
	guestSlug: string,
): PublicGuestViewModel | null | undefined {
	const auditWishlist = [...fixtures.values()].find(
		(wishlist) => wishlist.id === wishlistId,
	);
	if (
		!auditWishlist ||
		(guestSlug !== PUBLIC_WISHLIST_AUDIT_GUEST_SLUG &&
			guestSlug !== PUBLIC_WISHLIST_AUDIT_SEATED_GUEST_SLUG)
	)
		return undefined;
	if (process.env[PUBLIC_WISHLIST_AUDIT_MODE_ENV] !== "1") return null;
	if (guestSlug === PUBLIC_WISHLIST_AUDIT_SEATED_GUEST_SLUG) {
		return {
			slug: PUBLIC_WISHLIST_AUDIT_SEATED_GUEST_SLUG,
			primaryName: "Lady Díaz",
			status: "confirmed",
			extraGuests: [
				{ id: "audit-seated-extra-1", name: "Marco", status: "confirmed" },
			],
		};
	}
	return {
		slug: PUBLIC_WISHLIST_AUDIT_GUEST_SLUG,
		primaryName: "Invitada de auditoría",
		status: "pending",
		extraGuests: [
			{ id: "audit-extra-guest-1", name: "Acompañante", status: "pending" },
		],
	};
}

/** Seating pass for the seated audit guest, built on a fixed clock. */
export function getPublicWishlistAuditSeatingPass(
	guestSlug: string,
): SeatingPassViewModel | null {
	if (guestSlug !== PUBLIC_WISHLIST_AUDIT_SEATED_GUEST_SLUG) return null;
	const fixtureWishlist = fixtures.get(PUBLIC_WISHLIST_AUDIT_SLUGS.light);
	if (!fixtureWishlist) return null;
	const seat = (extraGuestId: string | null) => ({
		inviteId: "audit-seated-invite",
		extraGuestId,
		invite: { status: "confirmed", primaryName: "Lady Díaz" },
		extraGuest: extraGuestId ? { status: "confirmed", name: "Marco" } : null,
	});
	return buildSeatingPass(
		{
			eventDate: fixtureWishlist.eventDate,
			eventTime: fixtureWishlist.eventTime,
			eventLocation: fixtureWishlist.eventLocation,
			showMates: true,
			showMap: true,
			invite: {
				id: "audit-seated-invite",
				status: "confirmed",
				primaryName: "Lady Díaz",
				extraGuests: [
					{ id: "audit-seated-extra-1", name: "Marco", status: "confirmed" },
				],
			},
			tables: [
				{
					id: "audit-table-4",
					name: null,
					sortOrder: 3,
					capacity: 8,
					assignments: [
						seat(null),
						seat("audit-seated-extra-1"),
						{
							inviteId: "audit-other-invite",
							extraGuestId: null,
							invite: { status: "confirmed", primaryName: "Ana Ríos" },
							extraGuest: null,
						},
					],
				},
			],
		},
		AUDIT_SEATED_NOW,
	);
}
