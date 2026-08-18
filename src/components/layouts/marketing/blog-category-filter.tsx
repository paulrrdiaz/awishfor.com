"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";

import { BLOG_CATEGORIES, BLOG_CATEGORY_KEYS } from "@/config/blog-categories";
import type { BlogPostMeta } from "@/server/blog/types";
import { BlogPostCard } from "./blog-post-card";

const ALL = "todos" as const;

export function BlogCategoryFilter({
	featured,
	posts,
}: {
	/** Rendered between the filter chips and the grid, matching the design's vertical order. */
	featured?: ReactNode;
	posts: BlogPostMeta[];
}) {
	const [selected, setSelected] = useState<
		(typeof BLOG_CATEGORY_KEYS)[number] | typeof ALL
	>(ALL);

	const filtered = useMemo(
		() =>
			selected === ALL
				? posts
				: posts.filter((post) => post.category === selected),
		[posts, selected],
	);

	return (
		<div>
			<div className="mt-8 flex flex-wrap justify-center gap-2.5">
				<button
					className="m-chip"
					data-selected={selected === ALL}
					onClick={() => setSelected(ALL)}
					type="button"
				>
					Todos
				</button>
				{BLOG_CATEGORY_KEYS.map((key) => (
					<button
						className="m-chip"
						data-selected={selected === key}
						key={key}
						onClick={() => setSelected(key)}
						type="button"
					>
						{BLOG_CATEGORIES[key].label}
					</button>
				))}
			</div>

			{featured}

			<div className="mt-7 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
				{filtered.map((post) => (
					<BlogPostCard key={post.slug} post={post} />
				))}
			</div>
		</div>
	);
}
