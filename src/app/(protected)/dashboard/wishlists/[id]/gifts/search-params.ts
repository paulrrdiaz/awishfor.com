import { createLoader, parseAsString, parseAsStringEnum } from "nuqs/server";
import {
	DASHBOARD_GIFT_FILTERS,
	DASHBOARD_GIFT_SORTS,
	DEFAULT_DASHBOARD_GIFT_FILTER,
	DEFAULT_DASHBOARD_GIFT_SORT,
} from "@/lib/dashboard/gift-filters";

export const giftsSearchParams = {
	// Gift filtering and sorting happen in the server page, so each query
	// update must refresh it instead of performing nuqs' default shallow update.
	q: parseAsString.withDefault("").withOptions({ shallow: false }),
	filter: parseAsStringEnum([...DASHBOARD_GIFT_FILTERS])
		.withDefault(DEFAULT_DASHBOARD_GIFT_FILTER)
		.withOptions({ shallow: false }),
	sort: parseAsStringEnum([...DASHBOARD_GIFT_SORTS])
		.withDefault(DEFAULT_DASHBOARD_GIFT_SORT)
		.withOptions({ shallow: false }),
};

export const loadGiftsSearchParams = createLoader(giftsSearchParams);
