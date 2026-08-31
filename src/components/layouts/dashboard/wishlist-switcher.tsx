"use client";

import { PlusIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import {
	activeSegmentFromPathname,
	hrefFor,
	navItemsFor,
} from "./wishlist-sections";
import {
	wishlistStatusBadgeVariant,
	wishlistStatusDotClassName,
	wishlistStatusLabel,
} from "./wishlist-status";

type Props = {
	wishlistId: string;
	title: string;
	status: string;
};

type SwitcherEntry = {
	id: string;
	title: string;
	status: string;
	totalGiftCount: number;
	purchasedUnits: number;
	totalUnits: number;
	isOwner: boolean;
};

export function WishlistSwitcher({ wishlistId, title, status }: Props) {
	const [open, setOpen] = useState(false);
	const [query, setQuery] = useState("");
	const pathname = usePathname();
	const activeSegment = activeSegmentFromPathname(pathname, wishlistId);

	const { data, isLoading } = api.wishlist.summaryList.useQuery(undefined, {
		enabled: open,
	});

	const entries = useMemo<SwitcherEntry[]>(() => {
		if (!data) {
			return [];
		}
		return [
			...data.owned.map((wishlist) => ({ ...wishlist, isOwner: true })),
			...data.shared.map((wishlist) => ({ ...wishlist, isOwner: false })),
		];
	}, [data]);

	const filtered = useMemo(() => {
		const normalized = query.trim().toLowerCase();
		if (!normalized) {
			return entries;
		}
		return entries.filter((entry) =>
			entry.title.toLowerCase().includes(normalized),
		);
	}, [entries, query]);

	const hrefForEntry = (entry: SwitcherEntry) => {
		const targetSegment = navItemsFor(entry.isOwner).some(
			(item) => item.segment === activeSegment,
		)
			? activeSegment
			: "";
		return hrefFor(entry.id, targetSegment);
	};

	return (
		<Popover onOpenChange={setOpen} open={open}>
			<PopoverTrigger asChild>
				<button
					className="flex min-w-0 items-center gap-1.5 rounded-md px-1 py-0.5 font-semibold text-foreground text-xs hover:bg-muted"
					type="button"
				>
					<span
						aria-hidden
						className={cn(
							"size-1.5 shrink-0 rounded-full",
							wishlistStatusDotClassName(status),
						)}
					/>
					<span className="min-w-0 truncate">{title}</span>
				</button>
			</PopoverTrigger>
			<PopoverContent align="start" className="w-80 p-0">
				<div className="border-border border-b p-2">
					<Input
						onChange={(event) => setQuery(event.target.value)}
						placeholder="Buscar wishlist…"
						value={query}
					/>
				</div>
				<ul className="max-h-72 overflow-y-auto p-1">
					{isLoading && (
						<li className="px-3 py-2 text-muted-foreground text-sm">
							Cargando…
						</li>
					)}
					{!isLoading && filtered.length === 0 && (
						<li className="px-3 py-2 text-muted-foreground text-sm">
							Ninguna wishlist coincide.
						</li>
					)}
					{filtered.map((entry) => (
						<li key={entry.id}>
							<Link
								className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left hover:bg-muted"
								href={hrefForEntry(entry)}
								onClick={() => setOpen(false)}
							>
								<span
									aria-hidden
									className={cn(
										"size-1.5 shrink-0 rounded-full",
										wishlistStatusDotClassName(entry.status),
									)}
								/>
								<span className="min-w-0 flex-1">
									<span className="block truncate font-medium text-sm">
										{entry.title}
									</span>
									<span className="block truncate text-muted-foreground text-xs">
										{entry.totalGiftCount} regalos · {entry.purchasedUnits}/
										{entry.totalUnits} comprados
									</span>
								</span>
								<Badge variant={wishlistStatusBadgeVariant(entry.status)}>
									{wishlistStatusLabel(entry.status)}
								</Badge>
							</Link>
						</li>
					))}
				</ul>
				<div className="flex items-center justify-between gap-2 border-border border-t p-2">
					<Link
						className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 font-medium text-primary text-sm hover:bg-muted"
						href="/create"
						onClick={() => setOpen(false)}
					>
						<PlusIcon className="size-4" />
						Nueva wishlist
					</Link>
					<Link
						className="rounded-md px-2 py-1.5 text-muted-foreground text-xs hover:bg-muted hover:text-foreground"
						href="/dashboard/wishlists"
						onClick={() => setOpen(false)}
					>
						Ver todas · archivadas
					</Link>
				</div>
			</PopoverContent>
		</Popover>
	);
}
