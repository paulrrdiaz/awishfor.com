import type { createTRPCContext } from "@/server/api/trpc";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import {
	addCategory,
	deleteCategory,
	getUncategorizedGiftCount,
	listCategories,
	renameCategory,
	reorderCategories,
	seedDefaultCategories,
} from "@/server/services/category.service";
import { getOrCreateLocalUserId } from "@/server/services/local-user.service";
import {
	invalidatePublicWishlistById,
	type PublicWishlistInvalidationDatabase,
} from "@/server/services/public-wishlist-cache";
import {
	addCategorySchema,
	deleteCategorySchema,
	listCategoriesSchema,
	renameCategorySchema,
	reorderCategoriesSchema,
	seedDefaultCategoriesSchema,
	uncategorizedCountSchema,
} from "@/server/validators/category.schema";

type CategoryRouterContext = Awaited<ReturnType<typeof createTRPCContext>> & {
	userId: string;
};

const getLocalUserId = (ctx: CategoryRouterContext) =>
	getOrCreateLocalUserId(ctx);

const invalidateWishlist = (ctx: CategoryRouterContext, wishlistId: string) =>
	invalidatePublicWishlistById(
		ctx.db as unknown as PublicWishlistInvalidationDatabase,
		wishlistId,
	);

export const categoryRouter = createTRPCRouter({
	list: protectedProcedure
		.input(listCategoriesSchema)
		.query(async ({ ctx, input }) => {
			const ownerId = await getLocalUserId(ctx);
			return listCategories(ctx.db, { ownerId, ...input });
		}),
	uncategorizedCount: protectedProcedure
		.input(uncategorizedCountSchema)
		.query(async ({ ctx, input }) => {
			const ownerId = await getLocalUserId(ctx);
			return getUncategorizedGiftCount(ctx.db, { ownerId, ...input });
		}),
	add: protectedProcedure
		.input(addCategorySchema)
		.mutation(async ({ ctx, input }) => {
			const ownerId = await getLocalUserId(ctx);
			const category = await addCategory(ctx.db, { ownerId, ...input });
			await invalidateWishlist(ctx, category.wishlistId);
			return category;
		}),
	rename: protectedProcedure
		.input(renameCategorySchema)
		.mutation(async ({ ctx, input }) => {
			const ownerId = await getLocalUserId(ctx);
			const category = await renameCategory(ctx.db, { ownerId, ...input });
			await invalidateWishlist(ctx, category.wishlistId);
			return category;
		}),
	delete: protectedProcedure
		.input(deleteCategorySchema)
		.mutation(async ({ ctx, input }) => {
			const ownerId = await getLocalUserId(ctx);
			const category = await deleteCategory(ctx.db, { ownerId, ...input });
			await invalidateWishlist(ctx, category.wishlistId);
			return category;
		}),
	reorder: protectedProcedure
		.input(reorderCategoriesSchema)
		.mutation(async ({ ctx, input }) => {
			const ownerId = await getLocalUserId(ctx);
			const categories = await reorderCategories(ctx.db, { ownerId, ...input });
			await invalidateWishlist(ctx, input.wishlistId);
			return categories;
		}),
	seedDefaults: protectedProcedure
		.input(seedDefaultCategoriesSchema)
		.mutation(async ({ ctx, input }) => {
			const ownerId = await getLocalUserId(ctx);
			const categories = await seedDefaultCategories(ctx.db, {
				ownerId,
				...input,
			});
			await invalidateWishlist(ctx, input.wishlistId);
			return categories;
		}),
});
