import path from "node:path";
import { describe, expect, it } from "vitest";
import {
	getAllPosts,
	getPostBySlug,
	getRelatedPosts,
	splitFeaturedPost,
} from "./posts";

const FIXTURES_DIR = path.join(__dirname, "__fixtures__", "posts");
const MALFORMED_DIR = path.join(__dirname, "__fixtures__", "malformed");
const UNKNOWN_CATEGORY_DIR = path.join(
	__dirname,
	"__fixtures__",
	"unknown-category",
);

describe("getAllPosts", () => {
	it("excludes drafts by default (includeDrafts: false)", () => {
		const posts = getAllPosts({
			contentDir: FIXTURES_DIR,
			includeDrafts: false,
		});
		expect(posts.some((post) => post.slug === "borrador-en-progreso")).toBe(
			false,
		);
	});

	it("includes drafts when includeDrafts is true", () => {
		const posts = getAllPosts({
			contentDir: FIXTURES_DIR,
			includeDrafts: true,
		});
		expect(posts.some((post) => post.slug === "borrador-en-progreso")).toBe(
			true,
		);
	});

	it("sorts posts by date descending", () => {
		const posts = getAllPosts({
			contentDir: FIXTURES_DIR,
			includeDrafts: false,
		});
		const dates = posts.map((post) => post.date.getTime());
		expect(dates).toEqual([...dates].sort((a, b) => b - a));
	});

	it("does not compile or return a post body", () => {
		const posts = getAllPosts({
			contentDir: FIXTURES_DIR,
			includeDrafts: false,
		});
		for (const post of posts) {
			expect(post).not.toHaveProperty("body");
		}
	});

	it("computes reading time from the body word count", () => {
		const posts = getAllPosts({
			contentDir: FIXTURES_DIR,
			includeDrafts: false,
		});
		const post = posts.find((p) => p.slug === "guia-envolver-regalos");
		expect(post?.readingTime).toBe(1);
	});

	it("fails loudly, naming the file and field, on missing required frontmatter", () => {
		expect(() =>
			getAllPosts({ contentDir: MALFORMED_DIR, includeDrafts: false }),
		).toThrow(/missing-excerpt\.mdx.*"excerpt"/s);
	});

	it("fails loudly on an unknown category key", () => {
		expect(() =>
			getAllPosts({ contentDir: UNKNOWN_CATEGORY_DIR, includeDrafts: false }),
		).toThrow(/bad-category\.mdx.*unknown category "no-existe"/s);
	});
});

describe("getPostBySlug", () => {
	it("derives the slug from the filename", () => {
		const post = getPostBySlug("guia-lista-ideal", {
			contentDir: FIXTURES_DIR,
			includeDrafts: false,
		});
		expect(post?.slug).toBe("guia-lista-ideal");
		expect(post?.title).toBe("Cómo armar la lista de regalos ideal");
	});

	it("compiles and returns the body for a single post", () => {
		const post = getPostBySlug("guia-lista-ideal", {
			contentDir: FIXTURES_DIR,
			includeDrafts: false,
		});
		expect(post?.body).toContain("Contenido de prueba");
	});

	it("returns undefined for an unknown slug", () => {
		const post = getPostBySlug("no-existe", {
			contentDir: FIXTURES_DIR,
			includeDrafts: false,
		});
		expect(post).toBeUndefined();
	});
});

describe("getRelatedPosts", () => {
	const options = { contentDir: FIXTURES_DIR, includeDrafts: false };

	it("prefers same-category posts, newest first, excluding self", () => {
		const related = getRelatedPosts(
			{ slug: "guia-envolver-regalos", category: "guias" },
			options,
		);
		expect(related.map((p) => p.slug)).toEqual([
			"guia-ultimo-momento",
			"guia-presupuesto",
			"guia-lista-ideal",
		]);
	});

	it("backfills from the newest posts overall when the category is thin", () => {
		const related = getRelatedPosts(
			{ slug: "checklist-baby-shower", category: "planeacion" },
			options,
		);
		expect(related).toHaveLength(3);
		expect(related.map((p) => p.slug)).not.toContain("checklist-baby-shower");
		expect(new Set(related.map((p) => p.slug)).size).toBe(3);
		expect(related.map((p) => p.slug)).toEqual([
			"nuevas-integraciones",
			"guia-ultimo-momento",
			"guia-presupuesto",
		]);
	});

	it("uses a declared `related` list outright, in order", () => {
		const related = getRelatedPosts(
			{
				slug: "guia-ultimo-momento",
				category: "guias",
				related: ["checklist-baby-shower"],
			},
			options,
		);
		expect(related.map((p) => p.slug)).toEqual(["checklist-baby-shower"]);
	});
});

describe("splitFeaturedPost", () => {
	it("hoists the featured post and excludes it from the rest", () => {
		const posts = getAllPosts({
			contentDir: FIXTURES_DIR,
			includeDrafts: false,
		});
		const { featured, rest } = splitFeaturedPost(posts);
		expect(featured?.slug).toBe("checklist-baby-shower");
		expect(rest.some((post) => post.slug === "checklist-baby-shower")).toBe(
			false,
		);
		expect(rest).toHaveLength(posts.length - 1);
	});

	it("preserves newest-first order in the remaining posts", () => {
		const posts = getAllPosts({
			contentDir: FIXTURES_DIR,
			includeDrafts: false,
		});
		const { rest } = splitFeaturedPost(posts);
		const dates = rest.map((post) => post.date.getTime());
		expect(dates).toEqual([...dates].sort((a, b) => b - a));
	});

	it("returns rest unchanged when no post is featured", () => {
		const posts = getAllPosts({
			contentDir: FIXTURES_DIR,
			includeDrafts: false,
		}).map((post) => ({ ...post, featured: false }));
		const { featured, rest } = splitFeaturedPost(posts);
		expect(featured).toBeUndefined();
		expect(rest).toHaveLength(posts.length);
	});
});
