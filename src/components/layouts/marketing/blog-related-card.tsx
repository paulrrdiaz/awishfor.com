import Image from "next/image";

import type { BlogPostMeta } from "@/server/blog/types";

export function BlogRelatedCard({ post }: { post: BlogPostMeta }) {
	return (
		<a className="m-related-card" href={`/blog/${post.slug}`}>
			<div className="relative h-[110px] overflow-hidden">
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
						className="m-blog-card-fallback h-full w-full text-2xl"
						role="presentation"
					>
						🔗
					</div>
				)}
			</div>
			<div className="p-4">
				<div className="m-serif font-semibold text-[14px] text-[var(--mink)] leading-[1.35]">
					{post.title}
				</div>
			</div>
		</a>
	);
}
