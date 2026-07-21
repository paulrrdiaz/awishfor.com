import { describe, expect, it } from "vitest";
import {
	type Category,
	EventType,
	type Gift,
	type Prisma,
	type Wishlist,
} from "@/generated/prisma/client";
import {
	addCategory,
	type CategoryDatabase,
	deleteCategory,
	getUncategorizedGiftCount,
	listCategories,
	renameCategory,
	reorderCategories,
	seedDefaultCategories,
} from "@/server/services/category.service";

const createWishlistRecord = (overrides: Partial<Wishlist> = {}): Wishlist => ({
	id: "wishlist_123",
	ownerId: 42,
	title: "Lista de boda",
	slug: "lista-de-boda",
	eventType: EventType.wedding,
	language: "es",
	currency: "PEN",
	heroTitle: null,
	welcomeMessage: null,
	thankYouMessage: null,
	displayName: null,
	eventDate: null,
	eventTime: null,
	eventLocation: null,
	dressCode: null,
	coverImageUrl: null,
	coverImageUrls: [],
	themeId: null,
	layoutId: null,
	buttonStyle: null,
	fontPairing: null,
	headingFont: null,
	bodyFont: null,
	showHowItWorks: true,
	status: "draft",
	publishedAt: null,
	archivedAt: null,
	createdAt: new Date("2026-06-25T00:00:00.000Z"),
	updatedAt: new Date("2026-06-25T00:00:00.000Z"),
	...overrides,
});

const createCategoryRecord = (overrides: Partial<Category> = {}): Category => ({
	id: "category_1",
	wishlistId: "wishlist_123",
	name: "Cocina",
	sortOrder: 0,
	createdAt: new Date("2026-06-25T00:00:00.000Z"),
	updatedAt: new Date("2026-06-25T00:00:00.000Z"),
	...overrides,
});

const createGiftRecord = (overrides: Partial<Gift> = {}): Gift => ({
	id: "gift_1",
	wishlistId: "wishlist_123",
	categoryId: null,
	name: "Batidora",
	productUrl: null,
	imageUrl: null,
	storeName: null,
	priceAmount: null,
	priceCurrency: null,
	quantityNeeded: 1,
	priority: "medium",
	visibilityStatus: "available",
	publicNote: null,
	internalNote: null,
	sortOrder: 0,
	deletedAt: null,
	createdAt: new Date("2026-06-25T00:00:00.000Z"),
	updatedAt: new Date("2026-06-25T00:00:00.000Z"),
	...overrides,
});

const sortCategories = (categories: Category[]) =>
	[...categories].sort((left, right) => {
		if (left.sortOrder !== right.sortOrder) {
			return left.sortOrder - right.sortOrder;
		}

		return left.createdAt.getTime() - right.createdAt.getTime();
	});

