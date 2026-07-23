import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicWishlistPage } from "@/components/layouts/public-wishlist/public-wishlist-page";
import { db } from "@/server/db";
import {
	type PublicInviteDatabase,
	resolvePersonalizedInvite,
} from "@/server/services/public-invite.service";
import {
	getPublicWishlistBySlug,
	type PublicWishlistDatabase,
} from "@/server/services/public-wishlist.service";

const publicDb = db as unknown as PublicWishlistDatabase;
const publicInviteDb = db as unknown as PublicInviteDatabase;

type Props = {
	params: Promise<{ slug: string; guestSlug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { slug } = await params;
	const result = await getPublicWishlistBySlug(publicDb, {
		slug,
		viewerClerkId: null,
	});

	const title =
		result.kind === "published" ? result.wishlist.title : "Lista no encontrada";

	return {
		title,
		robots: { index: false, follow: false },
	};
}

export default async function PersonalizedWishlistPage({ params }: Props) {
	const { slug, guestSlug } = await params;
	const result = await getPublicWishlistBySlug(publicDb, {
		slug,
		viewerClerkId: null,
	});

	if (result.kind !== "published") {
		notFound();
	}

	const inviteResult = await resolvePersonalizedInvite(publicInviteDb, {
		wishlistId: result.wishlist.id,
		guestSlug,
	});

	if (inviteResult.kind === "notFound") {
		notFound();
	}

	return (
		<PublicWishlistPage
			mode="full"
			wishlist={{ ...result.wishlist, guest: inviteResult.guest }}
		/>
	);
}
