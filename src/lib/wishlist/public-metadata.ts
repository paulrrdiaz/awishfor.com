import type { Metadata } from "next";
import { env } from "@/env";
import { formatEventDate } from "@/lib/format/dates";
import type { PublishedWishlistMetadataProjection } from "@/server/services/public-wishlist-metadata.service";

const TITLE_LIMIT = 60;
const DESCRIPTION_LIMIT = 125;

const EVENT_DESCRIPTIONS: Record<string, string> = {
	baby_shower: "Descubre esta lista de deseos para celebrar un baby shower.",
	birthday: "Descubre esta lista de deseos para celebrar un cumpleaños.",
	wedding: "Descubre esta lista de deseos para celebrar una boda.",
	housewarming: "Descubre esta lista de deseos para celebrar un nuevo hogar.",
	general: "Descubre esta lista de deseos creada en A Wish For.",
};

function boundedText(value: string, limit: number): string {
	const normalized = value.replace(/\s+/g, " ").trim();
	if (limit <= 0) return "";
	if (normalized.length <= limit) return normalized;

	const availableLength = Math.max(0, limit - 1);
	const candidate = normalized.slice(0, availableLength);
	const boundary = candidate.lastIndexOf(" ");
	const truncated = (
		boundary > 0 ? candidate.slice(0, boundary) : candidate
	).trimEnd();
	return `${truncated}…`;
}

function socialTitle(wishlist: PublishedWishlistMetadataProjection): string {
	const suffix = wishlist.eventDate
		? ` — ${formatEventDate(wishlist.eventDate, wishlist.language)} | A Wish For`
		: wishlist.language === "en"
			? " — Wishlist | A Wish For"
			: " — Lista de deseos | A Wish For";
	const titleBudget = TITLE_LIMIT - suffix.length;
	const wishlistTitle = boundedText(wishlist.title, titleBudget);

	return wishlistTitle
		? `${wishlistTitle}${suffix}`
		: boundedText(wishlist.title, TITLE_LIMIT);
}

export function genericPublicWishlistMetadata(): Metadata {
	return {
		title: "Lista no encontrada",
		robots: { index: false, follow: false },
	};
}

export function buildPublicWishlistMetadata(
	wishlist: PublishedWishlistMetadataProjection,
): Metadata {
	const canonical = new URL(
		`/w/${wishlist.slug}`,
		env.NEXT_PUBLIC_APP_URL,
	).toString();
	const image = new URL(
		`/w/${wishlist.slug}/opengraph-image`,
		env.NEXT_PUBLIC_APP_URL,
	).toString();
	const title = socialTitle(wishlist);
	const description =
		boundedText(wishlist.welcomeMessage, DESCRIPTION_LIMIT) ||
		boundedText(
			EVENT_DESCRIPTIONS[wishlist.eventType] ||
				EVENT_DESCRIPTIONS.general ||
				"Descubre esta lista de deseos en A Wish For.",
			DESCRIPTION_LIMIT,
		);

	return {
		title,
		description,
		alternates: { canonical },
		robots: { index: false, follow: false },
		openGraph: {
			type: "website",
			siteName: "A Wish For",
			title,
			description,
			url: canonical,
			images: [{ url: image, width: 1200, height: 630, alt: title }],
		},
		twitter: {
			card: "summary_large_image",
			title,
			description,
			images: [image],
		},
	};
}

export const publicMetadataLimits = {
	title: TITLE_LIMIT,
	description: DESCRIPTION_LIMIT,
};
