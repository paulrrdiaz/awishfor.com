import { describe, expect, it } from "vitest";
import { parseSignatureInitials } from "./signature";

describe("parseSignatureInitials", () => {
	it.each([
		["Ana & Diego", ["A", "D"]],
		["Ana y Diego", ["A", "D"]],
		["Ana, Diego", ["A", "D"]],
		["Isabel e Ignacio", ["I", "I"]],
		["Ana, Diego y Sofía", ["A", "D", "S"]],
		["Familia Rodríguez", ["F"]],
		["María José", ["M"]],
		["Álvaro", ["Á"]],
		["Valentina", ["V"]],
	])("parses %s", (signature, expected) => {
		expect(parseSignatureInitials(signature)).toEqual(expected);
	});

	it("returns an empty array for null", () => {
		expect(parseSignatureInitials(null)).toEqual([]);
	});

	it("returns an empty array for an empty string", () => {
		expect(parseSignatureInitials("")).toEqual([]);
	});

	it("returns an empty array for whitespace-only input", () => {
		expect(parseSignatureInitials("   ")).toEqual([]);
	});
});
