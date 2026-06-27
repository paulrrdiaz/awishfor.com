import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { GiftVisibilityStatus } from "@/generated/prisma/client";
import type { createTRPCContext } from "@/server/api/trpc";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { mapDashboardGift } from "@/server/mappers/dashboard-gift.mapper";
import type {
	DashboardGiftDatabase,
	ReorderGiftDatabase,
} from "@/server/services/gift.service";
import {
	getOwnedGift,
	groupDashboardGifts,
	listDashboardGifts,
	reorderGifts,
	softDeleteGift,
	updateGift,
} from "@/server/services/gift.service";
import {
	deleteGiftSchema,
	giftIdSchema,
	reorderGiftsSchema,
	updateGiftSchema,
} from "@/server/validators/gift.schema";

type GiftRouterContext = Awaited<ReturnType<typeof createTRPCContext>> & {
	userId: string;
};

const getLocalUserId = async (ctx: GiftRouterContext) => {
	const user = await ctx.db.user.findUnique({
		where: { clerkId: ctx.userId },
		select: { id: true },
	});
	if (!user) throw new TRPCError({ code: "UNAUTHORIZED" });
	return user.id;
};

const asDashboardDb = (ctx: GiftRouterContext): DashboardGiftDatabase =>
	ctx.db as unknown as DashboardGiftDatabase;

const asReorderDb = (ctx: GiftRouterContext): ReorderGiftDatabase =>
	ctx.db as unknown as ReorderGiftDatabase;

export const giftRouter = createTRPCRouter({
	list: protectedProcedure
		.input(z.object({ wishlistId: z.string().min(1) }))
		.query(async ({ ctx, input }) => {
			const ownerId = await getLocalUserId(ctx);
			const gifts = await listDashboardGifts(asDashboardDb(ctx), {
				ownerId,
				wishlistId: input.wishlistId,
			});
			const rows = gifts.map(mapDashboardGift);
			return groupDashboardGifts(rows);
		}),

	update: protectedProcedure
		.input(updateGiftSchema)
		.mutation(async ({ ctx, input }) => {
			const ownerId = await getLocalUserId(ctx);
			await getOwnedGift(asDashboardDb(ctx), { ownerId, giftId: input.giftId });
			return updateGift(ctx.db, input);
		}),

	setVisibility: protectedProcedure
		.input(
			z.object({
				giftId: giftIdSchema,
				visibilityStatus: z.enum(
					Object.values(GiftVisibilityStatus) as [string, ...string[]],
				),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const ownerId = await getLocalUserId(ctx);
			await getOwnedGift(asDashboardDb(ctx), { ownerId, giftId: input.giftId });
			return updateGift(ctx.db, {
				giftId: input.giftId,
				visibilityStatus: input.visibilityStatus,
			});
		}),

	delete: protectedProcedure
		.input(deleteGiftSchema)
		.mutation(async ({ ctx, input }) => {
			const ownerId = await getLocalUserId(ctx);
			await getOwnedGift(asDashboardDb(ctx), { ownerId, giftId: input.giftId });
			return softDeleteGift(ctx.db, input);
		}),

	reorder: protectedProcedure
		.input(reorderGiftsSchema)
		.mutation(async ({ ctx, input }) => {
			const ownerId = await getLocalUserId(ctx);
			return reorderGifts(asReorderDb(ctx), { ownerId, ...input });
		}),
});
