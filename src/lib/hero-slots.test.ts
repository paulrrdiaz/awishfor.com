import { describe, expect, it } from "vitest";
import { partitionHeroImages } from "./hero-slots";

const images = Array.from({ length: 6 }, (_, index) => ({
	id: `image-${index + 1}`,
	isSample: index % 2 === 0,
	url: `https://example.com/image-${index + 1}.jpg`,
}));

describe("partitionHeroImages", () => {
	it.each([
		0, 1, 2, 3, 4, 5, 6,
	])("preserves ordered ownership for %i image(s)", (count) => {
		const source = images.slice(0, count);
		const { carouselImages, staticSlots } = partitionHeroImages(source, 2);

		expect(staticSlots).toEqual([source[0] ?? null, source[1] ?? null]);
		expect(carouselImages).toEqual(source.slice(2));
		expect([...staticSlots.filter(Boolean), ...carouselImages]).toEqual(source);
		expect(
			new Set([...staticSlots.filter(Boolean), ...carouselImages]).size,
		).toBe(count);
	});

	it("keeps original records and preview metadata without mutation", () => {
		const source = images.slice(0, 3);
		const { carouselImages, staticSlots } = partitionHeroImages(source, 2);

		expect(staticSlots[0]).toBe(source[0]);
		expect(staticSlots[1]).toBe(source[1]);
		expect(carouselImages[0]).toBe(source[2]);
		expect(staticSlots[0]?.isSample).toBe(true);
		expect(carouselImages[0]?.isSample).toBe(true);
		expect(source).toEqual(images.slice(0, 3));
	});
});
