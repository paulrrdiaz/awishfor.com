import { createSerializer } from "nuqs/server";
import { describe, expect, it } from "vitest";
import { guestsSearchParams, loadGuestsSearchParams } from "./search-params";

describe("guests search parameters", () => {
	it("parses valid URL values", () => {
		expect(loadGuestsSearchParams({ q: "María", status: "confirmed" })).toEqual(
			{
				q: "María",
				status: "confirmed",
			},
		);
	});

	it("uses defaults for missing and invalid values", () => {
		expect(loadGuestsSearchParams({})).toEqual({
			q: "",
			status: "all",
		});
		expect(loadGuestsSearchParams({ q: "Ana", status: "unknown" })).toEqual({
			q: "Ana",
			status: "all",
		});
	});

	it("omits default values when serializing a URL", () => {
		const serialize = createSerializer(guestsSearchParams);
		expect(serialize({ q: "", status: "all" })).toBe("");
		expect(serialize({ q: "Ana", status: "declined" })).toBe(
			"?q=Ana&status=declined",
		);
	});
});
