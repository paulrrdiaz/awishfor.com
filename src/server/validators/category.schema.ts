import { z } from "zod";
import { wishlistIdSchema } from "@/server/validators/wishlist.schema";

export const CATEGORY_NAME_MAX_LENGTH = 80;

export const categoryIdSchema = z.string().min(1, "Category id is required");
export const categoryNameSchema = z
	.string()
	.trim()
	.min(1, "Category name is required")
	.max(
		CATEGORY_NAME_MAX_LENGTH,
		`Category name must be at most ${CATEGORY_NAME_MAX_LENGTH} characters`,
	);

const categoryIdsSchema = z
	.array(categoryIdSchema)
	.superRefine((categoryIds, ctx) => {
		const seenIds = new Set<string>();

		for (const [index, categoryId] of categoryIds.entries()) {
			if (seenIds.has(categoryId)) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "Category reorder payload cannot contain duplicate ids",
					path: [index],
				});
			}

			seenIds.add(categoryId);
		}
	});

export const listCategoriesSchema = z.object({
	wishlistId: wishlistIdSchema,
});

export const addCategorySchema = z.object({
	wishlistId: wishlistIdSchema,
	name: categoryNameSchema,
});

export const renameCategorySchema = z.object({
	categoryId: categoryIdSchema,
	name: categoryNameSchema,
});

export const deleteCategorySchema = z.object({
	categoryId: categoryIdSchema,
});

export const reorderCategoriesSchema = z.object({
	wishlistId: wishlistIdSchema,
	categoryIds: categoryIdsSchema,
});

export const seedDefaultCategoriesSchema = z.object({
	wishlistId: wishlistIdSchema,
	names: z.array(categoryNameSchema),
});

export type AddCategoryInput = z.infer<typeof addCategorySchema>;
export type DeleteCategoryInput = z.infer<typeof deleteCategorySchema>;
export type ListCategoriesInput = z.infer<typeof listCategoriesSchema>;
export type RenameCategoryInput = z.infer<typeof renameCategorySchema>;
export type ReorderCategoriesInput = z.infer<typeof reorderCategoriesSchema>;
export type SeedDefaultCategoriesInput = z.infer<
	typeof seedDefaultCategoriesSchema
>;
