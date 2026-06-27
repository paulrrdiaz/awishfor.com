import { describe, expect, it } from "vitest";
import type {
	PublicCategoryViewModel,
	PublicGiftViewModel,
} from "@/server/mappers/view-models";
import {
	buildCategoryFilters,
	countByStatusFilter,
	filterGifts,
	sortGifts,
} from "./gift-filters";

function makeGift(
	overrides: Partial<PublicGiftViewModel> & { id: string },
): PublicGiftViewModel {
	return {
		id: overrides.id,
		name: overrides.name ?? `Gift ${overrides.id}`,
		productUrl: null,
		imageUrl: null,
		storeName: null,
		priceAmount: overrides.priceAmount ?? null,
		priceCurrency: null,
		quantityNeeded: 1,
		priority: overrides.priority ?? "medium",
		publicNote: null,
		sortOrder: overrides.sortOrder ?? 0,
		categoryId: overrides.categoryId ?? null,
		status: overrides.status ?? "available",
		remainingQuantity: overrides.remainingQuantity ?? 1,
	};
}

function makeCat(id: string, sortOrder: number): PublicCategoryViewModel {
	return { id, name: `Cat ${id}`, sortOrder };
}

describe("filterGifts", () => {
	const gifts = [
		makeGift({ id: "a", status: "available", priority: "high" }),
		makeGift({ id: "b", status: "partial", priority: "medium" }),
		makeGift({ id: "c", status: "purchased", priority: "low" }),
		makeGift({
			id: "d",
			status: "available",
			priority: "low",
			categoryId: "cat1",
		}),
		makeGift({
			id: "e",
			status: "purchased",
			priority: "high",
			categoryId: "cat2",
		}),
	];

	it("all → returns every gift", () => {
		const result = filterGifts(gifts, { kind: "status", value: "all" });
		expect(result).toHaveLength(5);
	});

	it("available → includes available and partial, excludes purchased", () => {
		const result = filterGifts(gifts, { kind: "status", value: "available" });
		expect(result.map((g) => g.id)).toEqual(["a", "b", "d"]);
	});

	it("purchased → only purchased gifts", () => {
		const result = filterGifts(gifts, { kind: "status", value: "purchased" });
		expect(result.map((g) => g.id)).toEqual(["c", "e"]);
	});

	it("infaltable → only priority=high regardless of status", () => {
		const result = filterGifts(gifts, { kind: "status", value: "infaltable" });
		expect(result.map((g) => g.id)).toEqual(["a", "e"]);
	});

	it("category → only gifts matching categoryId", () => {
		const result = filterGifts(gifts, { kind: "category", categoryId: "cat1" });
		expect(result.map((g) => g.id)).toEqual(["d"]);
	});

	it("category with no matches → empty array", () => {
		const result = filterGifts(gifts, {
			kind: "category",
			categoryId: "nonexistent",
		});
		expect(result).toHaveLength(0);
	});

	it("empty gift list → always returns empty", () => {
		expect(filterGifts([], { kind: "status", value: "all" })).toHaveLength(0);
		expect(
			filterGifts([], { kind: "status", value: "available" }),
		).toHaveLength(0);
		expect(
			filterGifts([], { kind: "category", categoryId: "cat1" }),
		).toHaveLength(0);
	});
});

describe("sortGifts — recommended", () => {
	it("purchasable gifts appear before purchased", () => {
		const gifts = [
			makeGift({ id: "p", status: "purchased", sortOrder: 1 }),
			makeGift({ id: "a", status: "available", sortOrder: 2 }),
			makeGift({ id: "r", status: "partial", sortOrder: 3 }),
		];
		const result = sortGifts(gifts, "recommended");
		expect(result[0]?.id).toBe("a");
		expect(result[1]?.id).toBe("r");
		expect(result[2]?.id).toBe("p");
	});

	it("within same purchase group, high priority before medium before low", () => {
		const gifts = [
			makeGift({
				id: "low",
				status: "available",
				priority: "low",
				sortOrder: 1,
			}),
			makeGift({
				id: "high",
				status: "available",
				priority: "high",
				sortOrder: 2,
			}),
			makeGift({
				id: "med",
				status: "available",
				priority: "medium",
				sortOrder: 3,
			}),
		];
		const result = sortGifts(gifts, "recommended");
		expect(result.map((g) => g.id)).toEqual(["high", "med", "low"]);
	});

	it("within same purchase group and priority, ascending sortOrder", () => {
		const gifts = [
			makeGift({
				id: "c",
				status: "available",
				priority: "medium",
				sortOrder: 3,
			}),
			makeGift({
				id: "a",
				status: "available",
				priority: "medium",
				sortOrder: 1,
			}),
			makeGift({
				id: "b",
				status: "available",
				priority: "medium",
				sortOrder: 2,
			}),
		];
		const result = sortGifts(gifts, "recommended");
		expect(result.map((g) => g.id)).toEqual(["a", "b", "c"]);
	});

	it("does not mutate the original array", () => {
		const gifts = [
			makeGift({ id: "p", status: "purchased", sortOrder: 1 }),
			makeGift({ id: "a", status: "available", sortOrder: 2 }),
		];
		const original = [...gifts];
		sortGifts(gifts, "recommended");
		expect(gifts.map((g) => g.id)).toEqual(original.map((g) => g.id));
	});
});

