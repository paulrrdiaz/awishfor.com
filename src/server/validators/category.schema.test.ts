import { describe, expect, it } from "vitest";
import {
	addCategorySchema,
	CATEGORY_NAME_MAX_LENGTH,
	renameCategorySchema,
	reorderCategoriesSchema,
	seedDefaultCategoriesSchema,
} from "@/server/validators/category.schema";

describe("category validation", () => {
	it("trims category names for add and rename payloads", () => {
		expect(
			addCategorySchema.parse({
				wishlistId: "wishlist_123",
				name: "  Cocina  ",
			}),
		).toMatchObject({
			wishlistId: "wishlist_123",
			name: "Cocina",
		});

		expect(
			renameCategorySchema.parse({
				categoryId: "category_123",
				name: "  Fiesta  ",
			}),
		).toMatchObject({
			categoryId: "category_123",
			name: "Fiesta",
		});
	});

	it("rejects empty category names after trimming", () => {
		expect(() =>
			addCategorySchema.parse({
				wishlistId: "wishlist_123",
				name: "   ",
			}),
		).toThrow("Category name is required");
	});

	it("rejects category names that exceed the maximum length", () => {
		expect(() =>
			addCategorySchema.parse({
				wishlistId: "wishlist_123",
				name: "a".repeat(CATEGORY_NAME_MAX_LENGTH + 1),
			}),
		).toThrow(
			`Category name must be at most ${CATEGORY_NAME_MAX_LENGTH} characters`,
		);
	});

	it("rejects duplicate category ids in reorder payloads", () => {
		const result = reorderCategoriesSchema.safeParse({
			wishlistId: "wishlist_123",
			categoryIds: ["category_1", "category_2", "category_1"],
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues).toEqual(
				expect.arrayContaining([
					expect.objectContaining({
						message: "Category reorder payload cannot contain duplicate ids",
						path: ["categoryIds", 2],
					}),
				]),
			);
		}
	});

	it("requires the complete reorder payload shape", () => {
		const missingCategoryIds = reorderCategoriesSchema.safeParse({
			wishlistId: "wishlist_123",
		});
		const missingWishlistId = reorderCategoriesSchema.safeParse({
			categoryIds: ["category_1"],
		});

		expect(missingCategoryIds.success).toBe(false);
		expect(missingWishlistId.success).toBe(false);
	});

	it("accepts an ordered list of default category names", () => {
		expect(
			seedDefaultCategoriesSchema.parse({
				wishlistId: "wishlist_123",
				names: ["  Cocina  ", "Dormitorio"],
			}),
		).toMatchObject({
			wishlistId: "wishlist_123",
			names: ["Cocina", "Dormitorio"],
		});
	});
});
