import { describe, expect, it } from "vitest";
import { formatMoney } from "@/lib/format/money";

describe("formatMoney", () => {
	it("formats PEN in Spanish Peru locale", () => {
		const result = formatMoney(100, { currency: "PEN", locale: "es" });
		expect(result).toContain("100");
		expect(result).toContain("S/");
	});

	it("formats USD in English US locale", () => {
		const result = formatMoney(99.99, { currency: "USD", locale: "en" });
		expect(result).toContain("$");
		expect(result).toContain("99.99");
	});

	it("accepts string decimal input without precision loss", () => {
		const result = formatMoney("199.90", { currency: "PEN", locale: "es" });
		expect(result).toContain("199");
		expect(result).toContain("90");
	});

	it("formats zero amount", () => {
		const result = formatMoney(0, { currency: "USD", locale: "en" });
		expect(result).toContain("0");
	});

	it("formats MXN in Mexican locale", () => {
		const result = formatMoney(500, { currency: "MXN", locale: "es" });
		expect(result).toContain("500");
	});
});
