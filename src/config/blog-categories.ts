export type BlogCategoryKey = "planeacion" | "guias" | "producto";

export type BlogCategory = {
	label: string;
	badgeBg: string;
	badgeFg: string;
};

/** Insertion order matches the design canvas's filter-chip order (Guías, Planeación, Producto). */
export const BLOG_CATEGORIES = {
	guias: {
		label: "Guías de regalos",
		badgeBg: "#BCE25A",
		badgeFg: "#1B3A12",
	},
	planeacion: {
		label: "Planeación de eventos",
		badgeBg: "#7FB069",
		badgeFg: "#ffffff",
	},
	producto: {
		label: "Producto",
		badgeBg: "#F4C84A",
		badgeFg: "#4A3800",
	},
} as const satisfies Record<BlogCategoryKey, BlogCategory>;

export const BLOG_CATEGORY_KEYS = Object.keys(
	BLOG_CATEGORIES,
) as BlogCategoryKey[];

export function isBlogCategoryKey(value: string): value is BlogCategoryKey {
	return value in BLOG_CATEGORIES;
}
