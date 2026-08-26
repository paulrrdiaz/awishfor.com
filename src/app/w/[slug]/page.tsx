import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { PublicWishlistPage } from "@/components/layouts/public-wishlist/public-wishlist-page";
import {
	buildPublicWishlistMetadata,
	genericPublicWishlistMetadata,
} from "@/lib/wishlist/public-metadata";
import { db } from "@/server/db";
import {
	getPublicWishlistBySlug,
	type PublicWishlistDatabase,
} from "@/server/services/public-wishlist.service";
import {
	getPublishedWishlistMetadata,
	type PublicWishlistMetadataDatabase,
} from "@/server/services/public-wishlist-metadata.service";
import { createWishlistViewAuthorization } from "@/server/services/wishlist-view-analytics.service";

// db.wishlist.findUnique is generic; the port type encodes the include shape
// used at runtime. The cast is safe: the service always calls findUnique with
// the include args that produce WishlistPublicRow.
const publicDb = db as unknown as PublicWishlistDatabase;
const publicMetadataDb = db as unknown as PublicWishlistMetadataDatabase;

type Props = {
	params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { slug } = await params;
	const wishlist = await getPublishedWishlistMetadata(publicMetadataDb, slug);
	return wishlist
		? buildPublicWishlistMetadata(wishlist)
		: genericPublicWishlistMetadata();
}

export default async function WishlistSlugPage({ params }: Props) {
	const { slug } = await params;
	let result = await getPublicWishlistBySlug(publicDb, {
		slug,
		viewerClerkId: null,
	});

	// Published pages never need viewer identity. Only pay Clerk's request cost
	// after an anonymous miss, where an owner may be opening a draft preview.
	if (result.kind === "notFound") {
		const cookieStore = await cookies();
		const hasSessionCookie = cookieStore
			.getAll()
			.some((cookie) => cookie.name.startsWith("__session") && cookie.value);
		if (hasSessionCookie) {
			const { auth } = await import("@clerk/nextjs/server");
			const { userId } = await auth();
			if (userId) {
				result = await getPublicWishlistBySlug(publicDb, {
					slug,
					viewerClerkId: userId,
				});
			}
		}
	}

	if (result.kind === "notFound") {
		notFound();
	}

	if (result.kind === "archived") {
		return (
			<main className="flex min-h-svh flex-col items-center justify-center p-8">
				<h1 className="font-semibold text-2xl">{result.archived.title}</h1>
				<p className="mt-6 text-muted-foreground">
					Esta lista ya no está disponible.
				</p>
			</main>
		);
	}

	const { wishlist } = result;
	const mode = result.kind === "preview" ? "preview" : "full";
	const viewAuthorization =
		result.kind === "published"
			? createWishlistViewAuthorization({ wishlistId: wishlist.id })
			: undefined;

	return (
		<PublicWishlistPage
			mode={mode}
			surface="standalone"
			viewAuthorization={viewAuthorization}
			wishlist={wishlist}
		/>
	);
}
