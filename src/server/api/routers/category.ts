import { TRPCError } from "@trpc/server";
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

const getLocalUserId = async (ctx: CategoryRouterContext) => {
	const user = await ctx.db.user.findUnique({
		where: {
			clerkId: ctx.userId,
		},
		select: {
			id: true,
		},
	});

	if (!user) {
		throw new TRPCError({ code: "UNAUTHORIZED" });
	}

	return user.id;
};

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
			return addCategory(ctx.db, { ownerId, ...input });
		}),
	rename: protectedProcedure
		.input(renameCategorySchema)
		.mutation(async ({ ctx, input }) => {
			const ownerId = await getLocalUserId(ctx);
			return renameCategory(ctx.db, { ownerId, ...input });
		}),
	delete: protectedProcedure
		.input(deleteCategorySchema)
		.mutation(async ({ ctx, input }) => {
			const ownerId = await getLocalUserId(ctx);
			return deleteCategory(ctx.db, { ownerId, ...input });
		}),
	reorder: protectedProcedure
		.input(reorderCategoriesSchema)
		.mutation(async ({ ctx, input }) => {
			const ownerId = await getLocalUserId(ctx);
			return reorderCategories(ctx.db, { ownerId, ...input });
		}),
	seedDefaults: protectedProcedure
		.input(seedDefaultCategoriesSchema)
		.mutation(async ({ ctx, input }) => {
			const ownerId = await getLocalUserId(ctx);
			return seedDefaultCategories(ctx.db, { ownerId, ...input });
		}),
});
