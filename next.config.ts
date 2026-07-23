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
		],
	},
	async headers() {
		return [
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
