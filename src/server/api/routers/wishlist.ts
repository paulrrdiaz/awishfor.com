import { TRPCError } from "@trpc/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { GiftVisibilityStatus, type Prisma } from "@/generated/prisma/client";
import {
	evaluatePublishReadiness,
	PublishReadinessError,
} from "@/lib/wishlist/publish-readiness";
import {
	toCanonicalWishlistUrl,
	toWhatsAppShareUrl,
} from "@/lib/wishlist/share";
import type { createTRPCContext } from "@/server/api/trpc";
import {
	createTRPCRouter,
	protectedProcedure,
	publicProcedure,
} from "@/server/api/trpc";
import {
	mapDashboardWishlistOverview,
	mapDashboardWishlistSummary,
} from "@/server/mappers/dashboard-wishlist.mapper";
import {
	listOwnerWishlistRecentPurchases,
	type WishlistRecentPurchaseDatabase,
} from "@/server/services/purchase.service";
import { checkSlugAvailability } from "@/server/services/slug.service";
import {
	publishWishlist,
	publishWishlistFromWizard,
	saveWishlistDraft,
} from "@/server/services/wishlist.service";
import {
	checkSlugAvailabilitySchema,
	publishWishlistSchema,
	updateWishlistDesignSchema,
	wishlistIdSchema,
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

const wishlistWithGiftsInclude = {
	gifts: {
		include: {
			purchases: true,
		},
	},
} as const;

const wishlistDetailInclude = {
	categories: {
		orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
	},
	gifts: {
		orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
		include: {
			category: {
				select: {
					name: true,
				},
			},
			purchases: true,
		},
	},
} satisfies Prisma.WishlistInclude;

const asWishlistRecentPurchaseDb = (
	ctx: WishlistRouterContext,
): WishlistRecentPurchaseDatabase =>
	ctx.db as unknown as WishlistRecentPurchaseDatabase;

export const wishlistRouter = createTRPCRouter({
	list: protectedProcedure.query(async ({ ctx }) => {
		const ownerId = await getLocalUserId(ctx);
		return ctx.db.wishlist.findMany({
			where: { ownerId, status: { not: "archived" } },
			select: { id: true, title: true, status: true, eventType: true },
			orderBy: { createdAt: "desc" },
		});
	}),

	getById: protectedProcedure
		.input(z.object({ id: wishlistIdSchema }))
		.query(async ({ ctx, input }) => {
			const ownerId = await getLocalUserId(ctx);
			const wishlist = await ctx.db.wishlist.findFirst({
				where: { id: input.id, ownerId },
				include: wishlistDetailInclude,
			});

			if (!wishlist) {
				throw new TRPCError({ code: "NOT_FOUND" });
			}

			return {
				id: wishlist.id,
				slug: wishlist.slug,
				title: wishlist.title,
				eventType: wishlist.eventType,
				language: wishlist.language,
				currency: wishlist.currency,
				heroTitle: wishlist.heroTitle,
				welcomeMessage: wishlist.welcomeMessage,
				thankYouMessage: wishlist.thankYouMessage,
				displayName: wishlist.displayName,
				eventDate: wishlist.eventDate?.toISOString() ?? null,
				eventTime: wishlist.eventTime,
				eventLocation: wishlist.eventLocation,
				dressCode: wishlist.dressCode,
				coverImageUrl: wishlist.coverImageUrl,
				themeId: wishlist.themeId,
				layoutId: wishlist.layoutId,
				buttonStyle: wishlist.buttonStyle,
				fontPairing: wishlist.fontPairing,
				showHowItWorks: wishlist.showHowItWorks,
				status: wishlist.status,
				categories: wishlist.categories.map((category) => ({
					id: category.id,
					name: category.name,
					sortOrder: category.sortOrder,
				})),
				gifts: wishlist.gifts.map((gift) => ({
					id: gift.id,
					name: gift.name,
					productUrl: gift.productUrl,
					imageUrl: gift.imageUrl,
					priceAmount: gift.priceAmount?.toString() ?? null,
					category: gift.category?.name ?? null,
					quantityNeeded: gift.quantityNeeded,
					priority: gift.priority,
					publicNote: gift.publicNote,
					internalNote: gift.internalNote,
					hidden:
						gift.deletedAt !== null ||
						gift.visibilityStatus === GiftVisibilityStatus.hidden,
					sortOrder: gift.sortOrder,
				})),
				publishedAt: wishlist.publishedAt?.toISOString() ?? null,
				archivedAt: wishlist.archivedAt?.toISOString() ?? null,
				createdAt: wishlist.createdAt.toISOString(),
				updatedAt: wishlist.updatedAt.toISOString(),
			};
		}),

	summaryList: protectedProcedure.query(async ({ ctx }) => {
		const ownerId = await getLocalUserId(ctx);
		const wishlists = await ctx.db.wishlist.findMany({
			where: { ownerId },
			include: wishlistWithGiftsInclude,
			orderBy: { createdAt: "desc" },
		});

		return wishlists.map(mapDashboardWishlistSummary);
	}),

	overview: protectedProcedure
		.input(z.object({ wishlistId: wishlistIdSchema }))
		.query(async ({ ctx, input }) => {
			const ownerId = await getLocalUserId(ctx);
			const wishlist = await ctx.db.wishlist.findFirst({
				where: { id: input.wishlistId, ownerId },
				include: wishlistWithGiftsInclude,
			});

			if (!wishlist) {
				throw new TRPCError({ code: "NOT_FOUND" });
			}

			const visibleGiftCount = wishlist.gifts.filter(
				(gift) => gift.deletedAt === null && gift.visibilityStatus !== "hidden",
			).length;
			const readiness = evaluatePublishReadiness({
				title: wishlist.title,
				eventType: wishlist.eventType,
				slug: wishlist.slug,
				language: wishlist.language,
				currency: wishlist.currency,
				visibleGiftCount,
			});
			const publicUrlPath = `/w/${wishlist.slug}`;
			const publicUrl = toCanonicalWishlistUrl(publicUrlPath);
			const recentPurchases = await listOwnerWishlistRecentPurchases(
				asWishlistRecentPurchaseDb(ctx),
				{
					ownerId,
					wishlistId: input.wishlistId,
				},
			);

			return mapDashboardWishlistOverview(wishlist, {
				publicUrlPath,
				publicUrl,
				whatsAppUrl: toWhatsAppShareUrl(publicUrl, wishlist.eventType),
				readiness,
				recentPurchases,
			});
		}),

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

	updateDesign: protectedProcedure
		.input(updateWishlistDesignSchema)
		.mutation(async ({ ctx, input }) => {
			const ownerId = await getLocalUserId(ctx);
			const wishlist = await ctx.db.wishlist.findFirst({
				where: {
					id: input.id,
					ownerId,
				},
				select: {
					id: true,
					slug: true,
				},
			});

			if (!wishlist) {
				throw new TRPCError({ code: "NOT_FOUND" });
			}

			const updated = await ctx.db.wishlist.update({
				where: {
					id: wishlist.id,
				},
				data: {
					themeId: input.themeId ?? null,
					layoutId: input.layoutId ?? null,
					fontPairing: input.fontPairing ?? null,
					buttonStyle: input.buttonStyle ?? null,
					coverImageUrl: input.coverImageUrl ?? null,
				},
				select: {
					id: true,
					slug: true,
					themeId: true,
					layoutId: true,
					fontPairing: true,
					buttonStyle: true,
					coverImageUrl: true,
					updatedAt: true,
				},
			});

			revalidatePath(`/w/${updated.slug}`);

			return {
				...updated,
				updatedAt: updated.updatedAt.toISOString(),
			};
		}),
});
