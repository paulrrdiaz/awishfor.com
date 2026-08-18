import { describe, expect, it } from "vitest";
import { composeDelivery } from "@/lib/format/delivery";

const NAME = "Ana Beltrán";
const DOCUMENT_ID = "46737335";
const ADDRESS = "Av. Universidad 1500, Col. Narvarte, CDMX";
const PHONE = "+52 55 1122 3344";

describe("composeDelivery", () => {
	it("returns null when the address is absent, regardless of name or phone", () => {
		expect(composeDelivery(null, null, null)).toBeNull();
		expect(composeDelivery(NAME, null, null)).toBeNull();
		expect(composeDelivery(null, null, PHONE)).toBeNull();
		expect(composeDelivery(NAME, null, PHONE)).toBeNull();
	});

	it("composes all four fields with no doubled, leading, or trailing separator", () => {
		const result = composeDelivery(NAME, ADDRESS, PHONE, DOCUMENT_ID);
		expect(result).toEqual({
			line: `${NAME}, DNI: ${DOCUMENT_ID}, ${ADDRESS} · ${PHONE}`,
			recipientName: NAME,
			documentId: DOCUMENT_ID,
			address: ADDRESS,
			phone: PHONE,
			rest: `${ADDRESS} · ${PHONE}`,
		});
		expect(result?.line).not.toMatch(/[👤🪪📍📱]/u);
	});

	it("ends after the address with no trailing separator when the phone is absent", () => {
		const result = composeDelivery(NAME, ADDRESS, null);
		expect(result).toEqual({
			line: `${NAME}, ${ADDRESS}`,
			recipientName: NAME,
			documentId: null,
			address: ADDRESS,
			phone: null,
			rest: ADDRESS,
		});
	});

	it("starts with the address with no leading separator when the name is absent", () => {
		const result = composeDelivery(null, ADDRESS, PHONE);
		expect(result).toEqual({
			line: `${ADDRESS} · ${PHONE}`,
			recipientName: null,
			documentId: null,
			address: ADDRESS,
			phone: PHONE,
			rest: `${ADDRESS} · ${PHONE}`,
		});
	});

	it("renders only the address when name and phone are both absent", () => {
		const result = composeDelivery(null, ADDRESS, null);
		expect(result).toEqual({
			line: ADDRESS,
			recipientName: null,
			documentId: null,
			address: ADDRESS,
			phone: null,
			rest: ADDRESS,
		});
	});
});
