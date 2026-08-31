import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { resolveMotif } from "@/config/motifs";
import {
	GiftVisibilityStatus,
	type Prisma,
	WishlistStatus,
} from "@/generated/prisma/client";
import { buildCoverImageRecords } from "@/lib/wishlist/cover-images";
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
import { assertWishlistAccess } from "@/server/services/collaboration.service";
import { persistDraftGiftImages } from "@/server/services/imported-image.service";
import { getOrCreateLocalUserId } from "@/server/services/local-user.service";
import { invalidatePublicWishlist } from "@/server/services/public-wishlist-cache";
import {
	listWishlistRecentPurchases,
	type WishlistRecentPurchaseDatabase,
} from "@/server/services/purchase.service";
import { checkSlugAvailability } from "@/server/services/slug.service";
import {
	archiveWishlist,
	publishWishlist,
	publishWishlistFromWizard,
	resolveWelcomeMessage,
	restoreWishlist,
	saveWishlistDraft,
} from "@/server/services/wishlist.service";
import {
	getWishlistViewAnalytics,
	type WishlistViewAnalyticsDatabase,
} from "@/server/services/wishlist-view-analytics.service";
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
	images: {
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

const asWishlistViewAnalyticsDb = (
	ctx: WishlistRouterContext,
): Pick<WishlistViewAnalyticsDatabase, "wishlistView"> =>
	ctx.db as unknown as Pick<WishlistViewAnalyticsDatabase, "wishlistView">;

export const wishlistRouter = createTRPCRouter({
	list: protectedProcedure.query(async ({ ctx }) => {
		const localUserId = await getLocalUserId(ctx);
		const sidebarSelect = {
			id: true,
			title: true,
			status: true,
			eventType: true,
		} satisfies Prisma.WishlistSelect;

		const [owned, shared] = await Promise.all([
			ctx.db.wishlist.findMany({
				where: { ownerId: localUserId, status: { not: "archived" } },
				select: sidebarSelect,
				orderBy: { createdAt: "desc" },
			}),
			ctx.db.wishlist.findMany({
				where: {
					status: { not: "archived" },
					members: { some: { userId: localUserId } },
				},
				select: {
					...sidebarSelect,
					owner: { select: { name: true, email: true } },
				},
				orderBy: { createdAt: "desc" },
			}),
		]);

		return {
			owned,
			shared: shared.map(({ owner, ...wishlist }) => ({
				...wishlist,
				ownerName: owner.name ?? owner.email,
			})),
		};
	}),

	getById: protectedProcedure
		.input(z.object({ id: wishlistIdSchema }))
		.query(async ({ ctx, input }) => {
			const localUserId = await getLocalUserId(ctx);
			const { isOwner } = await assertWishlistAccess(ctx.db, {
				localUserId,
				wishlistId: input.id,
			});
			const wishlist = await ctx.db.wishlist.findFirst({
				where: { id: input.id },
				include: wishlistDetailInclude,
			});

			if (!wishlist) {
				throw new TRPCError({ code: "NOT_FOUND" });
			}

			return {
				id: wishlist.id,
				isOwner,
				slug: wishlist.slug,
				title: wishlist.title,
				subtitle: wishlist.subtitle,
				eventType: wishlist.eventType,
				language: wishlist.language,
				currency: wishlist.currency,
				welcomeMessage: wishlist.welcomeMessage,
				welcomeMessageAttribution: wishlist.welcomeMessageAttribution,
				thankYouMessage: wishlist.thankYouMessage,
				giftListMessage: wishlist.giftListMessage,
				eventDate: wishlist.eventDate?.toISOString() ?? null,
				eventTime: wishlist.eventTime,
				endTime: wishlist.endTime,
				rsvpDeadline: wishlist.rsvpDeadline?.toISOString() ?? null,
				eventLocation: wishlist.eventLocation,
				dressCode: wishlist.dressCode,
				deliveryRecipientName: wishlist.deliveryRecipientName,
				deliveryDocumentId: wishlist.deliveryDocumentId,
				deliveryAddress: wishlist.deliveryAddress,
				deliveryPhone: wishlist.deliveryPhone,
				images: wishlist.images.map((image) => ({
					url: image.url,
					width: image.width,
					height: image.height,
					orientation: image.orientation,
				})),
				themeId: wishlist.themeId,
				layoutId: wishlist.layoutId,
				buttonStyle: wishlist.buttonStyle,
				headingFont: wishlist.headingFont,
				bodyFont: wishlist.bodyFont,
				countdownVariant: wishlist.countdownVariant,
				welcomeMessageVariant: wishlist.welcomeMessageVariant,
				thankYouMessageVariant: wishlist.thankYouMessageVariant,
				motifId: wishlist.motifId,
				motifTreatment: wishlist.motifTreatment,
				motifPalette: wishlist.motifPalette,
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
		const localUserId = await getLocalUserId(ctx);
		const [owned, shared] = await Promise.all([
			ctx.db.wishlist.findMany({
				where: {
					ownerId: localUserId,
					status: { not: WishlistStatus.archived },
				},
				include: wishlistWithGiftsInclude,
				orderBy: { createdAt: "desc" },
			}),
			ctx.db.wishlist.findMany({
				where: {
					status: { not: WishlistStatus.archived },
					members: { some: { userId: localUserId } },
				},
				include: {
					...wishlistWithGiftsInclude,
					owner: { select: { name: true, email: true } },
				},
				orderBy: { createdAt: "desc" },
			}),
		]);

		return {
			owned: owned.map(mapDashboardWishlistSummary),
			shared: shared.map((wishlist) => ({
				...mapDashboardWishlistSummary(wishlist),
				ownerName: wishlist.owner.name ?? wishlist.owner.email,
			})),
		};
	}),

	overview: protectedProcedure
		.input(z.object({ wishlistId: wishlistIdSchema }))
		.query(async ({ ctx, input }) => {
			const localUserId = await getLocalUserId(ctx);
			const { isOwner } = await assertWishlistAccess(ctx.db, {
				localUserId,
				wishlistId: input.wishlistId,
			});
			const wishlist = await ctx.db.wishlist.findFirst({
				where: { id: input.wishlistId },
				include: wishlistWithGiftsInclude,
			});

			if (!wishlist) {
				throw new TRPCError({ code: "NOT_FOUND" });
			}

			const visibleGiftCount = wishlist.gifts.filter(
				(gift) => gift.deletedAt === null && gift.visibilityStatus !== "hidden",
			).length;
			const imageCount = await ctx.db.wishlistImage.count({
				where: { wishlistId: input.wishlistId },
			});
			const readiness = evaluatePublishReadiness({
				title: wishlist.title,
				eventType: wishlist.eventType,
				slug: wishlist.slug,
				language: wishlist.language,
				currency: wishlist.currency,
				visibleGiftCount,
				layoutId: wishlist.layoutId,
				imageCount,
			});
			const publicUrlPath = `/w/${wishlist.slug}`;
			const publicUrl = toCanonicalWishlistUrl(publicUrlPath);
			const [recentPurchases, pendingInvitations, analytics] =
				await Promise.all([
					listWishlistRecentPurchases(asWishlistRecentPurchaseDb(ctx), {
						wishlistId: input.wishlistId,
					}),
					ctx.db.invite.count({
						where: { wishlistId: input.wishlistId, status: "pending" },
					}),
					isOwner
						? getWishlistViewAnalytics(
								asWishlistViewAnalyticsDb(ctx),
								input.wishlistId,
							)
						: Promise.resolve(undefined),
				]);

			return mapDashboardWishlistOverview(wishlist, {
				isOwner,
				publicUrlPath,
				publicUrl,
				whatsAppUrl: toWhatsAppShareUrl(publicUrl, wishlist.eventType),
				readiness,
				recentPurchases,
				pendingInvitations,
				analytics,
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
			const localUserId = await getLocalUserId(ctx);

			try {
				const published = await publishWishlist(ctx.db, {
					localUserId,
					...input,
				});
				invalidatePublicWishlist({
					wishlistId: published.id,
					slug: published.slug,
				});
				return published;
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
			const localUserId = await getLocalUserId(ctx);
			const gifts = await persistDraftGiftImages(input.gifts);

			try {
				const published = await publishWishlistFromWizard(ctx.db, {
					localUserId,
					...input,
					gifts,
				});
				if (published.status === "published") {
					invalidatePublicWishlist({
						wishlistId: published.wishlistId,
						slug: published.slug,
					});
				}
				return published;
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
			const localUserId = await getLocalUserId(ctx);
			const gifts = await persistDraftGiftImages(input.gifts);

			return saveWishlistDraft(ctx.db, {
				localUserId,
				...input,
				gifts,
			});
		}),

	updateDesign: protectedProcedure
		.input(updateWishlistDesignSchema)
		.mutation(async ({ ctx, input }) => {
			const localUserId = await getLocalUserId(ctx);
			await assertWishlistAccess(ctx.db, {
				localUserId,
				wishlistId: input.id,
			});
			const wishlist = await ctx.db.wishlist.findFirst({
				where: { id: input.id },
				select: {
					id: true,
					slug: true,
				},
			});

			if (!wishlist) {
				throw new TRPCError({ code: "NOT_FOUND" });
			}

			const updated = await ctx.db.$transaction(async (tx) => {
				await tx.wishlistImage.deleteMany({
					where: { wishlistId: wishlist.id },
				});

				if (input.coverImages.length > 0) {
					await tx.wishlistImage.createMany({
						data: buildCoverImageRecords(input.coverImages).map((image) => ({
							wishlistId: wishlist.id,
							...image,
						})),
					});
				}

				return tx.wishlist.update({
					where: {
						id: wishlist.id,
					},
					data: {
						themeId: input.themeId ?? null,
						layoutId: input.layoutId ?? null,
						headingFont: input.headingFont ?? null,
						bodyFont: input.bodyFont ?? null,
						buttonStyle: input.buttonStyle ?? null,
					},
					select: {
						id: true,
						slug: true,
						themeId: true,
						layoutId: true,
						headingFont: true,
						bodyFont: true,
						buttonStyle: true,
						updatedAt: true,
						images: {
							orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
						},
					},
				});
			});

			invalidatePublicWishlist({ wishlistId: updated.id, slug: updated.slug });

			return {
				...updated,
				images: updated.images.map((image) => ({
					url: image.url,
					width: image.width,
					height: image.height,
					orientation: image.orientation,
				})),
				updatedAt: updated.updatedAt.toISOString(),
			};
		}),

	updateSettings: protectedProcedure
		.input(updateWishlistSettingsSchema)
		.mutation(async ({ ctx, input }) => {
			const localUserId = await getLocalUserId(ctx);
			await assertWishlistAccess(ctx.db, {
				localUserId,
				wishlistId: input.id,
			});
			const existing = await ctx.db.wishlist.findFirst({
				where: { id: input.id },
				select: { id: true, slug: true, eventType: true },
			});

			if (!existing) {
				throw new TRPCError({ code: "NOT_FOUND" });
			}

			if (input.motifId) {
				const motif = resolveMotif(input.motifId);
				if (!motif?.eventTypes.includes(existing.eventType)) {
					throw new TRPCError({
						code: "BAD_REQUEST",
						message:
							"El motivo elegido no está disponible para este tipo de evento",
					});
				}
			}

			let updated: { id: string; slug: string; updatedAt: Date };
			try {
				updated = await ctx.db.wishlist.update({
					where: { id: existing.id },
					data: {
						title: input.title,
						subtitle: input.subtitle ?? null,
						slug: input.slug,
						eventDate: input.eventDate ?? null,
						eventTime: input.eventTime ?? null,
						endTime: input.endTime ?? null,
						rsvpDeadline: input.rsvpDeadline ?? null,
						eventLocation: input.eventLocation ?? null,
						dressCode: input.dressCode ?? null,
						welcomeMessage: resolveWelcomeMessage(
							existing.eventType,
							input.welcomeMessage,
						),
						welcomeMessageAttribution: input.welcomeMessageAttribution ?? null,
						deliveryRecipientName: input.deliveryRecipientName ?? null,
						deliveryDocumentId: input.deliveryDocumentId ?? null,
						deliveryAddress: input.deliveryAddress ?? null,
						deliveryPhone: input.deliveryPhone ?? null,
						thankYouMessage: input.thankYouMessage ?? null,
						giftListMessage: input.giftListMessage ?? null,
						countdownVariant: input.countdownVariant ?? null,
						welcomeMessageVariant: input.welcomeMessageVariant ?? null,
						thankYouMessageVariant: input.thankYouMessageVariant ?? null,
						motifId: input.motifId ?? null,
						motifTreatment: input.motifId
							? (input.motifTreatment ?? null)
							: null,
						motifPalette: input.motifId ? (input.motifPalette ?? null) : null,
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

			invalidatePublicWishlist({
				wishlistId: updated.id,
				slug: updated.slug,
				previousSlug: existing.slug,
			});

			return { ...updated, updatedAt: updated.updatedAt.toISOString() };
		}),

	archive: protectedProcedure
		.input(z.object({ id: wishlistIdSchema }))
		.mutation(async ({ ctx, input }) => {
			const localUserId = await getLocalUserId(ctx);

			const archived = await archiveWishlist(ctx.db, {
				wishlistId: input.id,
				localUserId,
			});
			invalidatePublicWishlist({
				wishlistId: archived.id,
				slug: archived.slug,
			});
		}),

	restore: protectedProcedure
		.input(
			z.object({
				id: wishlistIdSchema,
				targetStatus: wishlistRestoreTargetStatusSchema,
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const localUserId = await getLocalUserId(ctx);

			const restored = await restoreWishlist(ctx.db, {
				wishlistId: input.id,
				localUserId,
				targetStatus: input.targetStatus,
			});
			invalidatePublicWishlist({
				wishlistId: restored.id,
				slug: restored.slug,
			});
		}),
});