describe("sortGifts — price modes", () => {
	const gifts = [
		makeGift({ id: "mid", priceAmount: "50.00" }),
		makeGift({ id: "high", priceAmount: "100.00" }),
		makeGift({ id: "low", priceAmount: "10.00" }),
		makeGift({ id: "null", priceAmount: null }),
	];

	it("price-asc → low to high, null last", () => {
		const result = sortGifts(gifts, "price-asc");
		expect(result.map((g) => g.id)).toEqual(["low", "mid", "high", "null"]);
	});

	it("price-desc → high to low, null last", () => {
		const result = sortGifts(gifts, "price-desc");
		expect(result.map((g) => g.id)).toEqual(["high", "mid", "low", "null"]);
	});

	it("multiple null prices keep relative position (both last)", () => {
		const gs = [
			makeGift({ id: "a", priceAmount: null }),
			makeGift({ id: "b", priceAmount: "20.00" }),
			makeGift({ id: "c", priceAmount: null }),
		];
		const result = sortGifts(gs, "price-asc");
		expect(result[0]?.id).toBe("b");
		expect(new Set(result.slice(1).map((g) => g.id))).toEqual(
			new Set(["a", "c"]),
		);
	});
});

describe("buildCategoryFilters", () => {
	it("returns only categories that have at least one gift", () => {
		const cats = [makeCat("c1", 1), makeCat("c2", 2), makeCat("c3", 3)];
		const gifts = [
			makeGift({ id: "g1", categoryId: "c1" }),
			makeGift({ id: "g2", categoryId: "c3" }),
		];
		const result = buildCategoryFilters(cats, gifts);
		expect(result.map((c) => c.id)).toEqual(["c1", "c3"]);
	});

	it("orders by sortOrder ascending", () => {
		const cats = [makeCat("c3", 30), makeCat("c1", 10), makeCat("c2", 20)];
		const gifts = [
			makeGift({ id: "g1", categoryId: "c3" }),
			makeGift({ id: "g2", categoryId: "c1" }),
			makeGift({ id: "g3", categoryId: "c2" }),
		];
		const result = buildCategoryFilters(cats, gifts);
		expect(result.map((c) => c.id)).toEqual(["c1", "c2", "c3"]);
	});

	it("gifts with no categoryId do not create empty categories", () => {
		const cats = [makeCat("c1", 1)];
		const gifts = [makeGift({ id: "g1", categoryId: null })];
		const result = buildCategoryFilters(cats, gifts);
		expect(result).toHaveLength(0);
	});

	it("returns empty array when no gifts match any category", () => {
		const cats = [makeCat("c1", 1), makeCat("c2", 2)];
		const result = buildCategoryFilters(cats, []);
		expect(result).toHaveLength(0);
	});
});

describe("countByStatusFilter", () => {
	it("counts correctly across statuses and priorities", () => {
		const gifts = [
			makeGift({ id: "a", status: "available", priority: "high" }),
			makeGift({ id: "b", status: "partial", priority: "medium" }),
			makeGift({ id: "c", status: "purchased", priority: "high" }),
			makeGift({ id: "d", status: "available", priority: "low" }),
		];
		const counts = countByStatusFilter(gifts);
		expect(counts.all).toBe(4);
		expect(counts.available).toBe(3); // a (available) + b (partial) + d (available)
		expect(counts.purchased).toBe(1);
		expect(counts.infaltable).toBe(2); // a + c have priority=high
	});

	it("returns all zeros for empty list", () => {
		const counts = countByStatusFilter([]);
		expect(counts).toEqual({
			all: 0,
			available: 0,
			purchased: 0,
			infaltable: 0,
		});
	});
});
