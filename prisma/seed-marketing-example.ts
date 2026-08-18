/**
 * Creates the published marketing example at /w/esperando-a-mateo.
 *
 * Run with a DATABASE_URL for the target environment:
 *   pnpm seed:marketing-example
 *
 * The script owns only the dedicated demo user and wishlist. It is idempotent:
 * repeat runs replace the example's related records, retaining the same slug
 * and public content. It stops rather than overwriting a wishlist with this
 * slug when that wishlist belongs to a different owner.
 */

import { DEMO_WISHLIST } from "../src/config/demo-wishlist";
import {
	type Currency,
	type EventType,
	type GiftPriority,
	type ImageOrientation,
	type Locale,
	WishlistStatus,
} from "../src/generated/prisma/client";
import { createSeedClient } from "./seed/client";

const DEMO_OWNER = {
	clerkId: "seed_demo_marketing_example",
	email: "demo-marketing@awishfor.invalid",
	name: "A Wish For demo",
};

function asDate(value: string | null): Date | null {
	return value ? new Date(value) : null;
}

async function main() {
	const db = createSeedClient();

	try {
		const owner = await db.user.upsert({
			where: { clerkId: DEMO_OWNER.clerkId },
			create: DEMO_OWNER,
			update: { name: DEMO_OWNER.name },
		});
		const existing = await db.wishlist.findUnique({
			where: { slug: DEMO_WISHLIST.slug },
		});

		if (existing && existing.ownerId !== owner.id) {
			throw new Error(
				`Cannot seed /w/${DEMO_WISHLIST.slug}: its slug belongs to another user.`,
			);
		}

		const wishlistData = {
			title: DEMO_WISHLIST.title,
			eventType: DEMO_WISHLIST.eventType as EventType,
			language: DEMO_WISHLIST.language as Locale,
			currency: DEMO_WISHLIST.currency as Currency,
			welcomeMessage: DEMO_WISHLIST.welcomeMessage,
			welcomeMessageAttribution: DEMO_WISHLIST.welcomeMessageAttribution,
			thankYouMessage: DEMO_WISHLIST.thankYouMessage,
			eventDate: asDate(DEMO_WISHLIST.eventDate),
			eventTime: DEMO_WISHLIST.eventTime,
			rsvpDeadline: asDate(DEMO_WISHLIST.rsvpDeadline),
			eventLocation: DEMO_WISHLIST.eventLocation,
			dressCode: DEMO_WISHLIST.dressCode,
			deliveryRecipientName: DEMO_WISHLIST.deliveryRecipientName,
			deliveryDocumentId: DEMO_WISHLIST.deliveryDocumentId,
			deliveryAddress: DEMO_WISHLIST.deliveryAddress,
			deliveryPhone: DEMO_WISHLIST.deliveryPhone,
			themeId: DEMO_WISHLIST.themeId,
			layoutId: DEMO_WISHLIST.layoutId,
			buttonStyle: DEMO_WISHLIST.buttonStyle,
			headingFont: DEMO_WISHLIST.headingFont,
			bodyFont: DEMO_WISHLIST.bodyFont,
			countdownVariant: DEMO_WISHLIST.countdownVariant,
			welcomeMessageVariant: DEMO_WISHLIST.welcomeMessageVariant,
			thankYouMessageVariant: DEMO_WISHLIST.thankYouMessageVariant,
			motifId: DEMO_WISHLIST.motifId,
			motifTreatment: DEMO_WISHLIST.motifTreatment,
			motifPalette: DEMO_WISHLIST.motifPalette,
			showHowItWorks: DEMO_WISHLIST.showHowItWorks,
			status: WishlistStatus.published,
			publishedAt: new Date(),
			archivedAt: null,
		};

		const wishlist = existing
			? await db.wishlist.update({
					where: { id: existing.id },
					data: wishlistData,
				})
			: await db.wishlist.create({
					data: {
						ownerId: owner.id,
						slug: DEMO_WISHLIST.slug,
						...wishlistData,
					},
				});

		await db.purchase.deleteMany({
			where: { gift: { wishlistId: wishlist.id } },
		});
		await db.gift.deleteMany({ where: { wishlistId: wishlist.id } });
		await db.category.deleteMany({ where: { wishlistId: wishlist.id } });
		await db.wishlistImage.deleteMany({ where: { wishlistId: wishlist.id } });

		await db.wishlistImage.createMany({
			data: DEMO_WISHLIST.images.map((image, sortOrder) => ({
				wishlistId: wishlist.id,
				url: image.url,
				width: image.width,
				height: image.height,
				orientation: image.orientation as ImageOrientation,
				sortOrder,
			})),
		});

		const categoryIds = new Map<string, string>();
		for (const category of DEMO_WISHLIST.categories) {
			const created = await db.category.create({
				data: {
					wishlistId: wishlist.id,
					name: category.name,
					sortOrder: category.sortOrder,
				},
			});
			categoryIds.set(category.id, created.id);
		}

		for (const gift of DEMO_WISHLIST.gifts) {
			const created = await db.gift.create({
				data: {
					wishlistId: wishlist.id,
					categoryId: gift.categoryId
						? (categoryIds.get(gift.categoryId) ?? null)
						: null,
					name: gift.name,
					productUrl: gift.productUrl,
					imageUrl: gift.imageUrl,
					storeName: gift.storeName,
					priceAmount: gift.priceAmount ? Number(gift.priceAmount) : null,
					priceCurrency: gift.priceCurrency as Currency | null,
					quantityNeeded: gift.quantityNeeded,
					priority: gift.priority as GiftPriority,
					publicNote: gift.publicNote,
					sortOrder: gift.sortOrder,
				},
			});
			const purchasedQuantity = gift.quantityNeeded - gift.remainingQuantity;
			if (purchasedQuantity > 0) {
				await db.purchase.create({
					data: {
						giftId: created.id,
						guestName: "Invitado del ejemplo",
						quantity: purchasedQuantity,
					},
				});
			}
		}

		console.log(
			`✓ Seeded published marketing example: /w/${DEMO_WISHLIST.slug}`,
		);
	} finally {
		await db.$disconnect();
	}
}

main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
