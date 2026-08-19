import "server-only";
import { sendEmail } from "@/lib/email/send";
import {
	type WishlistInvitationVariant,
	wishlistInvitationEmail,
} from "@/lib/email/templates/wishlist-invitation";

export type SendWishlistInvitationEmailInput = {
	to: string;
	wishlistTitle: string;
	inviterName: string;
	ctaUrl: string;
	variant: WishlistInvitationVariant;
};

/**
 * Sends the collaboration invitation email. Never throws — sendEmail
 * captures failures internally so a delivery problem does not roll back the
 * membership or invitation row that already committed.
 */
export const sendWishlistInvitationEmail = async ({
	to,
	wishlistTitle,
	inviterName,
	ctaUrl,
	variant,
}: SendWishlistInvitationEmailInput): Promise<void> => {
	const content = wishlistInvitationEmail({
		wishlistTitle,
		inviterName,
		ctaUrl,
		variant,
	});
	await sendEmail({ to, ...content });
};
