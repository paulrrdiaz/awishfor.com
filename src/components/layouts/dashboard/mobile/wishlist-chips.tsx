"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import {
	hrefFor,
	mobileChipItemsFor,
	type SectionBadges,
	type WishlistSection,
} from "../wishlist-sections";

type Props = {
	wishlistId: string;
	isOwner: boolean;
	activeSegment: WishlistSection;
	badges?: SectionBadges;
};

export function WishlistChips({
	wishlistId,
	isOwner,
	activeSegment,
	badges,
}: Props) {
	const items = mobileChipItemsFor(isOwner);

	return (
		<nav
			aria-label="Secciones de la wishlist"
			className="shrink-0 border-border border-b bg-card px-3 py-2 md:hidden"
		>
			<ul className="flex gap-1.5 overflow-x-auto">
				{items.map((item) => {
					const isActive = item.segment === activeSegment;
					const badge = badges?.[item.segment];
					return (
						<li className="shrink-0" key={item.segment || "summary"}>
							<Link
								aria-current={isActive ? "page" : undefined}
								className={cn(
									"flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 font-medium text-sm",
									isActive
										? "border-primary bg-primary/10 text-foreground"
										: "border-border text-muted-foreground",
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
