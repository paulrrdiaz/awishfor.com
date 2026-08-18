import type { Metadata } from "next";
import { env } from "@/env";
import type { PublishedWishlistMetadataProjection } from "@/server/services/public-wishlist-metadata.service";

const TITLE_LIMIT = 120;
const DESCRIPTION_LIMIT = 200;

const EVENT_DESCRIPTIONS: Record<string, string> = {
	baby_shower: "Descubre esta lista de deseos para celebrar un baby shower.",
	birthday: "Descubre esta lista de deseos para celebrar un cumpleaños.",
	wedding: "Descubre esta lista de deseos para celebrar una boda.",
	housewarming: "Descubre esta lista de deseos para celebrar un nuevo hogar.",
	general: "Descubre esta lista de deseos creada en A Wish For.",
};

function boundedText(value: string, limit: number): string {
	const normalized = value.replace(/\s+/g, " ").trim();
	if (normalized.length <= limit) return normalized;
	return `${normalized.slice(0, Math.max(0, limit - 1)).trimEnd()}…`;
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
	const title = boundedText(wishlist.title, TITLE_LIMIT);
	const description = boundedText(
		wishlist.welcomeMessage ||
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
