import type { createTRPCContext } from "@/server/api/trpc";
import {
	createTRPCRouter,
	protectedProcedure,
	publicProcedure,
} from "@/server/api/trpc";
import { mapOwnerPurchaseRecord } from "@/server/mappers/owner-purchase.mapper";
import { getOrCreateLocalUserId } from "@/server/services/local-user.service";
import {
	invalidatePublicWishlistByGiftId,
	type PublicGiftInvalidationDatabase,
} from "@/server/services/public-wishlist-cache";
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

const invalidateGiftWishlist = (ctx: PublicContext, giftId: string) =>
	invalidatePublicWishlistByGiftId(
		ctx.db as unknown as PublicGiftInvalidationDatabase,
		giftId,
	);

export const purchaseRouter = createTRPCRouter({
	markGiftPurchased: publicProcedure
		.input(createPurchaseSchema)
		.mutation(async ({ ctx, input }) => {
			const result = await markGiftPurchasedPublic(
				asPublicPurchaseDb(ctx),
				input,
			);
			await invalidateGiftWishlist(ctx, result.purchase.giftId);
			return {
				purchase: mapOwnerPurchaseRecord(result.purchase),
				undoToken: result.undoToken,
				undoExpiresAt: result.purchase.undoExpiresAt?.toISOString() ?? null,
			};
		}),

	undoRecentPurchase: publicProcedure
		.input(undoPurchaseSchema)
		.mutation(async ({ ctx, input }) => {
			const purchase = await undoPurchase(asPublicPurchaseDb(ctx), input);
			await invalidateGiftWishlist(ctx, purchase.giftId);
			return { ok: true } as const;
		}),

	listForGift: protectedProcedure
		.input(listGiftPurchasesSchema)
		.query(async ({ ctx, input }) => {
			const localUserId = await getLocalUserId(ctx);
			const purchases = await listOwnerGiftPurchases(asOwnerPurchaseDb(ctx), {
				localUserId,
				giftId: input.giftId,
			});
			return purchases.map(mapOwnerPurchaseRecord);
		}),

	createManual: protectedProcedure
		.input(createOwnerManualPurchaseSchema)
		.mutation(async ({ ctx, input }) => {
			const localUserId = await getLocalUserId(ctx);
			const purchase = await createOwnerManualPurchase(asOwnerPurchaseDb(ctx), {
				localUserId,
				...input,
			});
			await invalidateGiftWishlist(ctx, purchase.giftId);
			return mapOwnerPurchaseRecord(purchase);
		}),

	delete: protectedProcedure
		.input(deleteOwnerPurchaseSchema)
		.mutation(async ({ ctx, input }) => {
			const localUserId = await getLocalUserId(ctx);
			const purchase = await deleteOwnerPurchase(asOwnerPurchaseDb(ctx), {
				localUserId,
				purchaseId: input.purchaseId,
			});
			await invalidateGiftWishlist(ctx, purchase.giftId);
		}),
});
