import { TRPCError } from "@trpc/server";
import type { Category, Prisma, Wishlist } from "@/generated/prisma/client";
import {
	Currency,
	GiftVisibilityStatus,
	Locale,
	WishlistStatus,
} from "@/generated/prisma/client";
import {
	evaluatePublishReadiness,
	PublishReadinessError,
} from "@/lib/wishlist/publish-readiness";
import type {
	CreateWishlistInput,
	WishlistRestoreTargetStatus,
} from "@/server/validators/wishlist.schema";
import type {
	SaveDraftDraftContent,
	SaveDraftGiftInput,
	SaveDraftServerDraft,
	SaveDraftWishlistInput,
} from "@/server/validators/wishlist-save-draft.schema";

type WishlistRecordLookup = Pick<
	Wishlist,
	"publishedAt" | "title" | "eventType" | "slug" | "language" | "currency"
>;
type WishlistPublishedAtLookup = Pick<Wishlist, "publishedAt">;

type DraftWishlistRecord = Prisma.WishlistGetPayload<{
	include: {
		categories: true;
		gifts: {
			include: {
				category: {
					select: {
						name: true;
					};
				};
			};
		};
	};
}>;

type WishlistDelegate = {
	create(args: Prisma.WishlistCreateArgs): Promise<Wishlist>;
	findFirst(
		args: Prisma.WishlistFindFirstArgs,
	): Promise<DraftWishlistRecord | Wishlist | null>;
	findUniqueOrThrow(
		args: Prisma.WishlistFindUniqueOrThrowArgs,
	): Promise<WishlistRecordLookup | WishlistPublishedAtLookup>;
	update(args: Prisma.WishlistUpdateArgs): Promise<Wishlist>;
	updateMany(args: Prisma.WishlistUpdateManyArgs): Promise<Prisma.BatchPayload>;
};

type CategoryDelegate = {
	create(args: Prisma.CategoryCreateArgs): Promise<Category>;
	deleteMany(args: Prisma.CategoryDeleteManyArgs): Promise<Prisma.BatchPayload>;
};

type GiftDelegate = {
	count(args: Prisma.GiftCountArgs): Promise<number>;
	createMany(args: Prisma.GiftCreateManyArgs): Promise<Prisma.BatchPayload>;
	deleteMany(args: Prisma.GiftDeleteManyArgs): Promise<Prisma.BatchPayload>;
};

type WishlistTransaction = {
	wishlist: WishlistDelegate;
	category: CategoryDelegate;
	gift: GiftDelegate;
};

export type WishlistDatabase = WishlistTransaction & {
	$transaction<T>(
		callback: (tx: WishlistTransaction) => Promise<T>,
	): Promise<T>;
};

export type SaveDraftResult =
	| {
			status: "saved";
			wishlistId: string;
			lastSavedAt: number;
	  }
	| {
			status: "conflict";
			serverDraft: SaveDraftServerDraft;
	  };

export type PublishedWishlistShareMetadata = {
	wishlistId: string;
	slug: string;
	publicUrlPath: string;
	dashboardUrlPath: string;
};

export type WizardPublishResult =
	| ({
			status: "published";
	  } & PublishedWishlistShareMetadata)
	| {
			status: "conflict";
			serverDraft: SaveDraftServerDraft;
	  };

const draftCategoryOrderBy = [
	{ sortOrder: "asc" },
	{ createdAt: "asc" },
] satisfies Prisma.CategoryOrderByWithRelationInput[];

const draftGiftOrderBy = [
	{ sortOrder: "asc" },
	{ createdAt: "asc" },
] satisfies Prisma.GiftOrderByWithRelationInput[];

const draftWishlistInclude = {
	categories: {
		orderBy: draftCategoryOrderBy,
	},
	gifts: {
		orderBy: draftGiftOrderBy,
		include: {
			category: {
				select: {
					name: true,
				},
			},
		},
	},
} satisfies Prisma.WishlistInclude;

const toDraftDate = (eventDate: string | null | undefined) =>
	eventDate ? new Date(`${eventDate}T00:00:00.000Z`) : null;

