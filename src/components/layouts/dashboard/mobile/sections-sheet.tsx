"use client";

import { EllipsisIcon, ExternalLinkIcon, Share2Icon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerFooter,
	DrawerHandle,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import {
	hrefFor,
	navItemsFor,
	type SectionBadges,
	type WishlistSection,
} from "../wishlist-sections";

type Props = {
	wishlistId: string;
	isOwner: boolean;
	activeSegment: WishlistSection;
	badges?: SectionBadges;
	publicUrlPath: string;
};

export function SectionsSheet({
	wishlistId,
	isOwner,
	activeSegment,
	badges,
	publicUrlPath,
}: Props) {
	const items = navItemsFor(isOwner);

	return (
		<Drawer>
			<DrawerTrigger asChild>
				<Button
					aria-label="Ver todas las secciones"
					className="shrink-0"
					size="icon-sm"
					type="button"
					variant="ghost"
				>
					<EllipsisIcon />
				</Button>
			</DrawerTrigger>
			<DrawerContent aria-label="Secciones de la wishlist">
				<DrawerHandle />
				<DrawerHeader className="sr-only">
					<DrawerTitle>Secciones</DrawerTitle>
				</DrawerHeader>
				<ul className="flex flex-col gap-0.5 overflow-y-auto p-2 pt-0">
					{items.map((item) => {
						const isActive = item.segment === activeSegment;
						const badge = badges?.[item.segment];
						const Icon = item.icon;
						return (
							<li key={item.segment || "summary"}>
								<DrawerClose asChild>
									<Link
										aria-current={isActive ? "page" : undefined}
										className={cn(
											"flex items-center gap-3 rounded-lg px-3 py-2.5 font-medium text-sm",
											isActive
												? "bg-muted text-foreground"
												: "text-muted-foreground",
										)}
										href={hrefFor(wishlistId, item.segment)}
									>
										<Icon className="size-4.5 shrink-0" />
										<span className="flex-1">{item.label}</span>
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
								</DrawerClose>
							</li>
						);
					})}
				</ul>
				<DrawerFooter className="flex-row gap-2 border-t pt-3">
					<Button asChild className="flex-1" type="button" variant="outline">
						<Link href={publicUrlPath} target="_blank">
							<ExternalLinkIcon />
							Ver pública
						</Link>
					</Button>
					<DrawerClose asChild>
						<Button asChild className="flex-1" type="button">
							<Link href={`/dashboard/wishlists/${wishlistId}/share`}>
								<Share2Icon />
								Compartir
							</Link>
						</Button>
					</DrawerClose>
				</DrawerFooter>
			</DrawerContent>
		</Drawer>
	);
}