const createMockDatabase = ({
	wishlists = [createWishlistRecord()],
	categories = [],
	gifts = [],
}: {
	wishlists?: Wishlist[];
	categories?: Category[];
	gifts?: Gift[];
} = {}) => {
	const state = {
		wishlists: [...wishlists],
		categories: [...categories],
		gifts: [...gifts],
	};

	let categorySequence = state.categories.length + 1;
	let createdAtSequence = state.categories.length + 1;

	const wishlist: CategoryDatabase["wishlist"] = {
		findFirst: async (args: Prisma.WishlistFindFirstArgs) => {
			const wishlistId = args.where?.id;
			const ownerId = args.where?.ownerId;

			return (
				state.wishlists.find(
					(item) =>
						(typeof wishlistId !== "string" || item.id === wishlistId) &&
						(typeof ownerId !== "number" || item.ownerId === ownerId),
				) ?? null
			);
		},
	};

	const category: CategoryDatabase["category"] = {
		findMany: async (args: Prisma.CategoryFindManyArgs) => {
			const wishlistId = args.where?.wishlistId;
			const categories = sortCategories(
				state.categories.filter(
					(item) =>
						typeof wishlistId !== "string" || item.wishlistId === wishlistId,
				),
			);

			if (args.include && "_count" in args.include) {
				return categories.map((item) => ({
					...item,
					_count: {
						gifts: state.gifts.filter(
							(gift) => gift.categoryId === item.id && gift.deletedAt === null,
						).length,
					},
				}));
			}

			return categories;
		},
		findFirst: async (args: Prisma.CategoryFindFirstArgs) => {
			const categoryId =
				typeof args.where?.id === "string" ? args.where.id : undefined;
			const ownerId = args.where?.wishlist?.is?.ownerId;
			const wishlistId =
				typeof args.where?.wishlistId === "string"
					? args.where.wishlistId
					: undefined;
			const excludedCategoryId =
				typeof args.where?.NOT === "object" &&
				args.where.NOT &&
				"id" in args.where.NOT &&
				typeof args.where.NOT.id === "string"
					? args.where.NOT.id
					: undefined;
			const nameFilter =
				typeof args.where?.name === "object" &&
				args.where.name &&
				"equals" in args.where.name &&
				typeof args.where.name.equals === "string"
					? args.where.name.equals
					: undefined;

			const matchingCategories = state.categories.filter((item) => {
				if (categoryId && item.id !== categoryId) {
					return false;
				}

				if (wishlistId && item.wishlistId !== wishlistId) {
					return false;
				}

				if (excludedCategoryId && item.id === excludedCategoryId) {
					return false;
				}

				if (
					nameFilter &&
					item.name.toLocaleLowerCase() !== nameFilter.toLocaleLowerCase()
				) {
					return false;
				}

				if (typeof ownerId === "number") {
					const owningWishlist = state.wishlists.find(
						(wishlistItem) => wishlistItem.id === item.wishlistId,
					);

					return owningWishlist?.ownerId === ownerId;
				}

				return true;
			});

			if (
				Array.isArray(args.orderBy) &&
				args.orderBy.some(
					(orderBy) => "sortOrder" in orderBy && orderBy.sortOrder === "desc",
				)
			) {
				return (
					[...matchingCategories].sort((left, right) => {
						if (left.sortOrder !== right.sortOrder) {
							return right.sortOrder - left.sortOrder;
						}

						return right.createdAt.getTime() - left.createdAt.getTime();
					})[0] ?? null
				);
			}

			return sortCategories(matchingCategories)[0] ?? null;
		},
		create: async (args: Prisma.CategoryCreateArgs) => {
			const data = args.data as {
				name: string;
				sortOrder?: number;
				wishlist?: {
					connect?: {
						id: string;
					};
				};
			};
			const createdAt = new Date(
				Date.UTC(2026, 5, 25, 0, 0, createdAtSequence),
			);
			createdAtSequence += 1;

			const createdCategory = createCategoryRecord({
				id: `category_${categorySequence}`,
				wishlistId: data.wishlist?.connect?.id ?? "wishlist_123",
				name: data.name,
				sortOrder: data.sortOrder ?? 0,
				createdAt,
				updatedAt: createdAt,
			});

			categorySequence += 1;
			state.categories.push(createdCategory);

			return createdCategory;
		},
		update: async (args: Prisma.CategoryUpdateArgs) => {
			const existingCategory = state.categories.find(
				(item) => item.id === args.where.id,
			);

			if (!existingCategory) {
				throw new Error("Category not found");
			}

			if (typeof args.data.name === "string") {
				existingCategory.name = args.data.name;
			}

			if (typeof args.data.sortOrder === "number") {
				existingCategory.sortOrder = args.data.sortOrder;
			}

			existingCategory.updatedAt = new Date("2026-06-25T12:00:00.000Z");

			return existingCategory;
		},
		delete: async (args: Prisma.CategoryDeleteArgs) => {
			const categoryIndex = state.categories.findIndex(
				(item) => item.id === args.where.id,
			);

			if (categoryIndex === -1) {
				throw new Error("Category not found");
			}

			const [deletedCategory] = state.categories.splice(categoryIndex, 1);

			if (!deletedCategory) {
				throw new Error("Category not found");
			}

			return deletedCategory;
		},
	};

	const gift: CategoryDatabase["gift"] = {
		count: async (args: Prisma.GiftCountArgs) => {
			const wishlistId = args.where?.wishlistId;
			const categoryId = args.where?.categoryId;
			const deletedAt = args.where?.deletedAt;

			return state.gifts.filter((giftItem) => {
				if (
					typeof wishlistId === "string" &&
					giftItem.wishlistId !== wishlistId
				) {
					return false;
				}

				if (categoryId === null && giftItem.categoryId !== null) {
					return false;
				}

				if (deletedAt === null && giftItem.deletedAt !== null) {
					return false;
				}

				return true;
			}).length;
		},
	};

	const db: CategoryDatabase = {
		wishlist,
		category,
		gift,
		$transaction: async (callback) => {
			const wishlistSnapshot = [...state.wishlists];
			const categorySnapshot = [...state.categories];
			const giftSnapshot = [...state.gifts];
			const categorySequenceSnapshot = categorySequence;
			const createdAtSequenceSnapshot = createdAtSequence;

			try {
				return await callback({ wishlist, category, gift });
			} catch (error) {
				state.wishlists.splice(0, state.wishlists.length, ...wishlistSnapshot);
				state.categories.splice(
					0,
					state.categories.length,
					...categorySnapshot,
				);
				state.gifts.splice(0, state.gifts.length, ...giftSnapshot);
				categorySequence = categorySequenceSnapshot;
				createdAtSequence = createdAtSequenceSnapshot;
				throw error;
			}
		},
	};

	return { db, state };
};

