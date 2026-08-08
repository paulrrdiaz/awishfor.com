import { describe, expect, it } from "vitest";
import {
	DEFAULT_COUNTDOWN_VARIANT_ID,
	DEFAULT_THANK_YOU_VARIANT_ID,
	DEFAULT_WELCOME_VARIANT_ID,
	getAllCountdownVariants,
	getAllThankYouVariants,
	getAllWelcomeVariants,
	resolveCountdownVariant,
	resolveThankYouVariant,
	resolveWelcomeVariant,
} from "./public-message-variants";

describe("resolveCountdownVariant", () => {
	it("resolves a known id", () => {
		expect(resolveCountdownVariant("filled-pill").id).toBe("filled-pill");
	});

	it("falls back to the default when null", () => {
		expect(resolveCountdownVariant(null).id).toBe(DEFAULT_COUNTDOWN_VARIANT_ID);
	});

	it("falls back to the default when the id is unknown, rather than throwing", () => {
		expect(() => resolveCountdownVariant("not-a-real-variant")).not.toThrow();
		expect(resolveCountdownVariant("not-a-real-variant").id).toBe(
			DEFAULT_COUNTDOWN_VARIANT_ID,
		);
	});
});

describe("resolveWelcomeVariant", () => {
	it("resolves a known id", () => {
		expect(resolveWelcomeVariant("avatars").id).toBe("avatars");
	});

	it("falls back to the default when null", () => {
		expect(resolveWelcomeVariant(null).id).toBe(DEFAULT_WELCOME_VARIANT_ID);
	});

	it("falls back to the default when the id is unknown, rather than throwing", () => {
		expect(() => resolveWelcomeVariant("not-a-real-variant")).not.toThrow();
		expect(resolveWelcomeVariant("not-a-real-variant").id).toBe(
			DEFAULT_WELCOME_VARIANT_ID,
		);
	});
});

describe("resolveThankYouVariant", () => {
	it("resolves a known id", () => {
		expect(resolveThankYouVariant("social-proof").id).toBe("social-proof");
	});

	it("falls back to the default when null", () => {
		expect(resolveThankYouVariant(null).id).toBe(DEFAULT_THANK_YOU_VARIANT_ID);
	});

	it("falls back to the default when the id is unknown, rather than throwing", () => {
		expect(() => resolveThankYouVariant("not-a-real-variant")).not.toThrow();
		expect(resolveThankYouVariant("not-a-real-variant").id).toBe(
			DEFAULT_THANK_YOU_VARIANT_ID,
		);
	});
});

describe("getAll*Variants", () => {
	it("exposes 3 countdown presets", () => {
		expect(getAllCountdownVariants()).toHaveLength(3);
	});

	it("exposes 3 welcome presets", () => {
		expect(getAllWelcomeVariants()).toHaveLength(3);
	});

	it("exposes 3 thank-you presets", () => {
		expect(getAllThankYouVariants()).toHaveLength(3);
	});
});
