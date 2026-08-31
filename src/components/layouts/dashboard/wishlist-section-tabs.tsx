"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
	activeSegmentFromPathname,
	hrefFor,
	navItemsFor,
	type SectionBadges,
} from "./wishlist-sections";

type Props = {
	wishlistId: string;
	isOwner: boolean;
	badges?: SectionBadges;
};

export function WishlistSectionTabs({ wishlistId, isOwner, badges }: Props) {
	const pathname = usePathname();
	const activeSegment = activeSegmentFromPathname(pathname, wishlistId);
	const navItems = navItemsFor(isOwner);

	return (
		<nav
			aria-label="Secciones de la wishlist"
			className="shrink-0 border-border border-b bg-card px-7"
		>
			<ul className="flex gap-1 overflow-x-auto">
				{navItems.map((item) => {
					const isActive = item.segment === activeSegment;
					const badge = badges?.[item.segment];
					return (
						<li className="shrink-0" key={item.segment || "summary"}>
							<Link
								aria-current={isActive ? "page" : undefined}
								className={cn(
									"flex items-center gap-1.5 whitespace-nowrap border-transparent border-b-2 px-3 py-3 font-medium text-muted-foreground text-sm transition-colors hover:text-foreground",
									isActive && "border-primary text-foreground",
								)}
								href={hrefFor(wishlistId, item.segment)}
							>
								{item.label}
								{badge && badge.count > 0 && (
									<span
										className={cn(
											"rounded-full px-1.5 py-0.5 font-semibold text-[10px] leading-none",
											badge.variant === "warning"
												? "bg-amber-100 text-amber-800"
												: "bg-muted text-muted-foreground",
										)}
									>
										{badge.count}
									</span>
								)}
							</Link>
						</li>
					);
				})}
			</ul>
		</nav>
	);
}