const sortDraftGifts = (gifts: SaveDraftGiftInput[]) =>
	[...gifts]
		.map((gift, index) => ({ gift, index }))
		.sort((a, b) => a.gift.sortOrder - b.gift.sortOrder || a.index - b.index)
		.map(({ gift }) => gift);

const wishlistDraftToData = (input: SaveDraftDraftContent) => ({
	title: input.title,
	slug: input.slug,
	eventType: input.eventType,
	language: input.language ?? Locale.es,
	currency: input.currency ?? Currency.PEN,
	heroTitle: input.heroTitle ?? null,
	welcomeMessage: input.welcomeMessage ?? null,
	thankYouMessage: input.thankYouMessage ?? null,
	displayName: input.displayName ?? null,
	eventDate: toDraftDate(input.eventDate ?? null),
	eventTime: input.eventTime ?? null,
	eventLocation: input.eventLocation ?? null,
	dressCode: input.dressCode ?? null,
	coverImageUrl: input.coverImageUrl ?? null,
	themeId: input.themeId ?? null,
	layoutId: input.layoutId ?? null,
	buttonStyle: input.buttonStyle ?? null,
	fontPairing: input.fontPairing ?? null,
	showHowItWorks: input.showHowItWorks ?? true,
});

const mapServerDraft = (
	wishlist: DraftWishlistRecord,
): SaveDraftServerDraft => ({
	title: wishlist.title,
	slug: wishlist.slug,
	eventType: wishlist.eventType,
	language: wishlist.language,
	currency: wishlist.currency,
	heroTitle: wishlist.heroTitle,
	welcomeMessage: wishlist.welcomeMessage,
	thankYouMessage: wishlist.thankYouMessage,
	displayName: wishlist.displayName,
	eventDate: wishlist.eventDate?.toISOString().slice(0, 10) ?? null,
	eventTime: wishlist.eventTime,
	eventLocation: wishlist.eventLocation,
	dressCode: wishlist.dressCode,
	coverImageUrl: wishlist.coverImageUrl,
	themeId: wishlist.themeId,
	layoutId: wishlist.layoutId,
	buttonStyle: wishlist.buttonStyle,
	fontPairing: wishlist.fontPairing,
	showHowItWorks: wishlist.showHowItWorks,
	categories: wishlist.categories.map((category) => category.name),
	gifts: wishlist.gifts.map((gift) => ({
		name: gift.name,
		productUrl: gift.productUrl,
		imageUrl: gift.imageUrl,
		priceAmount: gift.priceAmount ? Number(gift.priceAmount) : null,
		category: gift.category?.name ?? null,
		quantityNeeded: gift.quantityNeeded,
		priority: gift.priority,
		publicNote: gift.publicNote,
		internalNote: gift.internalNote,
		hidden: gift.visibilityStatus === GiftVisibilityStatus.hidden,
		sortOrder: gift.sortOrder,
	})),
	savedWishlistId: wishlist.id,
	lastSavedAt: wishlist.updatedAt.getTime(),
});

const getOwnedDraftWithRelations = async (
	db: WishlistTransaction,
	{ ownerId, wishlistId }: { ownerId: number; wishlistId: string },
) => {
	const wishlist = await db.wishlist.findFirst({
		where: {
			id: wishlistId,
			ownerId,
			status: WishlistStatus.draft,
		},
		include: draftWishlistInclude,
	});

	if (!wishlist) {
		throw new TRPCError({
			code: "NOT_FOUND",
			message: "Draft wishlist not found",
		});
	}

	return wishlist as DraftWishlistRecord;
};

