import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import { WishlistStatus } from "@/generated/prisma/client";
import { getPublicWishlistAuditFixture } from "@/server/fixtures/public-wishlist-audit";

/** The only database shape allowed to reach public social metadata. */
export const publicWishlistMetadataSelect = {
	id: true,
	status: true,
	slug: true,
	title: true,
	welcomeMessage: true,
	eventType: true,
	eventDate: true,
	language: true,
	themeId: true,
	images: {
		select: { url: true, width: true, height: true },
		orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
		take: 1,
	},
} satisfies Prisma.WishlistSelect;

export type PublishedWishlistMetadataProjection = Prisma.WishlistGetPayload<{
	select: typeof publicWishlistMetadataSelect;
}>;

export type PublicWishlistMetadataDatabase = {
	wishlist: {
		findUnique(
			args: Prisma.WishlistFindUniqueArgs,
		): Promise<PublishedWishlistMetadataProjection | null>;
	};
};

/**
 * Reads the smallest possible projection for crawlers. Non-published states
 * deliberately collapse to null so title, cover image, and theme cannot leak.
 */
export async function getPublishedWishlistMetadata(
	db: PublicWishlistMetadataDatabase,
	slug: string,
): Promise<PublishedWishlistMetadataProjection | null> {
	const auditFixture = getPublicWishlistAuditFixture(slug);
	if (auditFixture !== undefined) {
		return auditFixture
			? ({
					id: auditFixture.id,
					status: WishlistStatus.published,
					slug: auditFixture.slug,
					title: auditFixture.title,
					welcomeMessage: auditFixture.welcomeMessage,
					eventType: auditFixture.eventType,
					eventDate: auditFixture.eventDate
						? new Date(auditFixture.eventDate)
						: null,
					language: auditFixture.language,
					themeId: auditFixture.themeId,
					images: auditFixture.images.slice(0, 1).map((image) => ({
						url: image.url,
						width: image.width,
						height: image.height,
					})),
				} as PublishedWishlistMetadataProjection)
			: null;
	}
	const wishlist = await db.wishlist.findUnique({
		where: { slug },
		select: publicWishlistMetadataSelect,
	});

	return wishlist?.status === WishlistStatus.published ? wishlist : null;
}
