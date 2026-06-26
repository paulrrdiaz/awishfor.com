import { auth } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/server/db";
import {
	getPublicWishlistBySlug,
	type PublicWishlistDatabase,
} from "@/server/services/public-wishlist.service";

// db.wishlist.findUnique is generic; the port type encodes the include shape
// used at runtime. The cast is safe: the service always calls findUnique with
// the include args that produce WishlistPublicRow.
const publicDb = db as unknown as PublicWishlistDatabase;

type Props = {
	params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { slug } = await params;
	const { userId } = await auth();
	const result = await getPublicWishlistBySlug(publicDb, {
		slug,
		viewerClerkId: userId,
	});

	const title =
		result.kind === "published" || result.kind === "preview"
			? result.wishlist.title
			: result.kind === "archived"
				? result.archived.title
				: "Lista no encontrada";

	const description =
		result.kind === "published" || result.kind === "preview"
			? (result.wishlist.welcomeMessage ?? result.wishlist.title)
			: undefined;

	return {
		title,
		description,
		robots: { index: false, follow: false },
	};
}

export default async function PublicWishlistPage({ params }: Props) {
	const { slug } = await params;
	const { userId } = await auth();
	const result = await getPublicWishlistBySlug(publicDb, {
		slug,
		viewerClerkId: userId,
	});

	if (result.kind === "notFound") {
		notFound();
	}

	if (result.kind === "archived") {
		return (
			<main className="flex min-h-svh flex-col items-center justify-center p-8">
				<h1 className="font-semibold text-2xl">{result.archived.title}</h1>
				{result.archived.displayName && (
					<p className="mt-2 text-muted-foreground">
						{result.archived.displayName}
					</p>
				)}
				<p className="mt-6 text-muted-foreground">
					Esta lista ya no está disponible.
				</p>
			</main>
		);
	}

	const { wishlist } = result;
	const isPreview = result.kind === "preview";

	return (
		<main className="flex min-h-svh flex-col">
			{isPreview && (
				<div className="bg-yellow-50 px-6 py-3 text-center text-sm text-yellow-800">
					Vista previa — esta lista aún no es pública
				</div>
			)}
			<div className="flex flex-col items-center p-8">
				<h1 className="font-semibold text-2xl">{wishlist.title}</h1>
				{wishlist.displayName && (
					<p className="mt-2 text-muted-foreground">{wishlist.displayName}</p>
				)}
				{wishlist.welcomeMessage && (
					<p className="mt-4 text-center">{wishlist.welcomeMessage}</p>
				)}
			</div>
		</main>
	);
}
