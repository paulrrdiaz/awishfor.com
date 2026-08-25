import { createLoader, parseAsString, parseAsStringEnum } from "nuqs/server";
import {
	DASHBOARD_INVITE_FILTERS,
	DEFAULT_DASHBOARD_INVITE_FILTER,
} from "@/lib/dashboard/guest-filters";

export const guestsSearchParams = {
	q: parseAsString.withDefault(""),
	status: parseAsStringEnum([...DASHBOARD_INVITE_FILTERS]).withDefault(
		DEFAULT_DASHBOARD_INVITE_FILTER,
	),
};

export const loadGuestsSearchParams = createLoader(guestsSearchParams);
