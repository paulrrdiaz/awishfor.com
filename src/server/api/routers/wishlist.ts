import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { checkSlugAvailability } from "@/server/services/slug.service";
import { checkSlugAvailabilitySchema } from "@/server/validators/wishlist.schema";

export const wishlistRouter = createTRPCRouter({
	checkSlugAvailability: protectedProcedure
		.input(checkSlugAvailabilitySchema)
		.query(async ({ ctx, input }) => {
			return checkSlugAvailability(ctx.db, input);
		}),
});
