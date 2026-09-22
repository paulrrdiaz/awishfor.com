import type { createTRPCContext } from "@/server/api/trpc";
import {
	createTRPCRouter,
	protectedProcedure,
	publicProcedure,
} from "@/server/api/trpc";
import { mapDashboardInvite } from "@/server/mappers/dashboard-invite.mapper";
import { assertWishlistAccess } from "@/server/services/collaboration.service";
import {
	createInvite,
	deleteInvite,
	getOwnedInvite,
	getOwnerInvite,
	type InviteDatabase,
	listInvites,
	type OwnerRsvpDatabase,
	recordFollowUpCopy,
	recordOwnerRsvp,
	reopenOwnerRsvp,
	updateInvite,
} from "@/server/services/invite.service";
import { getOrCreateLocalUserId } from "@/server/services/local-user.service";
import {
	type PublicInviteDatabase,
	respondToInvite,
} from "@/server/services/public-invite.service";
import {
	createInviteSchema,
	deleteInviteSchema,
	listInvitesSchema,
	recordFollowUpCopySchema,
	recordOwnerRsvpSchema,
	reopenOwnerRsvpSchema,
	respondInviteSchema,
	updateInviteSchema,
} from "@/server/validators/invite.schema";

type InviteRouterContext = Awaited<ReturnType<typeof createTRPCContext>> & {
	userId: string;
};

const getLocalUserId = (ctx: InviteRouterContext) =>
	getOrCreateLocalUserId(ctx);

const asInviteDb = (
	ctx: Awaited<ReturnType<typeof createTRPCContext>>,
): InviteDatabase => ctx.db as unknown as InviteDatabase;

const asPublicInviteDb = (
	ctx: Awaited<ReturnType<typeof createTRPCContext>>,
): PublicInviteDatabase => ctx.db as unknown as PublicInviteDatabase;

export const inviteRouter = createTRPCRouter({
	list: protectedProcedure
		.input(listInvitesSchema)
		.query(async ({ ctx, input }) => {
			const localUserId = await getLocalUserId(ctx);
			const { isOwner } = await assertWishlistAccess(asInviteDb(ctx), {
				localUserId,
				wishlistId: input.wishlistId,
			});
			const invites = await listInvites(asInviteDb(ctx), {
				wishlistId: input.wishlistId,
			});
			return invites.map((invite) =>
				mapDashboardInvite(invite, { includeAnalytics: isOwner }),
			);
		}),

	create: protectedProcedure
		.input(createInviteSchema)
		.mutation(async ({ ctx, input }) => {
			const localUserId = await getLocalUserId(ctx);
			await assertWishlistAccess(asInviteDb(ctx), {
				localUserId,
				wishlistId: input.wishlistId,
			});
			const invite = await createInvite(asInviteDb(ctx), input);
			return mapDashboardInvite(invite);
		}),

	update: protectedProcedure
		.input(updateInviteSchema)
		.mutation(async ({ ctx, input }) => {
			const localUserId = await getLocalUserId(ctx);
			const existing = await getOwnedInvite(asInviteDb(ctx), {
				localUserId,
				inviteId: input.inviteId,
			});
			const invite = await updateInvite(asInviteDb(ctx), {
				...input,
				wishlistId: existing.wishlistId,
			});
			return mapDashboardInvite(invite);
		}),

	delete: protectedProcedure
		.input(deleteInviteSchema)
		.mutation(async ({ ctx, input }) => {
			const localUserId = await getLocalUserId(ctx);
			await getOwnedInvite(asInviteDb(ctx), {
				localUserId,
				inviteId: input.inviteId,
			});
			await deleteInvite(asInviteDb(ctx), { inviteId: input.inviteId });
		}),

	recordOwnerRsvp: protectedProcedure
		.input(recordOwnerRsvpSchema)
		.mutation(async ({ ctx, input }) => {
			const localUserId = await getLocalUserId(ctx);
			const invite = await getOwnerInvite(asInviteDb(ctx), {
				localUserId,
				inviteId: input.inviteId,
			});
			await recordOwnerRsvp(asInviteDb(ctx) as OwnerRsvpDatabase, {
				invite,
				status: input.status,
				extraGuests: input.extraGuests,
			});
		}),

	reopenOwnerRsvp: protectedProcedure
		.input(reopenOwnerRsvpSchema)
		.mutation(async ({ ctx, input }) => {
			const localUserId = await getLocalUserId(ctx);
			await getOwnerInvite(asInviteDb(ctx), {
				localUserId,
				inviteId: input.inviteId,
			});
			await reopenOwnerRsvp(asInviteDb(ctx) as OwnerRsvpDatabase, input);
		}),

	recordFollowUpCopy: protectedProcedure
		.input(recordFollowUpCopySchema)
		.mutation(async ({ ctx, input }) => {
			const localUserId = await getLocalUserId(ctx);
			await recordFollowUpCopy(asInviteDb(ctx), { ...input, localUserId });
		}),

	respond: publicProcedure
		.input(respondInviteSchema)
		.mutation(async ({ ctx, input }) =>
			respondToInvite(asPublicInviteDb(ctx), input),
		),
});
