import type { Metadata } from "next";

import { BlogCategoryFilter } from "@/components/layouts/marketing/blog-category-filter";
import { BlogFeaturedCard } from "@/components/layouts/marketing/blog-featured-card";
import { MarketingContainer } from "@/components/layouts/marketing/marketing-container";
import { getAllPosts, splitFeaturedPost } from "@/server/blog/posts";

export const metadata: Metadata = {
	title: "Blog · A Wish For — Ideas para celebrar bien",
	description:
		"Guías de regalos, tips de planeación y novedades del producto, directo a tu buena vibra.",
};

export default function BlogIndexPage() {
	const { featured, rest } = splitFeaturedPost(getAllPosts());

	return (
		<main>
			<div className="px-5 pt-16 pb-1 text-center md:px-11">
				<div className="m-eyebrow mb-3">El blog de A Wish For</div>
				<h1 className="m-serif mb-3 font-semibold text-[32px] text-[var(--mink)] md:text-[44px]">
					Ideas para celebrar bien
				</h1>
				<p className="mx-auto max-w-[520px] text-[15.5px] text-[var(--mmut)]">
					Guías de regalos, tips de planeación y novedades del producto, directo
					a tu buena vibra.
				</p>
			</div>

			<MarketingContainer className="px-5 pt-10 md:px-11">
				<BlogCategoryFilter
					featured={featured && <BlogFeaturedCard post={featured} />}
					posts={rest}
				/>
			</MarketingContainer>
		</main>
	);
}
