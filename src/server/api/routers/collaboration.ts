import { after } from "next/server";
import { env } from "@/env";
import type { createTRPCContext } from "@/server/api/trpc";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { getOrCreateLocalUserId } from "@/server/services/local-user.service";
import { sendWishlistInvitationEmail } from "@/server/services/wishlist-invitation-email.service";
import {
	getRecipientPreview,
	listCollaborators,
	removeCollaborator,
	resendInvitation,
	revokeInvitation,
	shareWishlist,
	type WishlistSharingDatabase,
} from "@/server/services/wishlist-sharing.service";
import {
	listCollaboratorsSchema,
	lookupRecipientSchema,
	removeCollaboratorSchema,
	resendInvitationSchema,
	revokeInvitationSchema,
	shareWishlistSchema,
} from "@/server/validators/collaboration.schema";

type CollaborationRouterContext = Awaited<
	ReturnType<typeof createTRPCContext>
> & {
	userId: string;
};

const getLocalUserId = (ctx: CollaborationRouterContext) =>
	getOrCreateLocalUserId(ctx);

const asSharingDb = (
	ctx: Awaited<ReturnType<typeof createTRPCContext>>,
): WishlistSharingDatabase => ctx.db as unknown as WishlistSharingDatabase;

const existingAccountCtaUrl = (wishlistId: string) =>
	`${env.NEXT_PUBLIC_APP_URL}/dashboard/wishlists/${wishlistId}/gifts`;

const newAccountCtaUrl = (token: string) =>
	`${env.NEXT_PUBLIC_APP_URL}/invitations/${token}`;

export const collaborationRouter = createTRPCRouter({
	lookupRecipient: protectedProcedure
		.input(lookupRecipientSchema)
		.query(async ({ ctx, input }) => {
			const localUserId = await getLocalUserId(ctx);
			return getRecipientPreview(asSharingDb(ctx), {
				wishlistId: input.wishlistId,
				ownerId: localUserId,
				email: input.email,
			});
		}),

	share: protectedProcedure
		.input(shareWishlistSchema)
		.mutation(async ({ ctx, input }) => {
			const localUserId = await getLocalUserId(ctx);
			const result = await shareWishlist(asSharingDb(ctx), {
				wishlistId: input.wishlistId,
				ownerId: localUserId,
				email: input.email,
			});

			if (result.status === "granted_existing") {
				after(() =>
					sendWishlistInvitationEmail({
						to: result.email,
						wishlistTitle: result.wishlistTitle,
						inviterName: result.inviterName,
						ctaUrl: existingAccountCtaUrl(input.wishlistId),
						variant: "existing_account",
					}),
				);
			} else if (result.status === "granted_pending") {
				after(() =>
					sendWishlistInvitationEmail({
						to: result.email,
						wishlistTitle: result.wishlistTitle,
						inviterName: result.inviterName,
						ctaUrl: newAccountCtaUrl(result.token),
						variant: "new_account",
					}),
				);
			}

			// Worded identically regardless of branch — see wishlist-collaboration spec,
			// "Owner-facing wording does not reveal account existence".
			return { ok: true } as const;
		}),

	list: protectedProcedure
		.input(listCollaboratorsSchema)
		.query(async ({ ctx, input }) => {
			const localUserId = await getLocalUserId(ctx);
			return listCollaborators(asSharingDb(ctx), {
				wishlistId: input.wishlistId,
				ownerId: localUserId,
			});
		}),

	removeMember: protectedProcedure
		.input(removeCollaboratorSchema)
		.mutation(async ({ ctx, input }) => {
			const localUserId = await getLocalUserId(ctx);
			await removeCollaborator(asSharingDb(ctx), {
				wishlistId: input.wishlistId,
				ownerId: localUserId,
				memberId: input.memberId,
			});
		}),

	revokeInvitation: protectedProcedure
		.input(revokeInvitationSchema)
		.mutation(async ({ ctx, input }) => {
			const localUserId = await getLocalUserId(ctx);
			await revokeInvitation(asSharingDb(ctx), {
				wishlistId: input.wishlistId,
				ownerId: localUserId,
				invitationId: input.invitationId,
			});
		}),

	resendInvitation: protectedProcedure
		.input(resendInvitationSchema)
		.mutation(async ({ ctx, input }) => {
			const localUserId = await getLocalUserId(ctx);
			const result = await resendInvitation(asSharingDb(ctx), {
				wishlistId: input.wishlistId,
				ownerId: localUserId,
				invitationId: input.invitationId,
			});

			after(() =>
				sendWishlistInvitationEmail({
					to: result.email,
					wishlistTitle: result.wishlistTitle,
					inviterName: result.inviterName,
					ctaUrl: newAccountCtaUrl(result.token),
					variant: "new_account",
				}),
			);
		}),
});
