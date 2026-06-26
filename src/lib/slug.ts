import { wishlistSlugPattern } from "@/server/validators/wishlist.schema";

export const slugify = (title: string): string | null => {
	const slug = title
		.normalize("NFKD")
		.replace(/\p{Mn}/gu, "")
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "")
		.substring(0, 60)
		.replace(/-+$/, "");

	return slug.length >= 3 ? slug : null;
};

export const isValidSlug = (slug: string): boolean =>
	wishlistSlugPattern.test(slug);
