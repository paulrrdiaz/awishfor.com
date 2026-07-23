import type { createTRPCContext } from "@/server/api/trpc";
import {
	createTRPCRouter,
	protectedProcedure,
	publicProcedure,
} from "@/server/api/trpc";
import { mapDashboardInvite } from "@/server/mappers/dashboard-invite.mapper";
import {
	assertOwnedWishlist,
	createInvite,
	deleteInvite,
	getOwnedInvite,
	type InviteDatabase,
	listInvites,
	respondToInvite,
	updateInvite,
} from "@/server/services/invite.service";
import { getOrCreateLocalUserId } from "@/server/services/local-user.service";
import {
	createInviteSchema,
	deleteInviteSchema,
	listInvitesSchema,
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

export const inviteRouter = createTRPCRouter({
	list: protectedProcedure
		.input(listInvitesSchema)
		.query(async ({ ctx, input }) => {
			const ownerId = await getLocalUserId(ctx);
			await assertOwnedWishlist(asInviteDb(ctx), {
				ownerId,
				wishlistId: input.wishlistId,
			});
			const invites = await listInvites(asInviteDb(ctx), {
				wishlistId: input.wishlistId,
			});
			return invites.map(mapDashboardInvite);
		}),

	create: protectedProcedure
		.input(createInviteSchema)
		.mutation(async ({ ctx, input }) => {
			const ownerId = await getLocalUserId(ctx);
			await assertOwnedWishlist(asInviteDb(ctx), {
				ownerId,
				wishlistId: input.wishlistId,
			});
			const invite = await createInvite(asInviteDb(ctx), input);
			return mapDashboardInvite(invite);
		}),

	update: protectedProcedure
		.input(updateInviteSchema)
		.mutation(async ({ ctx, input }) => {
			const ownerId = await getLocalUserId(ctx);
			const existing = await getOwnedInvite(asInviteDb(ctx), {
				ownerId,
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
			const ownerId = await getLocalUserId(ctx);
			await getOwnedInvite(asInviteDb(ctx), {
				ownerId,
				inviteId: input.inviteId,
			});
			await deleteInvite(asInviteDb(ctx), { inviteId: input.inviteId });
		}),

	respond: publicProcedure
		.input(respondInviteSchema)
		.mutation(async ({ ctx, input }) =>
			respondToInvite(asInviteDb(ctx), input),
		),
});
