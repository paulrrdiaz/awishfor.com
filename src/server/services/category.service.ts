import { TRPCError } from "@trpc/server";
import type { Category, Prisma } from "@/generated/prisma/client";
import {
	assertWishlistAccess,
	type WishlistAccessDatabase,
} from "@/server/services/collaboration.service";
import type {
	AddCategoryInput,
	DeleteCategoryInput,
	ListCategoriesInput,
	RenameCategoryInput,
	ReorderCategoriesInput,
	SeedDefaultCategoriesInput,
	UncategorizedCountInput,
} from "@/server/validators/category.schema";

const CATEGORY_NAME_CONFLICT_MESSAGE =
	"Category name already exists for this wishlist";
const CATEGORY_REORDER_INVALID_MESSAGE =
	"Category reorder payload must include each category for the wishlist exactly once";

type CategoryDelegate = {
	create(args: Prisma.CategoryCreateArgs): Promise<Category>;
	delete(args: Prisma.CategoryDeleteArgs): Promise<Category>;
	findFirst(args: Prisma.CategoryFindFirstArgs): Promise<Category | null>;
	findMany(
		args: Prisma.CategoryFindManyArgs,
	): Promise<Array<Category | CategoryWithCountPayload>>;
	update(args: Prisma.CategoryUpdateArgs): Promise<Category>;
};

type GiftDelegate = {
	count(args: Prisma.GiftCountArgs): Promise<number>;
};

type CategoryTransaction = {
	category: CategoryDelegate;
	gift: GiftDelegate;
} & WishlistAccessDatabase;

export type CategoryDatabase = CategoryTransaction & {
	$transaction<T>(
		callback: (tx: CategoryTransaction) => Promise<T>,
	): Promise<T>;
};

type CategoryWithCountPayload = Category & { _count: { gifts: number } };

export type CategoryWithGiftCount = Category & { giftCount: number };

type CategoryCallerInput = {
	localUserId: number;
};

const orderedCategoryFields = [
	{ sortOrder: "asc" },
	{ createdAt: "asc" },
] satisfies Prisma.CategoryOrderByWithRelationInput[];

const descendingCategoryFields = [
	{ sortOrder: "desc" },
	{ createdAt: "desc" },
] satisfies Prisma.CategoryOrderByWithRelationInput[];

const normalizeCategoryName = (name: string) => name.trim().toLocaleLowerCase();

const getOwnedCategory = async (
	db: CategoryTransaction,
	{ localUserId, categoryId }: CategoryCallerInput & { categoryId: string },
) => {
	const category = await db.category.findFirst({
		where: { id: categoryId },
	});

	if (!category) {
		throw new TRPCError({ code: "NOT_FOUND", message: "Category not found" });
	}

	await assertWishlistAccess(db, {
		localUserId,
		wishlistId: category.wishlistId,
	});

	return category;
};

const assertUniqueCategoryName = async (
	db: CategoryTransaction,
	{
		wishlistId,
		name,
		excludeCategoryId,
	}: {
		wishlistId: string;
		name: string;
		excludeCategoryId?: string;
	},
) => {
	const duplicateCategory = await db.category.findFirst({
		where: {
			wishlistId,
			name: {
				equals: name,
				mode: "insensitive",
			},
			NOT: excludeCategoryId
				? {
						id: excludeCategoryId,
					}
				: undefined,
		},
	});

	if (duplicateCategory) {
		throw new TRPCError({
			code: "BAD_REQUEST",
			message: CATEGORY_NAME_CONFLICT_MESSAGE,
		});
	}
};

const getNextSortOrder = async (
	db: CategoryTransaction,
	wishlistId: string,
) => {
	const lastCategory = await db.category.findFirst({
		where: { wishlistId },
		orderBy: descendingCategoryFields,
	});

	return (lastCategory?.sortOrder ?? -1) + 1;
};

const assertValidCategoryReorder = (
	existingCategoryIds: string[],
	submittedCategoryIds: string[],
) => {
	if (existingCategoryIds.length !== submittedCategoryIds.length) {
		throw new TRPCError({
			code: "BAD_REQUEST",
			message: CATEGORY_REORDER_INVALID_MESSAGE,
		});
	}

	const existingCategoryIdSet = new Set(existingCategoryIds);
	const submittedCategoryIdSet = new Set(submittedCategoryIds);

	if (submittedCategoryIdSet.size !== submittedCategoryIds.length) {
		throw new TRPCError({
			code: "BAD_REQUEST",
			message: CATEGORY_REORDER_INVALID_MESSAGE,
		});
	}

	for (const categoryId of submittedCategoryIds) {
		if (!existingCategoryIdSet.has(categoryId)) {
			throw new TRPCError({
				code: "BAD_REQUEST",
				message: CATEGORY_REORDER_INVALID_MESSAGE,
			});
		}
	}

	for (const categoryId of existingCategoryIds) {
		if (!submittedCategoryIdSet.has(categoryId)) {
			throw new TRPCError({
				code: "BAD_REQUEST",
				message: CATEGORY_REORDER_INVALID_MESSAGE,
			});
		}
	}
};

