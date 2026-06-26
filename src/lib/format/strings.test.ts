import { describe, expect, it } from "vitest";
import { formatStoreDomain } from "@/lib/format/strings";

describe("formatStoreDomain", () => {
	it("strips www. and lowercases the hostname", () => {
		expect(formatStoreDomain("https://www.Amazon.com/dp/123")).toBe(
			"amazon.com",
		);
	});

	it("handles URLs without www.", () => {
		expect(formatStoreDomain("https://store.example.com/product")).toBe(
			"store.example.com",
		);
	});

	it("returns empty string for null", () => {
		expect(formatStoreDomain(null)).toBe("");
	});

	it("returns empty string for empty string", () => {
		expect(formatStoreDomain("")).toBe("");
	});

	it("returns empty string for invalid URL", () => {
		expect(formatStoreDomain("not-a-valid-url")).toBe("");
	});

	it("returns empty string for undefined", () => {
		expect(formatStoreDomain(undefined)).toBe("");
	});

	it("lowercases mixed-case domains", () => {
		expect(formatStoreDomain("https://WWW.EXAMPLE.COM/path")).toBe(
			"example.com",
		);
	});
});
