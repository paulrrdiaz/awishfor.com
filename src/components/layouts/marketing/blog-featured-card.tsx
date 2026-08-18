import Image from "next/image";

import { BLOG_CATEGORIES } from "@/config/blog-categories";
import { formatBlogIndexDate } from "@/lib/format/dates";
import type { BlogPostMeta } from "@/server/blog/types";

export function BlogFeaturedCard({ post }: { post: BlogPostMeta }) {
	const category = BLOG_CATEGORIES[post.category];

	return (
		<a
			className="m-blog-card mt-10 grid grid-cols-1 lg:grid-cols-[1.1fr_1fr]"
			href={`/blog/${post.slug}`}
		>
			<div className="relative min-h-[220px] lg:min-h-[340px]">
				{post.cover ? (
					<Image
						alt=""
						className="object-cover"
						fill
						sizes="(min-width: 1024px) 55vw, 100vw"
						src={post.cover}
					/>
				) : (
					<div
						className="m-blog-card-fallback h-full w-full text-[32px]"
						role="presentation"
					>
						🔗
					</div>
				)}
				<span
					className="absolute top-[18px] left-[18px] m-cat-badge text-[11px]"
					style={{ background: category.badgeBg, color: category.badgeFg }}
				>
					{category.label}
				</span>
			</div>
			<div className="flex flex-col justify-center p-8 lg:p-11">
				<div className="m-blog-meta mb-3 text-[11.5px]">
					{formatBlogIndexDate(post.date)} · {post.readingTime} MIN · DESTACADO
				</div>
				<div className="m-serif mb-3.5 font-semibold text-[24px] text-[var(--mink)] leading-[1.25] md:text-[31px]">
					{post.title}
				</div>
				<p className="mb-5 text-[14.5px] text-[var(--mmut)] leading-[1.65]">
					{post.excerpt}
				</p>
				<span className="font-bold text-[14px] text-[var(--mink)]">
					Leer artículo →
				</span>
			</div>
		</a>
	);
}
