import { describe, expect, it } from "vitest";
import { toWhatsAppShareUrl, whatsAppMessageForEvent } from "./share";

describe("whatsAppMessageForEvent", () => {
	it("returns baby_shower template", () => {
		const msg = whatsAppMessageForEvent(
			"baby_shower",
			"https://awishfor.com/w/mi-lista",
		);
		expect(msg).toContain("baby shower");
		expect(msg).toContain("https://awishfor.com/w/mi-lista");
	});

	it("returns birthday template", () => {
		const msg = whatsAppMessageForEvent(
			"birthday",
			"https://awishfor.com/w/cumple",
		);
		expect(msg).toContain("cumpleaños");
		expect(msg).toContain("https://awishfor.com/w/cumple");
	});

	it("returns wedding template", () => {
		const msg = whatsAppMessageForEvent(
			"wedding",
			"https://awishfor.com/w/boda",
		);
		expect(msg).toContain("casamos");
		expect(msg).toContain("https://awishfor.com/w/boda");
	});

	it("returns housewarming template", () => {
		const msg = whatsAppMessageForEvent(
			"housewarming",
			"https://awishfor.com/w/casa",
		);
		expect(msg).toContain("hogar");
		expect(msg).toContain("https://awishfor.com/w/casa");
	});

	it("returns general template for 'general'", () => {
		const msg = whatsAppMessageForEvent(
			"general",
			"https://awishfor.com/w/lista",
		);
		expect(msg).toContain("awishfor");
		expect(msg).toContain("https://awishfor.com/w/lista");
	});

	it("falls back to general for unknown event type", () => {
		const msg = whatsAppMessageForEvent(
			"unknown_type",
			"https://awishfor.com/w/lista",
		);
		expect(msg).toContain("awishfor");
		expect(msg).toContain("https://awishfor.com/w/lista");
	});

	it("falls back to general for null", () => {
		const msg = whatsAppMessageForEvent(null, "https://awishfor.com/w/lista");
		expect(msg).toContain("awishfor");
		expect(msg).toContain("https://awishfor.com/w/lista");
	});

	it("falls back to general for undefined", () => {
		const msg = whatsAppMessageForEvent(
			undefined,
			"https://awishfor.com/w/lista",
		);
		expect(msg).toContain("awishfor");
		expect(msg).toContain("https://awishfor.com/w/lista");
	});
});

describe("toWhatsAppShareUrl", () => {
	it("produces a wa.me link with URL-encoded message for baby_shower", () => {
		const url = toWhatsAppShareUrl(
			"https://awishfor.com/w/test",
			"baby_shower",
		);
		expect(url).toMatch(/^https:\/\/wa\.me\/\?text=/);
		const decoded = decodeURIComponent(url.replace("https://wa.me/?text=", ""));
		expect(decoded).toContain("baby shower");
		expect(decoded).toContain("https://awishfor.com/w/test");
	});

	it("produces general message when no eventType passed", () => {
		const url = toWhatsAppShareUrl("https://awishfor.com/w/test");
		const decoded = decodeURIComponent(url.replace("https://wa.me/?text=", ""));
		expect(decoded).toContain("awishfor");
		expect(decoded).toContain("https://awishfor.com/w/test");
	});
});
