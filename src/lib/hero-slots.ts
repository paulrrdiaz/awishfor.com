/**
 * Resolves an ordered list of cover images into exactly `slots` entries,
 * using `null` where an image is missing.
 */
export function resolveHeroSlots(
	images: string[],
	slots: number,
): Array<string | null> {
	return Array.from({ length: slots }, (_, index) => images[index] ?? null);
}
