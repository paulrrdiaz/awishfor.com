export type BlogAuthorKey = "valentina" | "camila" | "equipo";

export type BlogAuthor = {
	name: string;
	initial: string;
};

export const BLOG_AUTHORS = {
	valentina: { name: "Valentina Ríos", initial: "V" },
	camila: { name: "Camila Duarte", initial: "C" },
	equipo: { name: "Equipo A Wish For", initial: "A" },
} as const satisfies Record<BlogAuthorKey, BlogAuthor>;

export const BLOG_AUTHOR_KEYS = Object.keys(BLOG_AUTHORS) as BlogAuthorKey[];

export function isBlogAuthorKey(value: string): value is BlogAuthorKey {
	return value in BLOG_AUTHORS;
}
