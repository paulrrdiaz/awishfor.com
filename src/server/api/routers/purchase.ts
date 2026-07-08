import type { createTRPCContext } from "@/server/api/trpc";
import {
	createTRPCRouter,
	protectedProcedure,
	publicProcedure,
} from "@/server/api/trpc";
import { mapOwnerPurchaseRecord } from "@/server/mappers/owner-purchase.mapper";
import { getOrCreateLocalUserId } from "@/server/services/local-user.service";
import type {
	OwnerPurchaseDatabase,
	PublicPurchaseDatabase,
} from "@/server/services/purchase.service";
import {
	createOwnerManualPurchase,
	deleteOwnerPurchase,
	listOwnerGiftPurchases,
	markGiftPurchasedPublic,
	undoPurchase,
} from "@/server/services/purchase.service";
import {
	createOwnerManualPurchaseSchema,
	createPurchaseSchema,
	deleteOwnerPurchaseSchema,
	listGiftPurchasesSchema,
	undoPurchaseSchema,
} from "@/server/validators/purchase.schema";

type PurchaseRouterContext = Awaited<ReturnType<typeof createTRPCContext>> & {
	userId: string;
};

const getLocalUserId = (ctx: PurchaseRouterContext) =>
	getOrCreateLocalUserId(ctx);

const asOwnerPurchaseDb = (ctx: PurchaseRouterContext): OwnerPurchaseDatabase =>
	ctx.db as unknown as OwnerPurchaseDatabase;

type PublicContext = Awaited<ReturnType<typeof createTRPCContext>>;
const asPublicPurchaseDb = (ctx: PublicContext): PublicPurchaseDatabase =>
	ctx.db as unknown as PublicPurchaseDatabase;

export const purchaseRouter = createTRPCRouter({
	markGiftPurchased: publicProcedure
		.input(createPurchaseSchema)
		.mutation(async ({ ctx, input }) => {
			const result = await markGiftPurchasedPublic(
				asPublicPurchaseDb(ctx),
				input,
			);
			return {
				purchase: mapOwnerPurchaseRecord(result.purchase),
				undoToken: result.undoToken,
			};
		}),

	undoRecentPurchase: publicProcedure
		.input(undoPurchaseSchema)
		.mutation(async ({ ctx, input }) => {
			await undoPurchase(asPublicPurchaseDb(ctx), input);
			return { ok: true } as const;
		}),

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
