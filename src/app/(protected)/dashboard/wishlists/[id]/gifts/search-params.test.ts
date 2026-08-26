import { createSerializer } from "nuqs/server";
import { describe, expect, it } from "vitest";
import { giftsSearchParams, loadGiftsSearchParams } from "./search-params";

describe("gifts search parameters", () => {
	it("parses valid URL values", () => {
		expect(
			loadGiftsSearchParams({
				q: "Cuna",
				filter: "infaltables",
				sort: "precio",
			}),
		).toEqual({
			q: "Cuna",
			filter: "infaltables",
			sort: "precio",
		});
	});

	it("uses defaults for missing and invalid values", () => {
		expect(loadGiftsSearchParams({})).toEqual({
			q: "",
			filter: "todos",
			sort: "manual",
		});
		expect(loadGiftsSearchParams({ filter: "unknown", sort: "latest" })).toEqual(
			{
				q: "",
				filter: "todos",
				sort: "manual",
			},
		);
	});

	it("refreshes the server page when query parameters change", () => {
		expect(giftsSearchParams.q.shallow).toBe(false);
		expect(giftsSearchParams.filter.shallow).toBe(false);
		expect(giftsSearchParams.sort.shallow).toBe(false);
	});

	it("omits default values when serializing a URL", () => {
		const serialize = createSerializer(giftsSearchParams);
		expect(serialize({ q: "", filter: "todos", sort: "manual" })).toBe("");
		expect(
			serialize({ q: "Cuna", filter: "disponibles", sort: "nombre" }),
		).toBe("?q=Cuna&filter=disponibles&sort=nombre");
	});
});
