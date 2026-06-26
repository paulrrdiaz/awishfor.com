import { TRPCError } from "@trpc/server";
import { PublishReadinessError } from "@/lib/wishlist/publish-readiness";
import {
	createTRPCRouter,
	protectedProcedure,
	publicProcedure,
} from "@/server/api/trpc";
import { checkSlugAvailability } from "@/server/services/slug.service";
import { publishWishlist } from "@/server/services/wishlist.service";
import {
	checkSlugAvailabilitySchema,
	publishWishlistSchema,
} from "@/server/validators/wishlist.schema";

export const wishlistRouter = createTRPCRouter({
	checkSlugAvailability: publicProcedure
		.input(checkSlugAvailabilitySchema)
		.query(async ({ ctx, input }) => {
			return checkSlugAvailability(ctx.db, input);
		}),

	publish: protectedProcedure
		.input(publishWishlistSchema)
		.mutation(async ({ ctx, input }) => {
			try {
				return await publishWishlist(ctx.db, input);
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
});
