import type { PublicWishlistViewModel } from "@/server/mappers/view-models";

/**
 * Static fixture for the marketing landing's "Ejemplo real" block. It is shaped
 * exactly like a real `PublicWishlistViewModel` so the landing can render the
 * production `PublicWishlistPage` in compact mode — keeping the marketing preview
 * a single source of truth with the live public page.
 */
export const DEMO_WISHLIST: PublicWishlistViewModel = {
	id: "demo-wishlist",
	slug: "maria-y-tomas",
	title: "María & Tomás",
	eventType: "wedding",
	language: "es",
	currency: "PEN",
	heroTitle: "María & Tomás",
	welcomeMessage:
		"Gracias por acompañarnos en este día tan especial. Aquí encontrarás algunas ideas para regalarnos.",
	thankYouMessage: "¡Gracias por tu cariño y por celebrar con nosotros!",
	// Shown as the hero subtitle. Compact mode hides the separate date/location
	// row, so we carry the event detail here to keep the preview looking complete.
	displayName: "14 de septiembre · Hacienda San Ángel",
	eventDate: "2026-09-14",
	eventTime: "17:00",
	eventLocation: "Hacienda San Ángel",
	dressCode: "Formal",
	coverImageUrl:
		"https://images.unsplash.com/photo-1780542900375-0cf459e38fbb?w=1200&h=480&fit=crop&auto=format",
	coverImageUrls: [],
	themeId: "crema-elegante",
	layoutId: "grid",
	buttonStyle: "pill",
	fontPairing: "serif-soft",
	headingFont: null,
	bodyFont: null,
	showHowItWorks: true,
	categories: [
		{ id: "cat-cocina", name: "Cocina", sortOrder: 0 },
		{ id: "cat-mesa", name: "Mesa & comedor", sortOrder: 1 },
	],
	gifts: [
		{
			id: "g-copas",
			name: "Copas de cristal",
			productUrl: null,
			imageUrl:
				"https://images.unsplash.com/photo-1546567379-1af2e0d527e8?w=480&h=360&fit=crop&auto=format",
			storeName: "Crate & Barrel",
			priceAmount: "320.00",
			priceCurrency: "PEN",
			quantityNeeded: 6,
			priority: "high",
			publicNote: "Para los brindis 🥂",
			sortOrder: 0,
			categoryId: "cat-mesa",
			status: "available",
			remainingQuantity: 6,
		},
		{
			id: "g-vajilla",
			name: "Vajilla 12 piezas",
			productUrl: null,
			imageUrl:
				"https://images.unsplash.com/photo-1737681707230-04eebda96529?w=480&h=360&fit=crop&auto=format",
			storeName: "Liverpool",
			priceAmount: "890.00",
			priceCurrency: "PEN",
			quantityNeeded: 4,
			priority: "medium",
			publicNote: null,
			sortOrder: 1,
			categoryId: "cat-mesa",
			status: "partial",
			remainingQuantity: 2,
		},
		{
			id: "g-mantel",
			name: "Mantel de lino",
			productUrl: null,
			imageUrl:
				"https://images.unsplash.com/photo-1665607438186-7755c7f4dd30?w=480&h=360&fit=crop&auto=format",
			storeName: "Zara Home",
			priceAmount: "240.00",
			priceCurrency: "PEN",
			quantityNeeded: 2,
			priority: "low",
			publicNote: null,
			sortOrder: 2,
			categoryId: "cat-mesa",
			status: "purchased",
			remainingQuantity: 0,
		},
	],
	progress: {
		availableGiftCount: 2,
		purchasedUnits: 4,
		totalUnits: 12,
	},
};
