import { describe, expect, it } from "vitest";
import {
	getImageMismatchMessage,
	getImageOrientation,
	hasImageOrientationMismatch,
	IMAGE_ORIENTATION_SQUARE_DEADBAND,
} from "./multi-image-upload";

describe("getImageOrientation", () => {
	it("derives landscape, portrait, and square orientations", () => {
		expect(getImageOrientation(1600, 900)).toBe("landscape");
		expect(getImageOrientation(900, 1600)).toBe("portrait");
		expect(getImageOrientation(1200, 1200)).toBe("square");
	});

	it("treats near-square images as square within the deadband", () => {
		expect(IMAGE_ORIENTATION_SQUARE_DEADBAND).toBe(0.15);
		expect(getImageOrientation(1120, 1000)).toBe("square");
		expect(getImageOrientation(1160, 1000)).toBe("landscape");
		expect(getImageOrientation(0, 1000)).toBeNull();
	});
});

describe("orientation mismatch guidance", () => {
	it("warns only when the detected orientation disagrees", () => {
		expect(hasImageOrientationMismatch("portrait", "landscape")).toBe(true);
		expect(hasImageOrientationMismatch("landscape", "landscape")).toBe(false);
		expect(hasImageOrientationMismatch(null, "landscape")).toBe(false);
	});

	it("uses a gentle, actionable Spanish message", () => {
		expect(getImageMismatchMessage("portrait", "landscape")).toBe(
			"Esta foto es vertical; este diseño luce mejor en horizontal.",
		);
	});
});
