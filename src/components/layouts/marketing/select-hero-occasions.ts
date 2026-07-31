import type { HeroOccasion } from "./hero-occasions";

const ROTATION_SIZE = 4;

/**
 * Keeps the server-rendered wedding photograph first for a stable LCP, then
 * samples three distinct occasions from the rest of the catalog per mount.
 */
export function selectHeroOccasions(
	occasions: readonly HeroOccasion[],
	random: () => number = Math.random,
): readonly HeroOccasion[] {
	if (occasions.length <= ROTATION_SIZE) return occasions;

	const [initial, ...candidates] = occasions;
	if (!initial) return [];

	for (let index = 0; index < ROTATION_SIZE - 1; index += 1) {
		const remaining = candidates.length - index;
		const offset = Math.min(
			remaining - 1,
			Math.floor(Math.max(0, random()) * remaining),
		);
		const selectedIndex = index + offset;
		[candidates[index], candidates[selectedIndex]] = [
			candidates[selectedIndex] as HeroOccasion,
			candidates[index] as HeroOccasion,
		];
	}

	return [initial, ...candidates.slice(0, ROTATION_SIZE - 1)];
}