const replaceDraftCollections = async (
	db: WishlistTransaction,
	{
		wishlistId,
		categories,
		gifts,
		currency,
	}: {
		wishlistId: string;
		categories: SaveDraftWishlistInput["categories"];
		gifts: SaveDraftGiftInput[];
		currency: Currency;
	},
) => {
	await db.gift.deleteMany({
		where: {
			wishlistId,
		},
	});

	await db.category.deleteMany({
		where: {
			wishlistId,
		},
	});

	const categoryIdByName = new Map<string, string>();

	for (const [index, categoryName] of categories.entries()) {
		const category = await db.category.create({
			data: {
				wishlist: {
					connect: {
						id: wishlistId,
					},
				},
				name: categoryName,
				sortOrder: index,
			},
		});

		categoryIdByName.set(category.name.trim().toLocaleLowerCase(), category.id);
	}

	if (gifts.length === 0) {
		return;
	}

	await db.gift.createMany({
		data: gifts.map((gift, index) => ({
			wishlistId,
			categoryId:
				gift.category === null || gift.category === undefined
					? null
					: (categoryIdByName.get(gift.category.trim().toLocaleLowerCase()) ??
						null),
			name: gift.name,
			productUrl: gift.productUrl ?? null,
			imageUrl: gift.imageUrl ?? null,
			storeName: null,
			priceAmount: gift.priceAmount ?? null,
			priceCurrency: gift.priceAmount === null ? null : currency,
			quantityNeeded: gift.quantityNeeded,
			priority: gift.priority,
			visibilityStatus: gift.hidden
				? GiftVisibilityStatus.hidden
				: GiftVisibilityStatus.available,
			publicNote: gift.publicNote ?? null,
			internalNote: gift.internalNote ?? null,
			sortOrder: index,
			deletedAt: null,
		})),
	});
};

export const createWishlist = async (
	db: WishlistDatabase,
	input: CreateWishlistInput,
) =>
	db.wishlist.create({
		data: {
			owner: {
				connect: {
					id: input.ownerId,
				},
			},
			title: input.title,
			slug: input.slug,
			eventType: input.eventType,
			language: input.language ?? Locale.es,
			currency: input.currency ?? Currency.PEN,
			heroTitle: input.heroTitle ?? null,
			welcomeMessage: input.welcomeMessage ?? null,
			thankYouMessage: input.thankYouMessage ?? null,
			displayName: input.displayName ?? null,
			eventDate: input.eventDate ?? null,
			eventTime: input.eventTime ?? null,
			eventLocation: input.eventLocation ?? null,
			dressCode: input.dressCode ?? null,
			coverImageUrl: input.coverImageUrl ?? null,
			themeId: input.themeId ?? null,
			layoutId: input.layoutId ?? null,
			buttonStyle: input.buttonStyle ?? null,
			fontPairing: input.fontPairing ?? null,
			showHowItWorks: input.showHowItWorks ?? true,
			status: WishlistStatus.draft,
			publishedAt: null,
			archivedAt: null,
		},
	});

export const saveWishlistDraft = async (
	db: WishlistDatabase,
	input: SaveDraftWishlistInput & { ownerId: number },
): Promise<SaveDraftResult> => {
	const orderedGifts = sortDraftGifts(input.gifts);
	const wishlistData = wishlistDraftToData(input);

	if (!input.savedWishlistId) {
		return db.$transaction(async (tx) => {
			const wishlist = await tx.wishlist.create({
				data: {
					owner: {
						connect: {
							id: input.ownerId,
						},
					},
					...wishlistData,
					status: WishlistStatus.draft,
					publishedAt: null,
					archivedAt: null,
				},
			});

			await replaceDraftCollections(tx, {
				wishlistId: wishlist.id,
				categories: input.categories,
				gifts: orderedGifts,
				currency: input.currency,
			});

			const savedDraft = await getOwnedDraftWithRelations(tx, {
				ownerId: input.ownerId,
				wishlistId: wishlist.id,
			});

			return {
				status: "saved",
				wishlistId: savedDraft.id,
				lastSavedAt: savedDraft.updatedAt.getTime(),
			};
		});
	}

	const savedWishlistId = input.savedWishlistId;

	return db.$transaction(async (tx) => {
		const existingDraft = await getOwnedDraftWithRelations(tx, {
			ownerId: input.ownerId,
			wishlistId: savedWishlistId,
		});

		if (
			!input.force &&
			existingDraft.updatedAt.getTime() !== input.lastSavedAt
		) {
			return {
				status: "conflict",
				serverDraft: mapServerDraft(existingDraft),
			};
		}

		const updateResult = await tx.wishlist.updateMany({
			where: {
				id: savedWishlistId,
				ownerId: input.ownerId,
				status: WishlistStatus.draft,
				updatedAt: input.force
					? undefined
					: new Date(input.lastSavedAt ?? existingDraft.updatedAt.getTime()),
			},
			data: {
				...wishlistData,
				status: WishlistStatus.draft,
				publishedAt: null,
				archivedAt: null,
			},
		});

		if (updateResult.count === 0) {
			const currentDraft = await getOwnedDraftWithRelations(tx, {
				ownerId: input.ownerId,
				wishlistId: savedWishlistId,
			});

			return {
				status: "conflict",
				serverDraft: mapServerDraft(currentDraft),
			};
		}

		await replaceDraftCollections(tx, {
			wishlistId: savedWishlistId,
			categories: input.categories,
			gifts: orderedGifts,
			currency: input.currency,
		});

		const savedDraft = await getOwnedDraftWithRelations(tx, {
			ownerId: input.ownerId,
			wishlistId: savedWishlistId,
		});

		return {
			status: "saved",
			wishlistId: savedDraft.id,
			lastSavedAt: savedDraft.updatedAt.getTime(),
		};
	});
};