describe("category service", () => {
	it("rejects non-owner reads and mutations", async () => {
		const { db } = createMockDatabase({
			categories: [createCategoryRecord()],
		});

		await expect(
			listCategories(db, {
				ownerId: 999,
				wishlistId: "wishlist_123",
			}),
		).rejects.toMatchObject({
			code: "NOT_FOUND",
		});

		await expect(
			deleteCategory(db, {
				ownerId: 999,
				categoryId: "category_1",
			}),
		).rejects.toMatchObject({
			code: "NOT_FOUND",
		});

		await expect(
			getUncategorizedGiftCount(db, {
				ownerId: 999,
				wishlistId: "wishlist_123",
			}),
		).rejects.toMatchObject({
			code: "NOT_FOUND",
		});
	});

	it("returns categories ordered by sortOrder and creation time", async () => {
		const { db } = createMockDatabase({
			categories: [
				createCategoryRecord({
					id: "category_1",
					name: "Dormitorio",
					sortOrder: 2,
					createdAt: new Date("2026-06-25T00:00:02.000Z"),
				}),
				createCategoryRecord({
					id: "category_2",
					name: "Cocina",
					sortOrder: 1,
					createdAt: new Date("2026-06-25T00:00:03.000Z"),
				}),
				createCategoryRecord({
					id: "category_3",
					name: "Sala",
					sortOrder: 1,
					createdAt: new Date("2026-06-25T00:00:01.000Z"),
				}),
			],
		});

		const categories = await listCategories(db, {
			ownerId: 42,
			wishlistId: "wishlist_123",
		});

		expect(categories.map((category) => category.id)).toEqual([
			"category_3",
			"category_2",
			"category_1",
		]);
	});

	it("returns non-deleted gift counts for listed categories", async () => {
		const { db } = createMockDatabase({
			categories: [
				createCategoryRecord({ id: "category_1", name: "Cocina" }),
				createCategoryRecord({ id: "category_2", name: "Dormitorio" }),
				createCategoryRecord({ id: "category_3", name: "Sala" }),
			],
			gifts: [
				createGiftRecord({ id: "gift_1", categoryId: "category_1" }),
				createGiftRecord({ id: "gift_2", categoryId: "category_1" }),
				createGiftRecord({
					id: "gift_3",
					categoryId: "category_1",
					deletedAt: new Date("2026-06-25T12:00:00.000Z"),
				}),
				createGiftRecord({ id: "gift_4", categoryId: "category_2" }),
				createGiftRecord({ id: "gift_5", categoryId: null }),
			],
		});

		const categories = await listCategories(db, {
			ownerId: 42,
			wishlistId: "wishlist_123",
		});

		expect(
			categories.map((category) => [category.id, category.giftCount]),
		).toEqual([
			["category_1", 2],
			["category_2", 1],
			["category_3", 0],
		]);
	});

	it("counts only non-deleted uncategorized gifts for an owned wishlist", async () => {
		const { db } = createMockDatabase({
			categories: [createCategoryRecord({ id: "category_1" })],
			gifts: [
				createGiftRecord({ id: "gift_1", categoryId: null }),
				createGiftRecord({ id: "gift_2", categoryId: null }),
				createGiftRecord({
					id: "gift_3",
					categoryId: null,
					deletedAt: new Date("2026-06-25T12:00:00.000Z"),
				}),
				createGiftRecord({ id: "gift_4", categoryId: "category_1" }),
				createGiftRecord({
					id: "gift_5",
					wishlistId: "wishlist_456",
					categoryId: null,
				}),
			],
		});

		await expect(
			getUncategorizedGiftCount(db, {
				ownerId: 42,
				wishlistId: "wishlist_123",
			}),
		).resolves.toBe(2);
	});

	it("adds a category using the next deterministic sort order", async () => {
		const { db } = createMockDatabase({
			categories: [
				createCategoryRecord({ id: "category_1", sortOrder: 0 }),
				createCategoryRecord({ id: "category_2", sortOrder: 4 }),
			],
		});

		const category = await addCategory(db, {
			ownerId: 42,
			wishlistId: "wishlist_123",
			name: "Baño",
		});

		expect(category.name).toBe("Baño");
		expect(category.sortOrder).toBe(5);
	});

	it("renames a category and rejects case-insensitive duplicates within a wishlist", async () => {
		const { db } = createMockDatabase({
			categories: [
				createCategoryRecord({ id: "category_1", name: "Cocina" }),
				createCategoryRecord({ id: "category_2", name: "Dormitorio" }),
			],
		});

		await expect(
			renameCategory(db, {
				ownerId: 42,
				categoryId: "category_2",
				name: "cocina",
			}),
		).rejects.toMatchObject({
			code: "BAD_REQUEST",
			message: "Category name already exists for this wishlist",
		});

		const renamedCategory = await renameCategory(db, {
			ownerId: 42,
			categoryId: "category_2",
			name: "Invitados",
		});

		expect(renamedCategory.name).toBe("Invitados");
	});

	it("deletes a category without deleting the wishlist", async () => {
		const { db, state } = createMockDatabase({
			categories: [createCategoryRecord({ id: "category_1" })],
		});

		await deleteCategory(db, {
			ownerId: 42,
			categoryId: "category_1",
		});

		expect(state.categories).toHaveLength(0);
		expect(state.wishlists).toHaveLength(1);
	});

	it("reorders all categories and rejects missing or cross-wishlist ids", async () => {
		const { db } = createMockDatabase({
			wishlists: [
				createWishlistRecord({ id: "wishlist_123", ownerId: 42 }),
				createWishlistRecord({
					id: "wishlist_456",
					ownerId: 42,
					slug: "otra-lista",
				}),
			],
			categories: [
				createCategoryRecord({
					id: "category_1",
					wishlistId: "wishlist_123",
					sortOrder: 0,
				}),
				createCategoryRecord({
					id: "category_2",
					wishlistId: "wishlist_123",
					sortOrder: 1,
				}),
				createCategoryRecord({
					id: "category_3",
					wishlistId: "wishlist_456",
					sortOrder: 0,
				}),
			],
		});

		await expect(
			reorderCategories(db, {
				ownerId: 42,
				wishlistId: "wishlist_123",
				categoryIds: ["category_2"],
			}),
		).rejects.toMatchObject({
			code: "BAD_REQUEST",
		});

		await expect(
			reorderCategories(db, {
				ownerId: 42,
				wishlistId: "wishlist_123",
				categoryIds: ["category_2", "category_3"],
			}),
		).rejects.toMatchObject({
			code: "BAD_REQUEST",
		});

		const categories = await reorderCategories(db, {
			ownerId: 42,
			wishlistId: "wishlist_123",
			categoryIds: ["category_2", "category_1"],
		});

		expect(
			categories.map((category) => [category.id, category.sortOrder]),
		).toEqual([
			["category_2", 0],
			["category_1", 1],
		]);
	});

	it("seeds default categories in order and rejects duplicates", async () => {
		const { db: duplicateDb } = createMockDatabase();

		await expect(
			seedDefaultCategories(duplicateDb, {
				ownerId: 42,
				wishlistId: "wishlist_123",
				names: ["Cocina", "cocina"],
			}),
		).rejects.toMatchObject({
			code: "BAD_REQUEST",
			message: "Category name already exists for this wishlist",
		});

		const { db } = createMockDatabase();

		const categories = await seedDefaultCategories(db, {
			ownerId: 42,
			wishlistId: "wishlist_123",
			names: ["Cocina", "Dormitorio", "Sala"],
		});

		expect(
			categories.map((category) => [category.name, category.sortOrder]),
		).toEqual([
			["Cocina", 0],
			["Dormitorio", 1],
			["Sala", 2],
		]);
	});

	it("returns an empty array when no default categories are provided", async () => {
		const { db } = createMockDatabase({
			categories: [createCategoryRecord({ id: "category_1", sortOrder: 4 })],
		});

		await expect(
			seedDefaultCategories(db, {
				ownerId: 42,
				wishlistId: "wishlist_123",
				names: [],
			}),
		).resolves.toEqual([]);
	});
});
