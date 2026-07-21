import { describe, expect, it } from "vitest";
import { getAllButtonStyles, resolveButtonStyle } from "./public-button-styles";

describe("resolveButtonStyle", () => {
	it("resolves an explicit button style id", () => {
		expect(resolveButtonStyle("square").id).toBe("square");
	});

	it("falls back to pill when the id is null", () => {
		expect(resolveButtonStyle(null).id).toBe("pill");
	});

	it("falls back to pill when the id is unknown", () => {
		expect(resolveButtonStyle("not-a-real-style").id).toBe("pill");
	});

	it("declares the square preset with a 0.25rem radius and weight 600", () => {
		const square = resolveButtonStyle("square");
		expect(square.borderRadius).toBe("0.25rem");
		expect(square.fontWeight).toBe("600");
		expect(square.variant).toBe("solid");
	});

	it("declares the outline preset with the outline variant and a non-zero border width", () => {
		const outline = resolveButtonStyle("outline");
		expect(outline.variant).toBe("outline");
		expect(outline.borderWidth).not.toBe("0");
	});
});

describe("getAllButtonStyles", () => {
	it("exposes 4 button style presets", () => {
		expect(getAllButtonStyles()).toHaveLength(4);
	});
});