export const publishWishlist = async (
	db: WishlistDatabase,
	{
		ownerId,
		wishlistId,
		now = new Date(),
	}: { ownerId: number; wishlistId: string; now?: Date },
) => {
	const wishlist = await db.wishlist.findFirst({
		where: {
			id: wishlistId,
			ownerId,
		},
	});

	if (!wishlist) {
		throw new TRPCError({
			code: "NOT_FOUND",
			message: "Wishlist not found",
		});
	}

	if (wishlist.status !== WishlistStatus.draft) {
		throw new TRPCError({
			code: "PRECONDITION_FAILED",
			message: "Only draft wishlists can be published",
		});
	}

	const visibleGiftCount = await db.gift.count({
		where: {
			wishlistId,
			visibilityStatus: GiftVisibilityStatus.available,
			deletedAt: null,
		},
	});

	const readiness = evaluatePublishReadiness({
		title: wishlist.title,
		eventType: wishlist.eventType,
		slug: wishlist.slug,
		language: wishlist.language,
		currency: wishlist.currency,
		visibleGiftCount,
	});

	if (!readiness.ready) {
		throw new PublishReadinessError(readiness);
	}

	return db.wishlist.update({
		where: { id: wishlistId },
		data: {
			status: WishlistStatus.published,
			publishedAt: now,
			archivedAt: null,
		},
	});
};

export const publishWishlistFromWizard = async (
	db: WishlistDatabase,
	input: SaveDraftWishlistInput & { ownerId: number; now?: Date },
): Promise<WizardPublishResult> => {
	const saveResult = await saveWishlistDraft(db, input);

	if (saveResult.status === "conflict") {
		return saveResult;
	}

	const publishedWishlist = await publishWishlist(db, {
		ownerId: input.ownerId,
		wishlistId: saveResult.wishlistId,
		now: input.now,
	});

	return {
		status: "published",
		wishlistId: publishedWishlist.id,
		slug: publishedWishlist.slug,
		publicUrlPath: `/w/${publishedWishlist.slug}`,
		dashboardUrlPath: "/dashboard",
	};
};

export const archiveWishlist = async (
	db: WishlistDatabase,
	{ wishlistId, now = new Date() }: { wishlistId: string; now?: Date },
) =>
	db.wishlist.update({
		where: { id: wishlistId },
		data: {
			status: WishlistStatus.archived,
			archivedAt: now,
		},
	});

export const restoreWishlist = async (
	db: WishlistDatabase,
	{
		wishlistId,
		targetStatus,
		now = new Date(),
	}: {
		wishlistId: string;
		targetStatus: WishlistRestoreTargetStatus;
		now?: Date;
	},
) => {
	const existingWishlist = (await db.wishlist.findUniqueOrThrow({
		where: { id: wishlistId },
		select: { publishedAt: true },
	})) as WishlistPublishedAtLookup;

	return db.wishlist.update({
		where: { id: wishlistId },
		data: {
			status: targetStatus,
			archivedAt: null,
			publishedAt:
				targetStatus === WishlistStatus.published
					? (existingWishlist.publishedAt ?? now)
					: existingWishlist.publishedAt,
		},
	});
};
