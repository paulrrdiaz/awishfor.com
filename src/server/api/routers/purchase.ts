import { TRPCError } from "@trpc/server";
import type { createTRPCContext } from "@/server/api/trpc";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { mapOwnerPurchaseRecord } from "@/server/mappers/owner-purchase.mapper";
import type { OwnerPurchaseDatabase } from "@/server/services/purchase.service";
import {
	createOwnerManualPurchase,
	deleteOwnerPurchase,
	listOwnerGiftPurchases,
} from "@/server/services/purchase.service";
import {
	createOwnerManualPurchaseSchema,
	deleteOwnerPurchaseSchema,
	listGiftPurchasesSchema,
} from "@/server/validators/purchase.schema";

type PurchaseRouterContext = Awaited<ReturnType<typeof createTRPCContext>> & {
	userId: string;
};

const getLocalUserId = async (ctx: PurchaseRouterContext) => {
	const user = await ctx.db.user.findUnique({
		where: { clerkId: ctx.userId },
		select: { id: true },
	});
	if (!user) throw new TRPCError({ code: "UNAUTHORIZED" });
	return user.id;
};

const asOwnerPurchaseDb = (ctx: PurchaseRouterContext): OwnerPurchaseDatabase =>
	ctx.db as unknown as OwnerPurchaseDatabase;

export const purchaseRouter = createTRPCRouter({
	listForGift: protectedProcedure
		.input(listGiftPurchasesSchema)
		.query(async ({ ctx, input }) => {
			const ownerId = await getLocalUserId(ctx);
			const purchases = await listOwnerGiftPurchases(asOwnerPurchaseDb(ctx), {
				ownerId,
				giftId: input.giftId,
			});
			return purchases.map(mapOwnerPurchaseRecord);
		}),

	createManual: protectedProcedure
		.input(createOwnerManualPurchaseSchema)
		.mutation(async ({ ctx, input }) => {
			const ownerId = await getLocalUserId(ctx);
			const purchase = await createOwnerManualPurchase(asOwnerPurchaseDb(ctx), {
				ownerId,
				...input,
			});
			return mapOwnerPurchaseRecord(purchase);
		}),

	delete: protectedProcedure
		.input(deleteOwnerPurchaseSchema)
		.mutation(async ({ ctx, input }) => {
			const ownerId = await getLocalUserId(ctx);
			await deleteOwnerPurchase(asOwnerPurchaseDb(ctx), {
				ownerId,
				purchaseId: input.purchaseId,
			});
		}),
});
