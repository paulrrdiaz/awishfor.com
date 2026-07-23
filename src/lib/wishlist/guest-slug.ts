import { slugify } from "@/lib/slug";

/**
 * Segments that must never collide with a guest slug, so `/w/[slug]/[guestSlug]`
 * can never shadow a current or likely-future static child route.
 */
export const RESERVED_GUEST_SLUGS = [
	"rsvp",
	"edit",
	"preview",
	"settings",
	"admin",
	"api",
] as const;

export function deriveGuestSlug(primaryName: string): string | null {
	return slugify(primaryName);
}

export function isReservedGuestSlug(slug: string): boolean {
	return (RESERVED_GUEST_SLUGS as readonly string[]).includes(
		slug.toLowerCase(),
	);
}

export function isGuestSlugAvailable(
	slug: string,
	existingSlugs: Iterable<string>,
): boolean {
	if (isReservedGuestSlug(slug)) {
		return false;
	}

	for (const existing of existingSlugs) {
		if (existing === slug) {
			return false;
		}
	}

	return true;
}
