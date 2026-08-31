"use client";

import { ChevronLeftIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
	activeSegmentFromPathname,
	hrefFor,
	type SectionBadges,
	sectionLabel,
} from "../wishlist-sections";
import { MobileContextBar } from "./mobile-context-bar";
import { contextLineFor } from "./mobile-context-line";
import { WishlistChips } from "./wishlist-chips";

const EDITOR_SEGMENTS = new Set(["settings", "design"]);
const SHARE_ROUTE_PATTERN = /\/dashboard\/wishlists\/[^/]+\/share(\/|$)/;

type Props = {
	wishlistId: string;
	title: string;
	status: string;
	publicUrlPath: string;
	isOwner: boolean;
	totalGuests: number;
	totalInvitations: number;
	badges?: SectionBadges;
};

export function MobileWishlistTopChrome({
	wishlistId,
	title,
	status,
	publicUrlPath,
	isOwner,
	totalGuests,
	totalInvitations,
	badges,
}: Props) {
	const pathname = usePathname();

	if (SHARE_ROUTE_PATTERN.test(pathname)) {
		return null;
	}

	const activeSegment = activeSegmentFromPathname(pathname, wishlistId);

	if (EDITOR_SEGMENTS.has(activeSegment)) {
		return (
			<header className="flex shrink-0 items-center gap-2 border-border border-b bg-card px-2 py-2 md:hidden">
				<Link
					aria-label="Volver"
					className="flex size-9 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
					href={hrefFor(wishlistId, "")}
				>
					<ChevronLeftIcon className="size-5" />
				</Link>
				<p className="min-w-0 flex-1 truncate font-semibold text-sm">
					{sectionLabel(activeSegment)}
				</p>
			</header>
		);
	}

	const contextLine = contextLineFor({
		segment: activeSegment,
		status,
		totalGuests,
		totalInvitations,
	});

	return (
		<>
			<MobileContextBar
				activeSegment={activeSegment}
				badges={badges}
				contextLine={contextLine}
				isOwner={isOwner}
				publicUrlPath={publicUrlPath}
				status={status}
				title={title}
				wishlistId={wishlistId}
			/>
			<WishlistChips
				activeSegment={activeSegment}
				badges={badges}
				isOwner={isOwner}
				wishlistId={wishlistId}
			/>
		</>
	);
}
