import { describe, expect, it } from "vitest";
import { cleanProductUrl } from "@/lib/url/clean-url";

describe("cleanProductUrl", () => {
	it("strips UTM params", () => {
		const url =
			"https://example.com/product?utm_source=google&utm_medium=cpc&utm_campaign=sale&utm_term=shoes&utm_content=ad1&id=42";
		expect(cleanProductUrl(url)).toBe("https://example.com/product?id=42");
	});

	it("strips known click-ID params", () => {
		const url =
			"https://example.com/item?gclid=abc&fbclid=def&msclkid=ghi&dclid=jkl&mc_eid=mno&color=red";
		expect(cleanProductUrl(url)).toBe("https://example.com/item?color=red");
	});

	it("strips additional click-ID params (ttclid, twclid, igshid, epik, irclickid, wbraid, gbraid, sccid)", () => {
		const url =
			"https://example.com/p?ttclid=a&twclid=b&igshid=c&epik=d&irclickid=e&wbraid=f&gbraid=g&sccid=h&sku=123";
		expect(cleanProductUrl(url)).toBe("https://example.com/p?sku=123");
	});

	it("preserves unknown params", () => {
		const url =
			"https://example.com/product?variant=blue&size=M&utm_source=email";
		expect(cleanProductUrl(url)).toBe(
			"https://example.com/product?variant=blue&size=M",
		);
	});

	it("preserves path, host, and fragment", () => {
		const url =
			"https://store.example.com/category/product-name?utm_campaign=launch#reviews";
		expect(cleanProductUrl(url)).toBe(
			"https://store.example.com/category/product-name#reviews",
		);
	});

	it("is a no-op when there is no query string", () => {
		const url = "https://example.com/product";
		expect(cleanProductUrl(url)).toBe(url);
	});

	it("returns original input for malformed URL without throwing", () => {
		expect(cleanProductUrl("not a url")).toBe("not a url");
		expect(cleanProductUrl("")).toBe("");
	});

	it("is a no-op when no tracking params are present", () => {
		const url = "https://example.com/item?color=red&size=L";
		expect(cleanProductUrl(url)).toBe(url);
	});
});
