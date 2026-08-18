import Image from "next/image";

import { BLOG_CATEGORIES } from "@/config/blog-categories";
import { formatBlogIndexDate } from "@/lib/format/dates";
import type { BlogPostMeta } from "@/server/blog/types";

export function BlogPostCard({ post }: { post: BlogPostMeta }) {
	const category = BLOG_CATEGORIES[post.category];

	return (
		<a className="m-blog-card block" href={`/blog/${post.slug}`}>
			<div className="relative h-[180px] overflow-hidden">
				{post.cover ? (
					<Image
						alt=""
						className="object-cover"
						fill
						sizes="(min-width: 1024px) 33vw, 100vw"
						src={post.cover}
					/>
				) : (
					<div
						className="m-blog-card-fallback h-full w-full"
						role="presentation"
					>
						🔗
					</div>
				)}
				<span
					className="absolute top-3 left-3 m-cat-badge"
					style={{ background: category.badgeBg, color: category.badgeFg }}
				>
					{category.label}
				</span>
			</div>
			<div className="p-[22px]">
				<div className="m-blog-meta mb-2 text-[10.5px]">
					{formatBlogIndexDate(post.date)} · {post.readingTime} MIN
				</div>
				<div className="m-serif mb-[7px] font-semibold text-[17px] text-[var(--mink)] leading-[1.3]">
					{post.title}
				</div>
				<p className="m-0 text-[12.5px] text-[var(--mmut)] leading-[1.6]">
					{post.excerpt}
				</p>
			</div>
		</a>
	);
}
