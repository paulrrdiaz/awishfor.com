import type {
	Gift,
	GiftVisibilityStatus,
	Prisma,
} from "@/generated/prisma/client";
import type {
	CreateGiftInput,
	DeleteGiftInput,
	UpdateGiftInput,
} from "@/server/validators/gift.schema";

const ACTIVE_GIFT_FILTER = { deletedAt: null } satisfies Prisma.GiftWhereInput;

type GiftDelegate = {
	create(args: Prisma.GiftCreateArgs): Promise<Gift>;
	findFirst(args: Prisma.GiftFindFirstArgs): Promise<Gift | null>;
	findMany(args: Prisma.GiftFindManyArgs): Promise<Gift[]>;
	update(args: Prisma.GiftUpdateArgs): Promise<Gift>;
};

export type GiftDatabase = {
	gift: GiftDelegate;
};

export const listGifts = (
	db: GiftDatabase,
	{
		wishlistId,
		includeHidden = false,
	}: { wishlistId: string; includeHidden?: boolean },
) =>
	db.gift.findMany({
		where: {
			wishlistId,
			...ACTIVE_GIFT_FILTER,
			...(includeHidden
				? {}
				: ({ visibilityStatus: "available" } satisfies Prisma.GiftWhereInput)),
		},
		orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
	});

export const createGift = (db: GiftDatabase, input: CreateGiftInput) =>
	db.gift.create({
		data: {
			wishlist: { connect: { id: input.wishlistId } },
			...(input.categoryId
				? { category: { connect: { id: input.categoryId } } }
				: {}),
			name: input.name,
			productUrl: input.productUrl ?? null,
			imageUrl: input.imageUrl ?? null,
			storeName: input.storeName ?? null,
			priceAmount: input.priceAmount ?? null,
			priceCurrency: (input.priceCurrency as Gift["priceCurrency"]) ?? null,
			quantityNeeded: input.quantityNeeded ?? 1,
			priority: (input.priority as Gift["priority"]) ?? "medium",
			visibilityStatus:
				(input.visibilityStatus as GiftVisibilityStatus) ?? "available",
			publicNote: input.publicNote ?? null,
			internalNote: input.internalNote ?? null,
			sortOrder: input.sortOrder ?? 0,
		},
	});

export const updateGift = async (db: GiftDatabase, input: UpdateGiftInput) => {
	const data: Prisma.GiftUpdateInput = {};

	if (input.name !== undefined) data.name = input.name;
	if (input.productUrl !== undefined)
		data.productUrl = input.productUrl ?? null;
	if (input.imageUrl !== undefined) data.imageUrl = input.imageUrl ?? null;
	if (input.storeName !== undefined) data.storeName = input.storeName ?? null;
	if (input.priceAmount !== undefined)
		data.priceAmount = input.priceAmount ?? null;
	if (input.priceCurrency !== undefined)
		data.priceCurrency = (input.priceCurrency as Gift["priceCurrency"]) ?? null;
	if (input.quantityNeeded !== undefined)
		data.quantityNeeded = input.quantityNeeded;
	if (input.priority !== undefined)
		data.priority = input.priority as Gift["priority"];
	if (input.visibilityStatus !== undefined)
		data.visibilityStatus = input.visibilityStatus as GiftVisibilityStatus;
	if (input.publicNote !== undefined)
		data.publicNote = input.publicNote ?? null;
	if (input.internalNote !== undefined)
		data.internalNote = input.internalNote ?? null;
	if (input.sortOrder !== undefined) data.sortOrder = input.sortOrder;

	if ("categoryId" in input) {
		data.category = input.categoryId
			? { connect: { id: input.categoryId } }
			: { disconnect: true };
	}

	return db.gift.update({ where: { id: input.giftId }, data });
};

export const softDeleteGift = (db: GiftDatabase, input: DeleteGiftInput) =>
	db.gift.update({
		where: { id: input.giftId },
		data: { deletedAt: new Date() },
	});

export const findActiveGift = (db: GiftDatabase, giftId: string) =>
	db.gift.findFirst({
		where: { id: giftId, ...ACTIVE_GIFT_FILTER },
	});
