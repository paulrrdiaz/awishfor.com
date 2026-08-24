import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicWishlistPage } from "@/components/layouts/public-wishlist/public-wishlist-page";
import { RsvpSection } from "@/components/shared/rsvp-section";
import {
	buildPublicWishlistMetadata,
	genericPublicWishlistMetadata,
} from "@/lib/wishlist/public-metadata";
import { db } from "@/server/db";
import {
	type PublicInviteDatabase,
	resolvePersonalizedInvite,
} from "@/server/services/public-invite.service";
import {
	getPublicWishlistBySlug,
	type PublicWishlistDatabase,
} from "@/server/services/public-wishlist.service";
import {
	getPublishedWishlistMetadata,
	type PublicWishlistMetadataDatabase,
} from "@/server/services/public-wishlist-metadata.service";

const publicDb = db as unknown as PublicWishlistDatabase;
const publicInviteDb = db as unknown as PublicInviteDatabase;
const publicMetadataDb = db as unknown as PublicWishlistMetadataDatabase;

type Props = {
	params: Promise<{ slug: string; guestSlug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { slug } = await params;
	const wishlist = await getPublishedWishlistMetadata(publicMetadataDb, slug);
	return wishlist
		? buildPublicWishlistMetadata(wishlist)
		: genericPublicWishlistMetadata();
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
			analyticsRouteVariant="personalized"
			mode="full"
			rsvpSection={
				<RsvpSection
					eventDate={result.wishlist.eventDate}
					eventLocation={result.wishlist.eventLocation}
					eventTime={result.wishlist.eventTime}
					guest={inviteResult.guest}
					rsvpDeadline={result.wishlist.rsvpDeadline}
					wishlistSlug={result.wishlist.slug}
				/>
			}
			surface="standalone"
			wishlist={{ ...result.wishlist, guest: inviteResult.guest }}
		/>
	);
}
