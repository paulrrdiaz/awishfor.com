import type {
	PublicCategoryViewModel,
	PublicGiftViewModel,
} from "@/server/mappers/view-models";

export type GiftFilter =
	| { kind: "status"; value: "all" | "available" | "purchased" | "infaltable" }
	| { kind: "category"; categoryId: string };

export type GiftSortMode = "recommended" | "price-asc" | "price-desc";

export const DEFAULT_FILTER: GiftFilter = { kind: "status", value: "all" };
export const DEFAULT_SORT_MODE: GiftSortMode = "recommended";

const PRIORITY_ORDER: Record<string, number> = { high: 0, medium: 1, low: 2 };

export function filterGifts(
	gifts: PublicGiftViewModel[],
	filter: GiftFilter,
): PublicGiftViewModel[] {
	if (filter.kind === "category") {
		return gifts.filter((g) => g.categoryId === filter.categoryId);
	}
	switch (filter.value) {
		case "all":
			return gifts;
		case "available":
			return gifts.filter(
				(g) => g.status === "available" || g.status === "partial",
			);
		case "purchased":
			return gifts.filter((g) => g.status === "purchased");
		case "infaltable":
			return gifts.filter((g) => g.priority === "high");
	}
}

export function sortGifts(
	gifts: PublicGiftViewModel[],
	mode: GiftSortMode,
): PublicGiftViewModel[] {
	const copy = [...gifts];

	if (mode === "recommended") {
		copy.sort((a, b) => {
			const aPurchased = a.status === "purchased" ? 1 : 0;
			const bPurchased = b.status === "purchased" ? 1 : 0;
			if (aPurchased !== bPurchased) return aPurchased - bPurchased;

			const aPri = PRIORITY_ORDER[a.priority] ?? 3;
			const bPri = PRIORITY_ORDER[b.priority] ?? 3;
			if (aPri !== bPri) return aPri - bPri;

			return a.sortOrder - b.sortOrder;
		});
		return copy;
	}

	copy.sort((a, b) => {
		const aPrice =
			a.priceAmount != null ? Number.parseFloat(a.priceAmount) : null;
		const bPrice =
			b.priceAmount != null ? Number.parseFloat(b.priceAmount) : null;

		if (aPrice === null && bPrice === null) return 0;
		if (aPrice === null) return 1;
		if (bPrice === null) return -1;

		return mode === "price-asc" ? aPrice - bPrice : bPrice - aPrice;
	});

	return copy;
}

export function buildCategoryFilters(
	categories: PublicCategoryViewModel[],
	gifts: PublicGiftViewModel[],
): PublicCategoryViewModel[] {
	const categoriesWithGifts = new Set(
		gifts.map((g) => g.categoryId).filter((id) => id != null),
	);
	return categories
		.filter((cat) => categoriesWithGifts.has(cat.id))
		.sort((a, b) => a.sortOrder - b.sortOrder);
}

export type StatusFilterCounts = {
	all: number;
	available: number;
	purchased: number;
	infaltable: number;
};

export function countByStatusFilter(
	gifts: PublicGiftViewModel[],
): StatusFilterCounts {
	return {
		all: gifts.length,
		available: gifts.filter(
			(g) => g.status === "available" || g.status === "partial",
		).length,
		purchased: gifts.filter((g) => g.status === "purchased").length,
		infaltable: gifts.filter((g) => g.priority === "high").length,
	};
}
