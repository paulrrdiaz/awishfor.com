import { TRPCError } from "@trpc/server";
import { PublishReadinessError } from "@/lib/wishlist/publish-readiness";
import type { createTRPCContext } from "@/server/api/trpc";
import {
	createTRPCRouter,
	protectedProcedure,
	publicProcedure,
} from "@/server/api/trpc";
import { checkSlugAvailability } from "@/server/services/slug.service";
import {
	publishWishlist,
	publishWishlistFromWizard,
	saveWishlistDraft,
} from "@/server/services/wishlist.service";
import {
	checkSlugAvailabilitySchema,
	publishWishlistSchema,
} from "@/server/validators/wishlist.schema";
import { saveDraftWishlistSchema } from "@/server/validators/wishlist-save-draft.schema";

type WishlistRouterContext = Awaited<ReturnType<typeof createTRPCContext>> & {
	userId: string;
};

const getLocalUserId = async (ctx: WishlistRouterContext) => {
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

export const wishlistRouter = createTRPCRouter({
	checkSlugAvailability: publicProcedure
		.input(checkSlugAvailabilitySchema)
		.query(async ({ ctx, input }) => {
			return checkSlugAvailability(ctx.db, input);
		}),

	publish: protectedProcedure
		.input(publishWishlistSchema)
		.mutation(async ({ ctx, input }) => {
			const ownerId = await getLocalUserId(ctx);

			try {
				return await publishWishlist(ctx.db, {
					ownerId,
					...input,
				});
			} catch (error) {
				if (error instanceof PublishReadinessError) {
					throw new TRPCError({
						code: "PRECONDITION_FAILED",
						message: "Wishlist is not ready to publish",
						cause: error,
					});
				}
				throw error;
			}
		}),

	publishWizard: protectedProcedure
		.input(saveDraftWishlistSchema)
		.mutation(async ({ ctx, input }) => {
			const ownerId = await getLocalUserId(ctx);

			try {
				return await publishWishlistFromWizard(ctx.db, {
					ownerId,
					...input,
				});
			} catch (error) {
				if (error instanceof PublishReadinessError) {
					throw new TRPCError({
						code: "PRECONDITION_FAILED",
						message: "Wishlist is not ready to publish",
						cause: error,
					});
				}
				throw error;
			}
		}),

	saveDraft: protectedProcedure
		.input(saveDraftWishlistSchema)
		.mutation(async ({ ctx, input }) => {
			const ownerId = await getLocalUserId(ctx);

			return saveWishlistDraft(ctx.db, {
				ownerId,
				...input,
			});
		}),
});
