import type { MetadataRoute } from "next";
import { env } from "@/env";
import { getAllPosts } from "@/server/blog/posts";

/**
 * Covers the public marketing surface only. `/w/[slug]` public wishlists are
 * deliberately `noindex` and excluded, along with dashboard, auth, and API routes.
 */
export default function sitemap(): MetadataRoute.Sitemap {
	const base = env.NEXT_PUBLIC_APP_URL;
	const staticRoutes: MetadataRoute.Sitemap = [
		{ url: new URL("/", base).toString(), changeFrequency: "weekly" },
		{ url: new URL("/create", base).toString(), changeFrequency: "monthly" },
		{ url: new URL("/blog", base).toString(), changeFrequency: "weekly" },
		{ url: new URL("/terms", base).toString(), changeFrequency: "yearly" },
		{ url: new URL("/privacy", base).toString(), changeFrequency: "yearly" },
	];

	const postRoutes: MetadataRoute.Sitemap = getAllPosts().map((post) => ({
		url: new URL(`/blog/${post.slug}`, base).toString(),
		lastModified: post.date,
		changeFrequency: "monthly",
	}));

	return [...staticRoutes, ...postRoutes];
}
