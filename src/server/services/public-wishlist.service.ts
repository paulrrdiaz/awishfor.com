import type {
	Category,
	Gift,
	Prisma,
	Purchase,
	Wishlist,
} from "@/generated/prisma/client";
import { WishlistStatus } from "@/generated/prisma/client";
import { mapPublicWishlist } from "@/server/mappers/public-wishlist.mapper";
import type { PublicWishlistViewModel } from "@/server/mappers/view-models";

export type PublicArchivedViewModel = {
	slug: string;
	title: string;
	displayName: string | null;
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

export async function getPublicWishlistBySlug(
	db: PublicWishlistDatabase,
	{ slug, viewerClerkId }: { slug: string; viewerClerkId: string | null },
): Promise<PublicWishlistResult> {
	const row = await db.wishlist.findUnique({
		where: { slug },
		include: {
			categories: {
				include: {
					gifts: {
						include: { purchases: true },
					},
				},
			},
			gifts: {
				include: { purchases: true },
			},
			owner: {
				select: { clerkId: true },
			},
		},
	});

	if (!row) {
		return { kind: "notFound" };
	}

	if (row.status === WishlistStatus.published) {
		return { kind: "published", wishlist: mapPublicWishlist(row) };
	}

	if (row.status === WishlistStatus.archived) {
		return {
			kind: "archived",
			archived: {
				slug: row.slug,
				title: row.title,
				displayName: row.displayName,
			},
		};
	}

	// draft: only the owner sees a preview
	if (viewerClerkId !== null && row.owner.clerkId === viewerClerkId) {
		return { kind: "preview", wishlist: mapPublicWishlist(row) };
	}

	return { kind: "notFound" };
}
