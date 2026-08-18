export type HeroSlotImage = { url: string; isSample?: boolean };

/**
 * Resolves an ordered list of cover images into exactly `slots` entries,
 * using `null` where an image is missing.
 */
export function resolveHeroSlots<T extends HeroSlotImage>(
	images: readonly T[],
	slots: number,
): Array<T | null> {
	return Array.from({ length: slots }, (_, index) => images[index] ?? null);
}

/**
 * Assigns the first ordered images to static hero frames and leaves the
 * remaining records exclusively for a carousel. Neither collection mutates or
 * recreates the original image records.
 */
export function partitionHeroImages<T extends HeroSlotImage>(
	images: readonly T[],
	staticSlotCount: number,
): { staticSlots: Array<T | null>; carouselImages: T[] } {
	return {
		staticSlots: resolveHeroSlots(images, staticSlotCount),
		carouselImages: images.slice(staticSlotCount),
	};
}
