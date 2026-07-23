"use client";

import { Search } from "lucide-react";
import { useQueryState } from "nuqs";
import { useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { giftsSearchParams } from "@/app/(protected)/dashboard/wishlists/[id]/gifts/search-params";
import { Input } from "@/components/ui/input";

export function GiftsSearchInput() {
	const [q, setQ] = useQueryState("q", giftsSearchParams.q);
	const [value, setValue] = useState(q);

	const setQueryDebounced = useDebouncedCallback((next: string) => {
		void setQ(next || null);
	}, 300);

	return (
		<div className="relative min-w-[200px] flex-1">
			<Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
			<Input
				className="h-10 pl-9"
				onChange={(event) => {
					setValue(event.target.value);
					setQueryDebounced(event.target.value);
				}}
				placeholder="Buscar regalo…"
				type="search"
				value={value}
			/>
		</div>
	);
}
