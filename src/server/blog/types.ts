import type { BlogAuthorKey } from "@/config/blog-authors";
import type { BlogCategoryKey } from "@/config/blog-categories";

export type BlogPostFrontmatter = {
	title: string;
	excerpt: string;
	date: Date;
	category: BlogCategoryKey;
	author: BlogAuthorKey;
	tags: string[];
	cover?: string;
	featured?: boolean;
	draft?: boolean;
	related?: string[];
};

export type BlogPostMeta = BlogPostFrontmatter & {
	slug: string;
	readingTime: number;
};

export type BlogPost = BlogPostMeta & {
	body: string;
};