export const listCategories = async (
	db: CategoryDatabase,
	input: CategoryCallerInput & ListCategoriesInput,
): Promise<CategoryWithGiftCount[]> => {
	await assertWishlistAccess(db, input);

	const categories = (await db.category.findMany({
		where: {
			wishlistId: input.wishlistId,
		},
		orderBy: orderedCategoryFields,
		include: {
			_count: {
				select: {
					gifts: {
						where: {
							deletedAt: null,
						},
					},
				},
			},
		},
	})) as CategoryWithCountPayload[];

	return categories.map(({ _count, ...category }) => ({
		...category,
		giftCount: _count.gifts,
	}));
};

export const getUncategorizedGiftCount = async (
	db: CategoryDatabase,
	input: CategoryCallerInput & UncategorizedCountInput,
) => {
	await assertWishlistAccess(db, input);

	return db.gift.count({
		where: {
			wishlistId: input.wishlistId,
			categoryId: null,
			deletedAt: null,
		},
	});
};

export const addCategory = async (
	db: CategoryDatabase,
	input: CategoryCallerInput & AddCategoryInput,
) => {
	await assertWishlistAccess(db, input);
	await assertUniqueCategoryName(db, {
		wishlistId: input.wishlistId,
		name: input.name,
	});

	const sortOrder = await getNextSortOrder(db, input.wishlistId);

	return db.category.create({
		data: {
			wishlist: {
				connect: {
					id: input.wishlistId,
				},
			},
			name: input.name,
			sortOrder,
		},
	});
};

export const renameCategory = async (
	db: CategoryDatabase,
	input: CategoryCallerInput & RenameCategoryInput,
) => {
	const category = await getOwnedCategory(db, input);

	await assertUniqueCategoryName(db, {
		wishlistId: category.wishlistId,
		name: input.name,
		excludeCategoryId: input.categoryId,
	});

	return db.category.update({
		where: {
			id: input.categoryId,
		},
		data: {
			name: input.name,
		},
	});
};

export const deleteCategory = async (
	db: CategoryDatabase,
	input: CategoryCallerInput & DeleteCategoryInput,
) => {
	await getOwnedCategory(db, input);

	return db.category.delete({
		where: {
			id: input.categoryId,
		},
	});
};

export const reorderCategories = async (
	db: CategoryDatabase,
	input: CategoryCallerInput & ReorderCategoriesInput,
) =>
	db.$transaction(async (tx) => {
		await assertWishlistAccess(tx, input);

		const existingCategories = await tx.category.findMany({
			where: {
				wishlistId: input.wishlistId,
			},
			orderBy: orderedCategoryFields,
		});

		assertValidCategoryReorder(
			existingCategories.map((category) => category.id),
			input.categoryIds,
		);

		await Promise.all(
			input.categoryIds.map((categoryId, index) =>
				tx.category.update({
					where: {
						id: categoryId,
					},
					data: {
						sortOrder: index,
					},
				}),
			),
		);

		return tx.category.findMany({
			where: {
				wishlistId: input.wishlistId,
			},
			orderBy: orderedCategoryFields,
		});
	});

export const seedDefaultCategories = async (
	db: CategoryDatabase,
	input: CategoryCallerInput & SeedDefaultCategoriesInput,
) => {
	await assertWishlistAccess(db, input);

	if (input.names.length === 0) {
		return [];
	}

	return db.$transaction(async (tx) => {
		const nextSortOrder = await getNextSortOrder(tx, input.wishlistId);
		const submittedNames = new Set<string>();
		const createdCategories: Category[] = [];

		for (const [index, name] of input.names.entries()) {
			const normalizedName = normalizeCategoryName(name);

			if (submittedNames.has(normalizedName)) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: CATEGORY_NAME_CONFLICT_MESSAGE,
				});
			}

			submittedNames.add(normalizedName);
			await assertUniqueCategoryName(tx, {
				wishlistId: input.wishlistId,
				name,
			});

			createdCategories.push(
				await tx.category.create({
					data: {
						wishlist: {
							connect: {
								id: input.wishlistId,
							},
						},
						name,
						sortOrder: nextSortOrder + index,
					},
				}),
			);
		}

		return createdCategories;
	});
};
