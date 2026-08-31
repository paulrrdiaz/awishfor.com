import { ChevronLeftIcon } from "lucide-react";
import Link from "next/link";
import type { SectionBadges, WishlistSection } from "../wishlist-sections";
import { WishlistSwitcher } from "../wishlist-switcher";
import { SectionsSheet } from "./sections-sheet";

type Props = {
	wishlistId: string;
	title: string;
	status: string;
	publicUrlPath: string;
	isOwner: boolean;
	activeSegment: WishlistSection;
	contextLine: string;
	badges?: SectionBadges;
};

export function MobileContextBar({
	wishlistId,
	title,
	status,
	publicUrlPath,
	isOwner,
	activeSegment,
	contextLine,
	badges,
}: Props) {
	return (
		<header className="flex shrink-0 items-center gap-1 border-border border-b bg-card px-2 py-2 md:hidden">
			<Link
				aria-label="Volver a mis wishlists"
				className="flex size-9 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
				href="/dashboard/wishlists"
			>
				<ChevronLeftIcon className="size-5" />
			</Link>
			<div className="min-w-0 flex-1">
				<WishlistSwitcher
					status={status}
					title={title}
					wishlistId={wishlistId}
				/>
				<p className="truncate px-1 text-muted-foreground text-xs">
					{contextLine}
				</p>
			</div>
			<SectionsSheet
				activeSegment={activeSegment}
				badges={badges}
				isOwner={isOwner}
				publicUrlPath={publicUrlPath}
				wishlistId={wishlistId}
			/>
		</header>
	);
}
