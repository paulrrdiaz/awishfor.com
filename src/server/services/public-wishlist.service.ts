import "server-only";

import { unstable_cache } from "next/cache";
import { cache } from "react";
import type {
	Category,
	Gift,
	Prisma,
	Purchase,
	Wishlist,
	WishlistImage,
} from "@/generated/prisma/client";
import { WishlistStatus } from "@/generated/prisma/client";
import { getPublicWishlistAuditFixture } from "@/server/fixtures/public-wishlist-audit";
import { mapPublicWishlist } from "@/server/mappers/public-wishlist.mapper";
import type { PublicWishlistViewModel } from "@/server/mappers/view-models";
import {
	publicWishlistIdTag,
	publicWishlistSlugTag,
} from "@/server/services/public-wishlist-cache";

export type PublicArchivedViewModel = {
	slug: string;
	title: string;
};

export type PublicWishlistResult =
	| { kind: "published"; wishlist: PublicWishlistViewModel }
	| { kind: "preview"; wishlist: PublicWishlistViewModel }
	| { kind: "archived"; archived: PublicArchivedViewModel }
	| { kind: "notFound" };

type GiftRow = Gift & { purchases: Purchase[] };
type CategoryRow = Category & { gifts: GiftRow[] };
type WishlistPublicRow = Wishlist & {
	categories: CategoryRow[];
	gifts: GiftRow[];
	images: WishlistImage[];
	owner: { clerkId: string };
};

type PublicWishlistDelegate = {
	findUnique(
		args: Prisma.WishlistFindUniqueArgs,
	): Promise<WishlistPublicRow | null>;
};

export type PublicWishlistDatabase = {
	wishlist: PublicWishlistDelegate;
};

type LifecycleRow = {
	id: string;
	status: WishlistStatus;
	slug: string;
	title: string;
	owner: { clerkId: string };
};

async function resolveLifecycle(
	db: PublicWishlistDatabase,
	slug: string,
): Promise<LifecycleRow | null> {
	return (await db.wishlist.findUnique({
		where: { slug },
		select: {
			id: true,
			status: true,
			slug: true,
			title: true,
			owner: { select: { clerkId: true } },
		},
	})) as LifecycleRow | null;
}

async function loadPublicSnapshot(
	db: PublicWishlistDatabase,
	where: { id?: string; slug: string; status?: WishlistStatus },
): Promise<WishlistPublicRow | null> {
	return (await db.wishlist.findUnique({
		where,
		select: {
			id: true,
			slug: true,
			title: true,
			eventType: true,
			language: true,
			currency: true,
			welcomeMessage: true,
			welcomeMessageAttribution: true,
			thankYouMessage: true,
			eventDate: true,
			eventTime: true,
			rsvpDeadline: true,
			eventLocation: true,
			dressCode: true,
			deliveryRecipientName: true,
			deliveryDocumentId: true,
			deliveryAddress: true,
			deliveryPhone: true,
			themeId: true,
			layoutId: true,
			buttonStyle: true,
			headingFont: true,
			bodyFont: true,
			countdownVariant: true,
			welcomeMessageVariant: true,
			thankYouMessageVariant: true,
			motifId: true,
			motifTreatment: true,
			motifPalette: true,
			showHowItWorks: true,
			status: true,
			createdAt: true,
			categories: { select: { id: true, name: true, sortOrder: true } },
			gifts: {
				select: {
					id: true,
					categoryId: true,
					name: true,
					productUrl: true,
					imageUrl: true,
					storeName: true,
					priceAmount: true,
					priceCurrency: true,
					quantityNeeded: true,
					priority: true,
					visibilityStatus: true,
					publicNote: true,
					sortOrder: true,
					deletedAt: true,
					purchases: { select: { guestName: true, quantity: true } },
				},
			},
			images: {
				orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
				select: { url: true, width: true, height: true, orientation: true },
			},
			owner: { select: { clerkId: true } },
		},
	})) as WishlistPublicRow | null;
}

async function loadPublishedSnapshot(
	db: PublicWishlistDatabase,
	{ id, slug }: { id: string; slug: string },
): Promise<PublicWishlistViewModel | null> {
	const row = await loadPublicSnapshot(db, {
		id,
		slug,
		status: WishlistStatus.published,
	});
	return row?.status === WishlistStatus.published
		? mapPublicWishlist(row)
		: null;
}

/**
 * Reuses only the viewer-independent published presentation. The lifecycle
 * lookup, draft owner preview, invite state, and inaccessible states stay out
 * of this shared cache.
 */
async function getCachedPublishedSnapshot(
	db: PublicWishlistDatabase,
	{ id, slug }: { id: string; slug: string },
): Promise<PublicWishlistViewModel | null> {
	return unstable_cache(
		() => loadPublishedSnapshot(db, { id, slug }),
		["public-wishlist-presentation", id, slug],
		{
			revalidate: false,
			tags: [publicWishlistIdTag(id), publicWishlistSlugTag(slug)],
		},
	)();
}

async function getPublicWishlistBySlugImpl(
	db: PublicWishlistDatabase,
	{ slug, viewerClerkId }: { slug: string; viewerClerkId: string | null },
): Promise<PublicWishlistResult> {
	const auditFixture = getPublicWishlistAuditFixture(slug);
	if (auditFixture !== undefined) {
		return auditFixture
			? { kind: "published", wishlist: auditFixture }
			: { kind: "notFound" };
	}
	const lifecycle = await resolveLifecycle(db, slug);

	if (!lifecycle) {
		return { kind: "notFound" };
	}

	if (lifecycle.status === WishlistStatus.archived) {
		return {
			kind: "archived",
			archived: { slug: lifecycle.slug, title: lifecycle.title },
		};
	}
	if (
		lifecycle.status === WishlistStatus.draft &&
		lifecycle.owner.clerkId !== viewerClerkId
	) {
		return { kind: "notFound" };
	}
	if (lifecycle.status === WishlistStatus.published) {
		const wishlist = await getCachedPublishedSnapshot(db, {
			id: lifecycle.id,
			slug: lifecycle.slug,
		});
		return wishlist ? { kind: "published", wishlist } : { kind: "notFound" };
	}
	const row = await loadPublicSnapshot(db, {
		id: lifecycle.id,
		slug: lifecycle.slug,
		status: WishlistStatus.draft,
	});
	if (!row) return { kind: "notFound" };
	return { kind: "preview", wishlist: mapPublicWishlist(row) };
}

/** Shares one viewer-aware result across page and metadata work in a request. */
export const getPublicWishlistBySlug = cache(getPublicWishlistBySlugImpl);
