"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
	activeSegmentFromPathname,
	hrefFor,
	NAV_ITEMS,
} from "./wishlist-sections";

type Props = {
	wishlistId: string;
};

export function WishlistSectionRail({ wishlistId }: Props) {
	const pathname = usePathname();
	const activeSegment = activeSegmentFromPathname(pathname, wishlistId);

	return (
		<nav
			aria-label="Secciones de la wishlist"
			className="shrink-0 border-border border-b bg-card md:w-[60px] md:border-r md:border-b-0"
		>
			<ul className="flex gap-2 overflow-x-auto px-3 py-2.5 md:flex-col md:items-center md:gap-2.5 md:overflow-visible md:px-0 md:py-4">
				{NAV_ITEMS.map((item) => {
					const isActive = item.segment === activeSegment;
					const Icon = item.icon;
					return (
						<li className="shrink-0" key={item.segment || "summary"}>
							<Tooltip>
								<TooltipTrigger asChild>
									<Link
										aria-current={isActive ? "page" : undefined}
										className={cn(
											"flex items-center gap-2 rounded-[11px] px-3 py-2 font-medium text-muted-foreground text-xs transition-colors md:size-10 md:justify-center md:p-0",
											isActive
												? "bg-primary text-primary-foreground"
												: "hover:bg-muted",
										)}
										href={hrefFor(wishlistId, item.segment)}
									>
										<Icon className="size-[17px] shrink-0" />
										<span className="md:sr-only">{item.label}</span>
									</Link>
								</TooltipTrigger>
								<TooltipContent className="hidden md:block">
									{item.label}
								</TooltipContent>
							</Tooltip>
						</li>
					);
				})}
			</ul>
		</nav>
	);
}
