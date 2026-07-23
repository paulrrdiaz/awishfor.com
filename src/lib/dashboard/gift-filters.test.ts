import { describe, expect, it } from "vitest";
import type { DashboardGiftRowViewModel } from "@/server/mappers/view-models";
import { filterAndSortDashboardGifts } from "./gift-filters";

function makeGift(
	overrides: Partial<DashboardGiftRowViewModel> & { id: string },
): DashboardGiftRowViewModel {
	return {
		id: overrides.id,
		name: overrides.name ?? `Gift ${overrides.id}`,
		productUrl: null,
		imageUrl: null,
		storeName: overrides.storeName ?? null,
		size: overrides.size ?? null,
		priceAmount: overrides.priceAmount ?? null,
		priceCurrency: null,
		quantityNeeded: overrides.quantityNeeded ?? 1,
		purchasedQuantity: overrides.purchasedQuantity ?? 0,
		remainingQuantity: overrides.remainingQuantity ?? 1,
		priority: overrides.priority ?? "medium",
		visibilityStatus: overrides.visibilityStatus ?? "available",
		publicNote: null,
		hasInternalNote: false,
		sortOrder: overrides.sortOrder ?? 0,
		categoryId: overrides.categoryId ?? null,
		deletedAt: null,
		createdAt: "2026-01-01T00:00:00.000Z",
		updatedAt: "2026-01-01T00:00:00.000Z",
	};
}

describe("filterAndSortDashboardGifts — search", () => {
	const gifts = [
		makeGift({ id: "a", name: "Cuna de madera", storeName: "Liverpool" }),
		makeGift({ id: "b", name: "Set de copas", storeName: "Falabella" }),
	];

	it("matches by name, case-insensitive", () => {
		const result = filterAndSortDashboardGifts(gifts, { q: "cuna" });
		expect(result.map((g) => g.id)).toEqual(["a"]);
	});

	it("matches by store name", () => {
		const result = filterAndSortDashboardGifts(gifts, { q: "falabella" });
		expect(result.map((g) => g.id)).toEqual(["b"]);
	});

	it("empty search returns every gift", () => {
		const result = filterAndSortDashboardGifts(gifts, { q: "" });
		expect(result).toHaveLength(2);
	});
});

describe("filterAndSortDashboardGifts — status filter", () => {
	const gifts = [
		makeGift({
			id: "avail",
			visibilityStatus: "available",
			remainingQuantity: 1,
		}),
		makeGift({
			id: "done",
			visibilityStatus: "available",
			remainingQuantity: 0,
		}),
		makeGift({ id: "star", priority: "high", remainingQuantity: 1 }),
		makeGift({ id: "hidden", visibilityStatus: "hidden" }),
	];

	it("todos → returns every gift", () => {
		expect(
			filterAndSortDashboardGifts(gifts, { filter: "todos" }),
		).toHaveLength(4);
	});

	it("disponibles → visible with remaining > 0", () => {
		const result = filterAndSortDashboardGifts(gifts, {
			filter: "disponibles",
		});
		expect(result.map((g) => g.id)).toEqual(["avail", "star"]);
	});

	it("comprados → visible with remaining === 0", () => {
		const result = filterAndSortDashboardGifts(gifts, { filter: "comprados" });
		expect(result.map((g) => g.id)).toEqual(["done"]);
	});

	it("infaltables → priority high regardless of other state", () => {
		const result = filterAndSortDashboardGifts(gifts, {
			filter: "infaltables",
		});
		expect(result.map((g) => g.id)).toEqual(["star"]);
	});

	it("ocultos → hidden visibility only", () => {
		const result = filterAndSortDashboardGifts(gifts, { filter: "ocultos" });
		expect(result.map((g) => g.id)).toEqual(["hidden"]);
	});
});

describe("filterAndSortDashboardGifts — sort", () => {
	it("manual (default) sorts by sortOrder ascending", () => {
		const gifts = [
			makeGift({ id: "c", sortOrder: 2 }),
			makeGift({ id: "a", sortOrder: 0 }),
			makeGift({ id: "b", sortOrder: 1 }),
		];
		const result = filterAndSortDashboardGifts(gifts, {});
		expect(result.map((g) => g.id)).toEqual(["a", "b", "c"]);
	});

	it("nombre sorts alphabetically", () => {
		const gifts = [
			makeGift({ id: "z", name: "Zapatos" }),
			makeGift({ id: "a", name: "Andadera" }),
		];
		const result = filterAndSortDashboardGifts(gifts, { sort: "nombre" });
		expect(result.map((g) => g.id)).toEqual(["a", "z"]);
	});

	it("precio sorts ascending, nulls last", () => {
		const gifts = [
			makeGift({ id: "mid", priceAmount: "50.00" }),
			makeGift({ id: "null", priceAmount: null }),
			makeGift({ id: "low", priceAmount: "10.00" }),
		];
		const result = filterAndSortDashboardGifts(gifts, { sort: "precio" });
		expect(result.map((g) => g.id)).toEqual(["low", "mid", "null"]);
	});

	it("does not mutate the original array", () => {
		const gifts = [
			makeGift({ id: "b", sortOrder: 1 }),
			makeGift({ id: "a", sortOrder: 0 }),
		];
		const original = [...gifts];
		filterAndSortDashboardGifts(gifts, { sort: "nombre" });
		expect(gifts.map((g) => g.id)).toEqual(original.map((g) => g.id));
	});
});
