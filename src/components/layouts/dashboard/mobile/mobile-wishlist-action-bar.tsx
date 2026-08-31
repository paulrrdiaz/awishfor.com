"use client";

import { usePathname } from "next/navigation";
import { activeSegmentFromPathname } from "../wishlist-sections";
import { GiftsMobileActionBar } from "./gifts-mobile-action-bar";
import { GuestsMobileActionBar } from "./guests-mobile-action-bar";

type Props = {
	wishlistId: string;
	pendingInvitations: number;
};

export function MobileWishlistActionBar({
	wishlistId,
	pendingInvitations,
}: Props) {
	const pathname = usePathname();
	const activeSegment = activeSegmentFromPathname(pathname, wishlistId);

	if (activeSegment === "gifts") {
		return <GiftsMobileActionBar wishlistId={wishlistId} />;
	}
	if (activeSegment === "guests") {
		return (
			<GuestsMobileActionBar
				pendingInvitations={pendingInvitations}
				wishlistId={wishlistId}
			/>
		);
	}
	return null;
}
