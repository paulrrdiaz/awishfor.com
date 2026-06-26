import type { Prisma } from "@/generated/prisma/client";
import { isValidSlug } from "@/lib/slug";

type SlugWishlistDelegate = {
	findFirst(args: Prisma.WishlistFindFirstArgs): Promise<{ id: string } | null>;
};

export type SlugDatabase = {
	wishlist: SlugWishlistDelegate;
};

type SlugAvailabilityResult =
	| { available: true }
	| { available: false; reason: "invalid" | "taken" };

export const checkSlugAvailability = async (
	db: SlugDatabase,
	{ slug, excludeWishlistId }: { slug: string; excludeWishlistId?: string },
): Promise<SlugAvailabilityResult> => {
	if (!isValidSlug(slug)) {
		return { available: false, reason: "invalid" };
	}

	const existing = await db.wishlist.findFirst({
		where: {
			slug,
			...(excludeWishlistId ? { NOT: { id: excludeWishlistId } } : {}),
		},
		select: { id: true },
	});

	if (existing) {
		return { available: false, reason: "taken" };
	}

	return { available: true };
};
