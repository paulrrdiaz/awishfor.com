"use client";

import { useUser } from "@clerk/nextjs";
import { MoreHorizontalIcon } from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type MobileRootOverflowItem = {
	label: string;
	onSelect: () => void;
};

type Props = {
	title: string;
	overflowItems?: MobileRootOverflowItem[];
};

export function MobileRootTitleBar({ title, overflowItems = [] }: Props) {
	const { user } = useUser();
	const displayName = user?.fullName ?? user?.firstName ?? "";
	const fallbackInitial = displayName.trim().charAt(0).toUpperCase() || "M";
	const avatarUrl = user?.imageUrl;

	return (
		<header className="flex shrink-0 items-center justify-between gap-2 border-border border-b bg-card px-3.5 py-3 md:hidden">
			<div
				aria-hidden
				className="flex size-[30px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#edf7e9] font-semibold text-[#3c6743] text-xs"
				style={
					avatarUrl
						? {
								backgroundImage: `url(${avatarUrl})`,
								backgroundPosition: "center",
								backgroundSize: "cover",
							}
						: undefined
				}
			>
				{avatarUrl ? null : fallbackInitial}
			</div>

			<p className="min-w-0 flex-1 truncate text-center font-semibold text-sm">
				{title}
			</p>

			{overflowItems.length > 0 ? (
				<DropdownMenu>
					<DropdownMenuTrigger
						aria-label="Más opciones"
						className="flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
					>
						<MoreHorizontalIcon className="size-4" />
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						{overflowItems.map((item) => (
							<DropdownMenuItem key={item.label} onSelect={item.onSelect}>
								{item.label}
							</DropdownMenuItem>
						))}
					</DropdownMenuContent>
				</DropdownMenu>
			) : (
				<span aria-hidden className="size-8 shrink-0" />
			)}
		</header>
	);
}
