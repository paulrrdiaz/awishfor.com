"use client";

import { useQueryState } from "nuqs";
import { giftsSearchParams } from "@/app/(protected)/dashboard/wishlists/[id]/gifts/search-params";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { DashboardGiftSort } from "@/lib/dashboard/gift-filters";

const SORT_LABELS: Record<string, string> = {
	manual: "Manual",
	nombre: "Nombre",
	precio: "Precio",
};

export function GiftSortSelect() {
	const [sort, setSort] = useQueryState("sort", giftsSearchParams.sort);

	return (
		<Select
			onValueChange={(value) =>
				void setSort(value === "manual" ? null : (value as DashboardGiftSort))
			}
			value={sort}
		>
			<SelectTrigger className="h-10 w-auto gap-2">
				<span className="text-muted-foreground">Orden:</span>
				<SelectValue>{SORT_LABELS[sort]}</SelectValue>
			</SelectTrigger>
			<SelectContent>
				<SelectItem value="manual">Manual</SelectItem>
				<SelectItem value="nombre">Nombre</SelectItem>
				<SelectItem value="precio">Precio</SelectItem>
			</SelectContent>
		</Select>
	);
}
