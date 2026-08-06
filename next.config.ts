import "./src/env";

import type { NextConfig } from "next";

const config: NextConfig = {
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
};

export default config;
