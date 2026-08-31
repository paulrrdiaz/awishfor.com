import type { WishlistSection } from "../wishlist-sections";
import { wishlistStatusLabel } from "../wishlist-status";

type ContextLineInput = {
	segment: WishlistSection;
	status: string;
	totalGuests: number;
	totalInvitations: number;
};

export function contextLineFor({
	segment,
	status,
	totalGuests,
	totalInvitations,
}: ContextLineInput): string {
	if (segment === "guests") {
		const people = totalGuests === 1 ? "persona" : "personas";
		const invitations = totalInvitations === 1 ? "invitación" : "invitaciones";
		return `${totalGuests} ${people} · ${totalInvitations} ${invitations}`;
	}
	return wishlistStatusLabel(status);
}
