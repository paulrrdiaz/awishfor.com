import type { DashboardGiftRowViewModel } from "@/server/mappers/view-models";

export const DASHBOARD_GIFT_FILTERS = [
	"todos",
	"disponibles",
	"comprados",
	"infaltables",
	"ocultos",
] as const;

export type DashboardGiftFilter = (typeof DASHBOARD_GIFT_FILTERS)[number];

export const DASHBOARD_GIFT_SORTS = ["manual", "nombre", "precio"] as const;

export type DashboardGiftSort = (typeof DASHBOARD_GIFT_SORTS)[number];

export const DEFAULT_DASHBOARD_GIFT_FILTER: DashboardGiftFilter = "todos";
export const DEFAULT_DASHBOARD_GIFT_SORT: DashboardGiftSort = "manual";

function matchesSearch(gift: DashboardGiftRowViewModel, term: string): boolean {
	const normalized = term.trim().toLowerCase();
	if (!normalized) return true;
	return (
		gift.name.toLowerCase().includes(normalized) ||
		(gift.storeName?.toLowerCase().includes(normalized) ?? false)
	);
}

function matchesFilter(
	gift: DashboardGiftRowViewModel,
	filter: DashboardGiftFilter,
): boolean {
	switch (filter) {
		case "disponibles":
			return gift.visibilityStatus !== "hidden" && gift.remainingQuantity > 0;
		case "comprados":
			return gift.visibilityStatus !== "hidden" && gift.remainingQuantity === 0;
		case "infaltables":
			return gift.priority === "high";
		case "ocultos":
			return gift.visibilityStatus === "hidden";
		default:
			return true;
	}
}

function sortByField(
	gifts: DashboardGiftRowViewModel[],
	sort: DashboardGiftSort,
): DashboardGiftRowViewModel[] {
	const copy = [...gifts];

	if (sort === "nombre") {
		copy.sort((a, b) => a.name.localeCompare(b.name, "es"));
		return copy;
	}

	if (sort === "precio") {
		copy.sort((a, b) => {
			const aPrice =
				a.priceAmount != null ? Number.parseFloat(a.priceAmount) : null;
			const bPrice =
				b.priceAmount != null ? Number.parseFloat(b.priceAmount) : null;
			if (aPrice === null && bPrice === null) return 0;
			if (aPrice === null) return 1;
			if (bPrice === null) return -1;
			return aPrice - bPrice;
		});
		return copy;
	}

	copy.sort((a, b) => a.sortOrder - b.sortOrder);
	return copy;
}

export function filterAndSortDashboardGifts(
	gifts: DashboardGiftRowViewModel[],
	{
		q = "",
		filter = DEFAULT_DASHBOARD_GIFT_FILTER,
		sort = DEFAULT_DASHBOARD_GIFT_SORT,
	}: { q?: string; filter?: DashboardGiftFilter; sort?: DashboardGiftSort },
): DashboardGiftRowViewModel[] {
	const filtered = gifts.filter(
		(gift) => matchesSearch(gift, q) && matchesFilter(gift, filter),
	);
	return sortByField(filtered, sort);
}
