"use client";

import type { ComponentProps } from "react";
import { PublicWishlistProviders } from "@/components/providers/public-wishlist-providers";
import { GuestGiftDrawer } from "./guest-gift-drawer";

/** Loads the mutation provider together with the guest drawer, never in the
 * anonymous page's initial bundle. */
export function PublicGuestGiftDrawer(
	props: ComponentProps<typeof GuestGiftDrawer>,
) {
	return (
		<PublicWishlistProviders>
			<GuestGiftDrawer {...props} />
		</PublicWishlistProviders>
	);
}
