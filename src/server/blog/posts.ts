import "server-only";

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { isBlogAuthorKey } from "@/config/blog-authors";
import { isBlogCategoryKey } from "@/config/blog-categories";
import { computeReadingTime } from "./reading-time";
import type { BlogPost, BlogPostFrontmatter, BlogPostMeta } from "./types";

const DEFAULT_CONTENT_DIR = path.join(process.cwd(), "content", "blog");
const RELATED_COUNT = 3;

export type BlogLoaderOptions = {
	/** Defaults to `content/blog` at the repo root. Injectable so tests can point at fixtures. */
	contentDir?: string;
	/** Defaults to true outside production, matching the dev-preview requirement for drafts. */
	includeDrafts?: boolean;
};

function resolveOptions(options?: BlogLoaderOptions) {
	return {
		contentDir: options?.contentDir ?? DEFAULT_CONTENT_DIR,
		includeDrafts:
			options?.includeDrafts ?? process.env.NODE_ENV !== "production",
	};
}

function requireString(
	file: string,
	data: Record<string, unknown>,
	field: string,
): string {
	const value = data[field];
	if (typeof value !== "string" || value.trim() === "") {
		throw new Error(
			`content/blog/${file}: missing required frontmatter field "${field}"`,
		);
	}
	return value;
}

function requireStringArray(
	file: string,
	data: Record<string, unknown>,
	field: string,
): string[] {
	const value = data[field];
	if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
		throw new Error(
			`content/blog/${file}: missing required frontmatter field "${field}" (expected an array of strings)`,
		);
	}
	return value;
}

function requireDate(
	file: string,
	data: Record<string, unknown>,
	field: string,
): Date {
	const value = data[field];
	const date =
		value instanceof Date
			? value
			: typeof value === "string"
				? new Date(value)
				: null;
	if (!date || Number.isNaN(date.getTime())) {
		throw new Error(
			`content/blog/${file}: missing or invalid required frontmatter field "${field}"`,
		);
	}
	return date;
}

function parseFrontmatter(
	file: string,
	data: Record<string, unknown>,
): BlogPostFrontmatter {
	const title = requireString(file, data, "title");
	const excerpt = requireString(file, data, "excerpt");
	const date = requireDate(file, data, "date");

	const category = requireString(file, data, "category");
	if (!isBlogCategoryKey(category)) {
		throw new Error(
			`content/blog/${file}: unknown category "${category}" — add it to src/config/blog-categories.ts or fix the typo`,
		);
	}

	const author = requireString(file, data, "author");
	if (!isBlogAuthorKey(author)) {
		throw new Error(
			`content/blog/${file}: unknown author "${author}" — add it to src/config/blog-authors.ts or fix the typo`,
		);
	}

	const tags = requireStringArray(file, data, "tags");

	const cover = data.cover;
	if (cover !== undefined && typeof cover !== "string") {
		throw new Error(
			`content/blog/${file}: frontmatter field "cover" must be a string`,
		);
	}
	const featured = data.featured;
	if (featured !== undefined && typeof featured !== "boolean") {
		throw new Error(
			`content/blog/${file}: frontmatter field "featured" must be a boolean`,
		);
	}
	const draft = data.draft;
	if (draft !== undefined && typeof draft !== "boolean") {
		throw new Error(
			`content/blog/${file}: frontmatter field "draft" must be a boolean`,
		);
	}
	const related = data.related;
	if (
		related !== undefined &&
		(!Array.isArray(related) ||
			related.some((item) => typeof item !== "string"))
	) {
		throw new Error(
			`content/blog/${file}: frontmatter field "related" must be an array of strings`,
		);
	}

	return {
		title,
		excerpt,
		date,
		category,
		author,
		tags,
		cover,
		featured: featured ?? false,
		draft: draft ?? false,
		related,
	};
}

function slugFromFilename(file: string): string {
	return file.replace(/\.mdx$/, "");
}

function readPostFiles(contentDir: string): string[] {
	if (!fs.existsSync(contentDir)) return [];
	return fs.readdirSync(contentDir).filter((file) => file.endsWith(".mdx"));
}

function loadPost(contentDir: string, file: string): BlogPost {
	const raw = fs.readFileSync(path.join(contentDir, file), "utf-8");
	const { data, content } = matter(raw);
	const frontmatter = parseFrontmatter(file, data);
	const body = content.trim();
	return {
		...frontmatter,
		slug: slugFromFilename(file),
		readingTime: computeReadingTime(body),
		body,
	};
}

function loadAllPosts(options?: BlogLoaderOptions): BlogPost[] {
	const { contentDir, includeDrafts } = resolveOptions(options);
	const posts = readPostFiles(contentDir).map((file) =>
		loadPost(contentDir, file),
	);
	const visible = includeDrafts ? posts : posts.filter((post) => !post.draft);
	return visible.sort((a, b) => b.date.getTime() - a.date.getTime());
}

/** Metadata only — never compiles a post body, so listing cost stays flat as bodies grow. */
export function getAllPosts(options?: BlogLoaderOptions): BlogPostMeta[] {
	return loadAllPosts(options).map(({ body: _body, ...meta }) => meta);
}

export function getPostBySlug(
	slug: string,
	options?: BlogLoaderOptions,
): BlogPost | undefined {
	return loadAllPosts(options).find((post) => post.slug === slug);
}

/**
 * Same category, newest first, excluding self, backfilled from the newest
 * posts overall until three are shown. A frontmatter `related` list wins outright.
 */
export function getRelatedPosts(
	post: Pick<BlogPostMeta, "slug" | "category" | "related">,
	options?: BlogLoaderOptions,
): BlogPostMeta[] {
	const allPosts = getAllPosts(options);

	if (post.related && post.related.length > 0) {
		return post.related
			.map((slug) => allPosts.find((candidate) => candidate.slug === slug))
			.filter(
				(candidate): candidate is BlogPostMeta => candidate !== undefined,
			);
	}

	const others = allPosts.filter((candidate) => candidate.slug !== post.slug);
	const sameCategory = others.filter(
		(candidate) => candidate.category === post.category,
	);
	const rest = others.filter(
		(candidate) => candidate.category !== post.category,
	);
	return [...sameCategory, ...rest].slice(0, RELATED_COUNT);
}

/**
 * Splits the featured post (if any) out of an already-sorted post list. The
 * index renders `featured` in the hero card and `rest` in the grid below, so
 * the featured post is never duplicated on the page.
 */
export function splitFeaturedPost(posts: BlogPostMeta[]): {
	featured: BlogPostMeta | undefined;
	rest: BlogPostMeta[];
} {
	const featured = posts.find((post) => post.featured);
	const rest = featured
		? posts.filter((post) => post.slug !== featured.slug)
		: posts;
	return { featured, rest };
}
