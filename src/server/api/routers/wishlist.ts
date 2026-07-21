import { TRPCError } from "@trpc/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
	GiftVisibilityStatus,
	type Prisma,
	WishlistStatus,
} from "@/generated/prisma/client";
import { withCoverImageUrlMirror } from "@/lib/wishlist/cover-images";
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
import { getOrCreateLocalUserId } from "@/server/services/local-user.service";
import {
	listOwnerWishlistRecentPurchases,
	type WishlistRecentPurchaseDatabase,
} from "@/server/services/purchase.service";
import { checkSlugAvailability } from "@/server/services/slug.service";
import {
	archiveWishlist,
	publishWishlist,
	publishWishlistFromWizard,
	restoreWishlist,
	saveWishlistDraft,
} from "@/server/services/wishlist.service";
import {
	checkSlugAvailabilitySchema,
	publishWishlistSchema,
	updateWishlistDesignSchema,
	updateWishlistSettingsSchema,
	wishlistIdSchema,
	wishlistRestoreTargetStatusSchema,
} from "@/server/validators/wishlist.schema";
import { saveDraftWishlistSchema } from "@/server/validators/wishlist-save-draft.schema";

type WishlistRouterContext = Awaited<ReturnType<typeof createTRPCContext>> & {
	userId: string;
};

const getLocalUserId = (ctx: WishlistRouterContext) =>
	getOrCreateLocalUserId(ctx);

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
				coverImageUrls: wishlist.coverImageUrls,
				themeId: wishlist.themeId,
				layoutId: wishlist.layoutId,
				buttonStyle: wishlist.buttonStyle,
				fontPairing: wishlist.fontPairing,
				headingFont: wishlist.headingFont,
				bodyFont: wishlist.bodyFont,
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
			where: { ownerId, status: { not: WishlistStatus.archived } },
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
					headingFont: input.headingFont ?? null,
					bodyFont: input.bodyFont ?? null,
					buttonStyle: input.buttonStyle ?? null,
					...withCoverImageUrlMirror({ coverImageUrls: input.coverImageUrls }),
				},
				select: {
					id: true,
					slug: true,
					themeId: true,
					layoutId: true,
					fontPairing: true,
					headingFont: true,
					bodyFont: true,
					buttonStyle: true,
					coverImageUrl: true,
					coverImageUrls: true,
					updatedAt: true,
				},
			});

			revalidatePath(`/w/${updated.slug}`);

			return {
				...updated,
				updatedAt: updated.updatedAt.toISOString(),
			};
		}),

	updateSettings: protectedProcedure
		.input(updateWishlistSettingsSchema)
		.mutation(async ({ ctx, input }) => {
			const ownerId = await getLocalUserId(ctx);
			const existing = await ctx.db.wishlist.findFirst({
				where: { id: input.id, ownerId },
				select: { id: true, slug: true },
			});

			if (!existing) {
				throw new TRPCError({ code: "NOT_FOUND" });
			}

			let updated: { id: string; slug: string; updatedAt: Date };
			try {
				updated = await ctx.db.wishlist.update({
					where: { id: existing.id },
					data: {
						title: input.title,
						slug: input.slug,
						displayName: input.displayName ?? null,
						eventDate: input.eventDate ?? null,
						eventTime: input.eventTime ?? null,
						eventLocation: input.eventLocation ?? null,
						dressCode: input.dressCode ?? null,
						heroTitle: input.heroTitle ?? null,
						welcomeMessage: input.welcomeMessage ?? null,
						thankYouMessage: input.thankYouMessage ?? null,
						language: input.language,
						currency: input.currency,
						showHowItWorks: input.showHowItWorks,
					},
					select: { id: true, slug: true, updatedAt: true },
				});
			} catch (error) {
				if (
					typeof error === "object" &&
					error !== null &&
					"code" in error &&
					error.code === "P2002"
				) {
					throw new TRPCError({
						code: "CONFLICT",
						message: "Ese slug ya está en uso por otra lista",
					});
				}
				throw error;
			}

			revalidatePath(`/w/${updated.slug}`);
			if (existing.slug !== updated.slug) {
				revalidatePath(`/w/${existing.slug}`);
			}

			return { ...updated, updatedAt: updated.updatedAt.toISOString() };
		}),

	archive: protectedProcedure
		.input(z.object({ id: wishlistIdSchema }))
		.mutation(async ({ ctx, input }) => {
			const ownerId = await getLocalUserId(ctx);
			const existing = await ctx.db.wishlist.findFirst({
				where: { id: input.id, ownerId },
				select: { id: true, slug: true },
			});

			if (!existing) {
				throw new TRPCError({ code: "NOT_FOUND" });
			}

			await archiveWishlist(ctx.db, { wishlistId: existing.id, ownerId });
			revalidatePath(`/w/${existing.slug}`);
		}),

	restore: protectedProcedure
		.input(
			z.object({
				id: wishlistIdSchema,
				targetStatus: wishlistRestoreTargetStatusSchema,
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const ownerId = await getLocalUserId(ctx);
			const existing = await ctx.db.wishlist.findFirst({
				where: { id: input.id, ownerId },
				select: { id: true, slug: true },
			});

			if (!existing) {
				throw new TRPCError({ code: "NOT_FOUND" });
			}

			await restoreWishlist(ctx.db, {
				wishlistId: existing.id,
				ownerId,
				targetStatus: input.targetStatus,
			});
			revalidatePath(`/w/${existing.slug}`);
		}),
});
