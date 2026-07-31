import { describe, expect, it } from "vitest";

import { HERO_OCCASIONS } from "./hero-occasions";
import { selectHeroOccasions } from "./select-hero-occasions";

describe("selectHeroOccasions", () => {
	it("keeps the LCP occasion and samples three unique choices from seven", () => {
		const selected = selectHeroOccasions(HERO_OCCASIONS, () => 0.5);

		expect(HERO_OCCASIONS.slice(1)).toHaveLength(7);
		expect(selected).toHaveLength(4);
		expect(selected[0]).toBe(HERO_OCCASIONS[0]);
		expect(new Set(selected.map(({ id }) => id)).size).toBe(4);
	});

	it("can produce a different four-item rotation on another page load", () => {
		const lowSelection = selectHeroOccasions(HERO_OCCASIONS, () => 0);
		const highSelection = selectHeroOccasions(HERO_OCCASIONS, () => 0.999);

		expect(highSelection.map(({ id }) => id)).not.toEqual(
			lowSelection.map(({ id }) => id),
		);
	});
});
