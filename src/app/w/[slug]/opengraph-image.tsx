import { ImageResponse } from "next/og";
import { resolveTheme } from "@/config/public-themes";
import { db } from "@/server/db";
import {
	getPublishedWishlistMetadata,
	type PublicWishlistMetadataDatabase,
} from "@/server/services/public-wishlist-metadata.service";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const publicMetadataDb = db as unknown as PublicWishlistMetadataDatabase;
const MAX_COVER_BYTES = 2 * 1024 * 1024;
const COVER_TIMEOUT_MS = 1_500;

async function safeCoverImage(url: string | undefined): Promise<string | null> {
	if (!url) return null;
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), COVER_TIMEOUT_MS);
	try {
		const response = await fetch(url, { signal: controller.signal });
		const type = response.headers.get("content-type") ?? "";
		const length = Number(response.headers.get("content-length") ?? 0);
		if (
			!response.ok ||
			!type.startsWith("image/") ||
			length > MAX_COVER_BYTES
		) {
			return null;
		}
		// Consume a bounded response so a misleading Content-Length cannot make the
		// image endpoint a large remote transfer proxy.
		const body = await response.arrayBuffer();
		return body.byteLength <= MAX_COVER_BYTES ? url : null;
	} catch {
		return null;
	} finally {
		clearTimeout(timeout);
	}
}

export default async function OpenGraphImage({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;
	const wishlist = await getPublishedWishlistMetadata(publicMetadataDb, slug);
	if (!wishlist) {
		return new Response("Not found", { status: 404 });
	}

	const theme = resolveTheme(wishlist.themeId);
	const cover = await safeCoverImage(wishlist.images[0]?.url);
	return new ImageResponse(
		<div
			style={{
				background: theme.vars["--background"],
				color: theme.vars["--foreground"],
				display: "flex",
				height: "100%",
				padding: 54,
				position: "relative",
				width: "100%",
			}}
		>
			{cover && (
				// biome-ignore lint/performance/noImgElement: ImageResponse requires a direct image source.
				<img
					alt=""
					height="100%"
					src={cover}
					style={{
						borderRadius: 28,
						objectFit: "cover",
						opacity: 0.34,
						position: "absolute",
						right: 54,
						top: 54,
						width: 440,
					}}
				/>
			)}
			<div style={{ display: "flex", flexDirection: "column", maxWidth: 760 }}>
				<div
					style={{
						color: theme.vars["--primary"],
						fontSize: 36,
						fontWeight: 700,
					}}
				>
					A Wish For
				</div>
				<div
					style={{ fontSize: 30, marginTop: 96, textTransform: "uppercase" }}
				>
					{wishlist.eventType.replaceAll("_", " ")}
				</div>
				<div
					style={{
						fontSize: 72,
						fontWeight: 700,
						lineHeight: 1.06,
						marginTop: 20,
					}}
				>
					{wishlist.title.slice(0, 120)}
				</div>
			</div>
		</div>,
		size,
	);
}
