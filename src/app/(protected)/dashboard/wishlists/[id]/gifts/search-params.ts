import { createLoader, parseAsString, parseAsStringEnum } from "nuqs/server";
import {
	DASHBOARD_GIFT_FILTERS,
	DASHBOARD_GIFT_SORTS,
	DEFAULT_DASHBOARD_GIFT_FILTER,
	DEFAULT_DASHBOARD_GIFT_SORT,
} from "@/lib/dashboard/gift-filters";

export const giftsSearchParams = {
	q: parseAsString.withDefault(""),
	filter: parseAsStringEnum([...DASHBOARD_GIFT_FILTERS]).withDefault(
		DEFAULT_DASHBOARD_GIFT_FILTER,
	),
	sort: parseAsStringEnum([...DASHBOARD_GIFT_SORTS]).withDefault(
		DEFAULT_DASHBOARD_GIFT_SORT,
	),
};

export const loadGiftsSearchParams = createLoader(giftsSearchParams);
