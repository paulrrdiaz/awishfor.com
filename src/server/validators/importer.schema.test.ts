import { describe, expect, it } from "vitest";
import {
	IMPORT_URL_MAX_LENGTH,
	importUrlSchema,
} from "@/server/validators/importer.schema";

describe("importUrlSchema", () => {
	it("accepts a valid https URL", () => {
		const result = importUrlSchema.parse({
			url: "https://example.com/product",
		});
		expect(result.url).toBe("https://example.com/product");
	});

	it("accepts a valid http URL", () => {
		const result = importUrlSchema.parse({ url: "http://example.com/product" });
		expect(result.url).toBe("http://example.com/product");
	});

	it("trims whitespace before validating", () => {
		const result = importUrlSchema.parse({
			url: "  https://example.com/product  ",
		});
		expect(result.url).toBe("https://example.com/product");
	});

	it("rejects a file: scheme URL", () => {
		expect(() => importUrlSchema.parse({ url: "file:///etc/passwd" })).toThrow(
			"URL must use http or https scheme",
		);
	});

	it("rejects an ftp: scheme URL", () => {
		expect(() =>
			importUrlSchema.parse({ url: "ftp://example.com/file" }),
		).toThrow("URL must use http or https scheme");
	});

	it("rejects a data: scheme URL", () => {
		expect(() =>
			importUrlSchema.parse({ url: "data:text/html,<h1>hi</h1>" }),
		).toThrow();
	});

	it("rejects an empty string", () => {
		expect(() => importUrlSchema.parse({ url: "" })).toThrow("URL is required");
	});

	it("rejects a whitespace-only string", () => {
		expect(() => importUrlSchema.parse({ url: "   " })).toThrow(
			"URL is required",
		);
	});

	it("rejects a URL exceeding max length", () => {
		const longUrl = `https://example.com/${"a".repeat(IMPORT_URL_MAX_LENGTH)}`;
		expect(() => importUrlSchema.parse({ url: longUrl })).toThrow(
			`URL must be at most ${IMPORT_URL_MAX_LENGTH} characters`,
		);
	});

	it("rejects a non-URL string", () => {
		expect(() => importUrlSchema.parse({ url: "not-a-url" })).toThrow(
			"URL must be a valid URL",
		);
	});
});
