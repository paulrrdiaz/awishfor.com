import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";

import { BlogRelatedCard } from "@/components/layouts/marketing/blog-related-card";
import { BlogShareControl } from "@/components/layouts/marketing/blog-share-control";
import { MarketingContainer } from "@/components/layouts/marketing/marketing-container";
import { BLOG_AUTHORS } from "@/config/blog-authors";
import { BLOG_CATEGORIES } from "@/config/blog-categories";
import { env } from "@/env";
import { formatBlogPostDate } from "@/lib/format/dates";
import {
	getAllPosts,
	getPostBySlug,
	getRelatedPosts,
} from "@/server/blog/posts";

type Props = {
	params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
	return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { slug } = await params;
	const post = getPostBySlug(slug);
	if (!post) return {};

	const canonical = new URL(
		`/blog/${post.slug}`,
		env.NEXT_PUBLIC_APP_URL,
	).toString();
	const image = post.cover
		? new URL(post.cover, env.NEXT_PUBLIC_APP_URL).toString()
		: undefined;

	return {
		title: `${post.title} · A Wish For`,
		description: post.excerpt,
		alternates: { canonical },
		openGraph: {
			type: "article",
			siteName: "A Wish For",
			title: post.title,
			description: post.excerpt,
			url: canonical,
			images: image ? [{ url: image, width: 1200, height: 630 }] : undefined,
		},
		twitter: {
			card: image ? "summary_large_image" : "summary",
			title: post.title,
			description: post.excerpt,
			images: image ? [image] : undefined,
		},
	};
}

export default async function BlogPostPage({ params }: Props) {
	const { slug } = await params;
	const post = getPostBySlug(slug);
	if (!post) notFound();

	const author = BLOG_AUTHORS[post.author];
	const category = BLOG_CATEGORIES[post.category];
	const related = getRelatedPosts(post);
	const url = new URL(`/blog/${post.slug}`, env.NEXT_PUBLIC_APP_URL).toString();

	return (
		<main>
			<MarketingContainer className="max-w-[680px] px-6 pt-14">
				<div className="mb-4 text-[#8A9187] text-[12px]">
					<span style={{ color: category.badgeBg, fontWeight: 700 }}>
						{category.label}
					</span>{" "}
					· {formatBlogPostDate(post.date)}
				</div>
				<h1 className="m-serif mb-[22px] text-pretty font-semibold text-[32px] text-[var(--mink)] leading-[1.18] md:text-[42px]">
					{post.title}
				</h1>
				<div className="mb-9 flex items-center gap-3 border-[#E7E3D8] border-b pb-8">
					<div className="m-serif flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full bg-[#D7F09E] font-semibold text-[var(--mink)]">
						{author.initial}
					</div>
					<div>
						<div className="font-semibold text-[13px] text-[var(--mink)]">
							{author.name}
						</div>
						<div className="text-[#8A9187] text-[11.5px]">
							{post.readingTime} min de lectura
						</div>
					</div>
					<div className="ml-auto flex gap-2.5">
						<BlogShareControl title={post.title} url={url} />
					</div>
				</div>
			</MarketingContainer>

			<MarketingContainer className="max-w-[680px] px-6">
				<div className="m-card overflow-hidden">
					{post.cover && (
						<div className="relative aspect-[5/2]">
							<Image
								alt=""
								className="object-cover"
								fill
								sizes="(min-width: 768px) 680px, 100vw"
								src={post.cover}
							/>
						</div>
					)}
					<div className="m-prose p-6 md:p-10">
						<MDXRemote source={post.body} />
					</div>
				</div>
			</MarketingContainer>

			<MarketingContainer className="mt-6 max-w-[680px] px-6">
				<div className="flex flex-wrap gap-2.5">
					{post.tags.map((tag) => (
						<span className="m-tag" key={tag}>
							{tag}
						</span>
					))}
				</div>
			</MarketingContainer>

			{related.length > 0 && (
				<MarketingContainer className="mt-12 max-w-[680px] border-[#E7E3D8] border-t px-6 pt-8 pb-16">
					<div className="m-eyebrow mb-[18px] text-[#9AA192]">
						Sigue leyendo
					</div>
					<div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2 lg:grid-cols-3">
						{related.map((relatedPost) => (
							<BlogRelatedCard key={relatedPost.slug} post={relatedPost} />
						))}
					</div>
				</MarketingContainer>
			)}
		</main>
	);
}
