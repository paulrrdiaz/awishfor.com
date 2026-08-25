import { ImageResponse } from "next/og";
import type { ReactElement } from "react";
import { resolveTheme, type ThemePreset } from "@/config/public-themes";
import { encodeSocialImage } from "@/lib/wishlist/social-image-jpeg";
import { db } from "@/server/db";
import {
	getPublishedWishlistMetadata,
	type PublicWishlistMetadataDatabase,
	type PublishedWishlistMetadataProjection,
} from "@/server/services/public-wishlist-metadata.service";

export const size = { width: 1200, height: 630 };
export const contentType = "image/jpeg";

const publicMetadataDb = db as unknown as PublicWishlistMetadataDatabase;
const COVER_EXISTENCE_TIMEOUT_MS = 800;
// Measured against a real ~2MB UploadThing-hosted cover photo: ~674ms cold,
// ~350-375ms warm end-to-end fetch+rasterize. 1.5s keeps headroom over cold
// starts while staying well under typical social-crawler fetch budgets.
const HERO_RENDER_TIMEOUT_MS = 1_500;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
	return new Promise<T>((resolve, reject) => {
		const timer = setTimeout(() => reject(new Error("timeout")), ms);
		promise.then(
			(value) => {
				clearTimeout(timer);
				resolve(value);
			},
			(error) => {
				clearTimeout(timer);
				reject(error);
			},
		);
	});
}

/**
 * `ImageResponse` (Satori) can silently skip an unreachable `<img>` instead of
 * throwing, so a broken cover URL can't be caught by wrapping the render in
 * try/catch alone. A HEAD-only check (no body buffering) rules that out before
 * the hero composition is attempted.
 */
async function coverImageIsReachable(url: string): Promise<boolean> {
	const controller = new AbortController();
	const timeout = setTimeout(
		() => controller.abort(),
		COVER_EXISTENCE_TIMEOUT_MS,
	);
	try {
		const response = await fetch(url, {
			method: "HEAD",
			signal: controller.signal,
		});
		return response.ok;
	} catch {
		return false;
	} finally {
		clearTimeout(timeout);
	}
}

function IdentityBadge({ theme }: { theme: ThemePreset }) {
	return (
		<div
			style={{
				background: theme.vars["--primary"],
				borderRadius: 999,
				color: theme.vars["--primary-foreground"],
				display: "flex",
				fontSize: 24,
				fontWeight: 700,
				left: 40,
				padding: "10px 22px",
				position: "absolute",
				top: 40,
			}}
		>
			A Wish For
		</div>
	);
}

function heroComposition(
	coverUrl: string,
	wishlist: PublishedWishlistMetadataProjection,
	theme: ThemePreset,
) {
	return (
		<div
			style={{
				display: "flex",
				height: "100%",
				position: "relative",
				width: "100%",
			}}
		>
			{/* biome-ignore lint/performance/noImgElement: ImageResponse requires a direct image source. */}
			<img
				alt=""
				src={coverUrl}
				style={{
					height: 630,
					left: 0,
					objectFit: "cover",
					position: "absolute",
					top: 0,
					width: 1200,
				}}
			/>
			<div
				style={{
					backgroundImage:
						"linear-gradient(180deg, rgba(0,0,0,0) 30%, rgba(0,0,0,0.82) 100%)",
					display: "flex",
					height: "100%",
					position: "absolute",
					width: "100%",
				}}
			/>
			<IdentityBadge theme={theme} />
			<div
				style={{
					bottom: 54,
					color: "#ffffff",
					display: "flex",
					flexDirection: "column",
					left: 54,
					position: "absolute",
					right: 54,
				}}
			>
				<div
					style={{ fontSize: 26, opacity: 0.88, textTransform: "uppercase" }}
				>
					{wishlist.eventType.replaceAll("_", " ")}
				</div>
				<div
					style={{
						fontSize: 64,
						fontWeight: 700,
						lineHeight: 1.08,
						marginTop: 14,
					}}
				>
					{wishlist.title.slice(0, 120)}
				</div>
			</div>
		</div>
	);
}

function fallbackComposition(
	wishlist: PublishedWishlistMetadataProjection,
	theme: ThemePreset,
) {
	return (
		<div
			style={{
				background: theme.vars["--background"],
				color: theme.vars["--foreground"],
				display: "flex",
				height: "100%",
				position: "relative",
				width: "100%",
			}}
		>
			<IdentityBadge theme={theme} />
			<div
				style={{
					bottom: 54,
					display: "flex",
					flexDirection: "column",
					left: 54,
					position: "absolute",
					right: 54,
				}}
			>
				<div
					style={{
						color: theme.vars["--muted-foreground"],
						fontSize: 26,
						textTransform: "uppercase",
					}}
				>
					{wishlist.eventType.replaceAll("_", " ")}
				</div>
				<div
					style={{
						fontSize: 64,
						fontWeight: 700,
						lineHeight: 1.08,
						marginTop: 14,
					}}
				>
					{wishlist.title.slice(0, 120)}
				</div>
			</div>
		</div>
	);
}

async function renderJpegComposition(
	composition: ReactElement,
	timeoutMs?: number,
): Promise<Response> {
	const response = new ImageResponse(composition, size);
	const png = timeoutMs
		? await withTimeout(response.arrayBuffer(), timeoutMs)
		: await response.arrayBuffer();
	const jpeg = await encodeSocialImage(png);
	const headers = new Headers(response.headers);
	headers.set("content-length", String(jpeg.byteLength));
	headers.set("content-type", contentType);
	return new Response(Uint8Array.from(jpeg), {
		headers,
		status: response.status,
	});
}

/** Renders the hero fully (bounded) so failures can fall back before headers are sent. */
async function renderHeroComposition(
	coverUrl: string,
	wishlist: PublishedWishlistMetadataProjection,
	theme: ThemePreset,
): Promise<Response | null> {
	try {
		return await renderJpegComposition(
			heroComposition(coverUrl, wishlist, theme),
			HERO_RENDER_TIMEOUT_MS,
		);
	} catch {
		return null;
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
	const coverUrl = wishlist.images[0]?.url;

	if (coverUrl && (await coverImageIsReachable(coverUrl))) {
		const hero = await renderHeroComposition(coverUrl, wishlist, theme);
		if (hero) return hero;
	}

	return renderJpegComposition(fallbackComposition(wishlist, theme));
}
