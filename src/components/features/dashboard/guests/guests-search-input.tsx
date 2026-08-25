"use client";

import { Search } from "lucide-react";
import { useQueryState } from "nuqs";
import { useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { guestsSearchParams } from "@/app/(protected)/dashboard/wishlists/[id]/guests/search-params";
import { Input } from "@/components/ui/input";

export function GuestsSearchInput() {
	const [q, setQ] = useQueryState("q", guestsSearchParams.q);
	const [value, setValue] = useState(q);

	useEffect(() => {
		setValue(q);
	}, [q]);

	const setQueryDebounced = useDebouncedCallback((next: string) => {
		void setQ(next || null);
	}, 300);

	return (
		<div className="relative min-w-[200px] flex-1">
			<Search
				aria-hidden="true"
				className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
			/>
			<Input
				aria-label="Buscar invitados"
				className="h-10 pl-9"
				onChange={(event) => {
					setValue(event.target.value);
					setQueryDebounced(event.target.value);
				}}
				placeholder="Buscar invitado…"
				type="search"
				value={value}
			/>
		</div>
	);
}
