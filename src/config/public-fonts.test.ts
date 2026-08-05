import { describe, expect, it } from "vitest";
import {
	DEFAULT_BODY_FONT_ID,
	DEFAULT_HEADING_FONT_ID,
	getAllBodyFontOptions,
	getAllHeadingFontOptions,
	resolveBodyFont,
	resolveHeadingFont,
} from "./public-fonts";

describe("resolveHeadingFont", () => {
	it("resolves an explicit heading font id", () => {
		expect(resolveHeadingFont("playfair-display").id).toBe("playfair-display");
	});

	it("falls back to the default when the id is null", () => {
		expect(resolveHeadingFont(null).id).toBe(DEFAULT_HEADING_FONT_ID);
	});

	it("falls back to the default when the id is unknown", () => {
		expect(resolveHeadingFont("not-a-real-font").id).toBe(
			DEFAULT_HEADING_FONT_ID,
		);
	});
});

describe("resolveBodyFont", () => {
	it("resolves an explicit body font id", () => {
		expect(resolveBodyFont("karla").id).toBe("karla");
	});

	it("falls back to the default when the id is null", () => {
		expect(resolveBodyFont(null).id).toBe(DEFAULT_BODY_FONT_ID);
	});

	it("falls back to the default when the id is unknown", () => {
		expect(resolveBodyFont("not-a-real-font").id).toBe(DEFAULT_BODY_FONT_ID);
	});
});

describe("font option catalogs", () => {
	it("exposes 6 heading font options", () => {
		expect(getAllHeadingFontOptions()).toHaveLength(6);
	});

	it("exposes 5 body font options", () => {
		expect(getAllBodyFontOptions()).toHaveLength(5);
	});
});
