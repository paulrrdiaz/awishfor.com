import "./src/env";

import type { NextConfig } from "next";

const config: NextConfig = {
	// "immediate" gives revalidateTag/updateTag callers a way to force a hard,
	// synchronous cache expiration outside Server Actions. Next's built-in
	// "max" profile is for long-lived content (1yr expire / 30d revalidate)
	// and only marks tags stale, not expired — wrong for post-mutation
	// invalidation, which needs the cached entry gone immediately.
	cacheLife: {
		immediate: {
			stale: 0,
			revalidate: 0,
			expire: 0,
		},
	},
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "picsum.photos",
			},
			{
				protocol: "https",
				hostname: "images.unsplash.com",
			},
			{
				protocol: "https",
				hostname: "utfs.io",
			},
			{
				protocol: "https",
				hostname: "**.ufs.sh",
			},
			{
				protocol: "https",
				hostname: "infanti.com.pe",
			},
			{
				protocol: "http",
				hostname: "infanti.com.pe",
			},
			{
				protocol: "https",
				hostname: "media.falabella.com",
			},
			{
				protocol: "https",
				hostname: "images.**.buscalibre.com",
			},
			{
				protocol: "https",
				hostname: "carestino.cc",
			},
			{
				protocol: "https",
				hostname: "www.maternelle.pe",
			},
			{
				protocol: "https",
				hostname: "nua.pe",
			},
			{
				protocol: "http",
				hostname: "nua.pe",
			},
			{
				protocol: "https",
				hostname: "www.mellowthebabybrand.com",
			},
			{
				protocol: "https",
				hostname: "www.rikury.pe",
			},
			{
				protocol: "https",
				hostname: "petitpima.com.pe",
			},
			{
				protocol: "https",
				hostname: "babyloli.pe",
			},
			{
				protocol: "https",
				hostname: "bamboobalance.pe",
			},
			{
				protocol: "https",
				hostname: "versatino.com",
			},
			{
				protocol: "https",
				hostname: "rimage.ripley.com.pe",
			},
		],
	},
	async headers() {
		return [
			{
				source: "/",
				headers: [
					{
						key: "Link",
						value:
							'</assets/hero/wedding-hero-mobile-300.jpg>; rel=preload; as=image; fetchpriority=high; media="(max-width: 1023px)", </assets/hero/wedding-hero.jpg>; rel=preload; as=image; fetchpriority=high; media="(min-width: 1024px)"',
					},
				],
			},
			{
				source: "/(.*)",
				headers: [
					{ key: "X-Frame-Options", value: "DENY" },
					{ key: "X-Content-Type-Options", value: "nosniff" },
					{
						key: "Referrer-Policy",
						value: "strict-origin-when-cross-origin",
					},
					{
						key: "Permissions-Policy",
						value: "camera=(), microphone=(), geolocation=()",
					},
				],
			},
		];
	},
	async rewrites() {
		return {
			beforeFiles: [
				{
					source: "/ingest/static/:path*",
					destination: "https://us-assets.i.posthog.com/static/:path*",
				},
				{
					source: "/ingest/:path*",
					destination: "https://us.i.posthog.com/:path*",
				},
			],
		};
	},
};

export default config;
