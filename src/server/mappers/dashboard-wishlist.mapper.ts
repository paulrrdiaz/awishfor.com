import type {
	Gift,
	Invite,
	Purchase,
	Wishlist,
	WishlistImage,
} from "@/generated/prisma/client";
import type { HomeActionWishlistInput } from "@/lib/dashboard/home-actions";
import type { PublishReadinessResult } from "@/lib/wishlist/publish-readiness";
import { evaluatePublishReadiness } from "@/lib/wishlist/publish-readiness";
import { mapDashboardGift } from "@/server/mappers/dashboard-gift.mapper";
import type {
	DashboardActivityEntryViewModel,
	DashboardWishlistCardViewModel,
	DashboardWishlistOverviewViewModel,
	DashboardWishlistSummaryViewModel,
	WishlistImageViewModel,
	WishlistViewSeriesPointViewModel,
} from "@/server/mappers/view-models";
import {
	type InviteWithExtras,
	summarizeInviteEngagement,
} from "@/server/services/invite.service";
import { OWNER_MANUAL_PURCHASE_DEFAULT_NAME } from "@/server/services/purchase.service";
import {
	personIdFor,
	toEligiblePeople,
} from "@/server/services/seating.service";
import type { WishlistViewAnalytics } from "@/server/services/wishlist-view-analytics.service";

type GiftWithPurchases = Gift & { purchases: Purchase[] };
type WishlistWithGifts = Wishlist & {
	gifts: GiftWithPurchases[];
	images?: WishlistImage[];
};

function mapImages(images: WishlistImage[] = []): WishlistImageViewModel[] {
	return images.map((image) => ({
		url: image.url,
		width: image.width,
		height: image.height,
		orientation: image.orientation,
	}));
}
type PurchaseWithGiftName = Purchase & { gift: Pick<Gift, "id" | "name"> };

/**
 * Just enough of the floor plan to drive the Mesas tab badge: the table count
 * (the badge stays hidden until the host has started a plan) and the person key
 * of every assignment row, so eligibility is applied here rather than in SQL.
 */
type SeatingOverviewInput = {
	tableCount: number;
	assignments: { inviteId: string; extraGuestId: string | null }[];
};

type DashboardWishlistOverviewOptions = {
	isOwner: boolean;
	publicUrlPath: string;
	publicUrl: string;
	whatsAppUrl: string;
	readiness: PublishReadinessResult;
	recentPurchases: PurchaseWithGiftName[];
	invites: InviteWithExtras[];
	pendingInvitations: number;
	totalInvitations: number;
	totalGuests: number;
	seating: SeatingOverviewInput;
	analytics?: WishlistViewAnalytics;
	viewSeries?: WishlistViewSeriesPointViewModel[];
};

function isVisibleAndNotDeleted(gift: Gift): boolean {
	return gift.deletedAt === null && gift.visibilityStatus !== "hidden";
}

function sumPurchasedQuantity(purchases: Purchase[]): number {
	return purchases.reduce((sum, purchase) => sum + purchase.quantity, 0);
}

function getVisibleGiftAggregates(gifts: GiftWithPurchases[]) {
	const visibleGifts = gifts.filter(isVisibleAndNotDeleted);
	const totalUnits = visibleGifts.reduce(
		(sum, gift) => sum + gift.quantityNeeded,
		0,
	);
	const purchasedUnits = visibleGifts.reduce(
		(sum, gift) =>
			sum + Math.min(gift.quantityNeeded, sumPurchasedQuantity(gift.purchases)),
		0,
	);
	const purchasedGifts = visibleGifts.filter(
		(gift) => sumPurchasedQuantity(gift.purchases) >= gift.quantityNeeded,
	).length;

	return {
		visibleGifts,
		totalGiftCount: visibleGifts.length,
		availableGiftCount: visibleGifts.length - purchasedGifts,
		purchasedGifts,
		totalUnits,
		purchasedUnits,
	};
}

function purchaserIdentity(
	purchase: Pick<Purchase, "guestName" | "guestEmail" | "guestPhone">,
): string {
	return (purchase.guestEmail || purchase.guestPhone || purchase.guestName)
		.trim()
		.toLowerCase();
}

function countDistinctPurchasers(purchases: Purchase[]): number {
	return new Set(purchases.map(purchaserIdentity)).size;
}

/**
 * Purchases eligible for the conversion rate's numerator: visitor-driven
 * purchases only. Owner-recorded manual purchases aren't a visitor
 * converting, so they're excluded rather than counted as distinct
 * "purchasers" against a small unique-visitor denominator.
 */
function collectPurchasesForConversion(gifts: GiftWithPurchases[]): Purchase[] {
	return gifts
		.filter((gift) => gift.deletedAt === null)
		.flatMap((gift) => gift.purchases)
		.filter(
			(purchase) => purchase.guestName !== OWNER_MANUAL_PURCHASE_DEFAULT_NAME,
		);
}

const ACTIVITY_FEED_LIMIT = 10;

type ActivityEvent = {
	id: string;
	kind: DashboardActivityEntryViewModel["kind"];
	label: string;
	occurredAt: Date;
};

function purchaserLabel(purchase: PurchaseWithGiftName): string {
	return purchase.guestName === OWNER_MANUAL_PURCHASE_DEFAULT_NAME
		? "Alguien"
		: purchase.guestName;
}

function buildActivityFeed({
	invites,
	purchases,
}: {
	invites: InviteWithExtras[];
	purchases: PurchaseWithGiftName[];
}): DashboardActivityEntryViewModel[] {
	const events: ActivityEvent[] = [];

	for (const invite of invites) {
		if (invite.respondedAt) {
			events.push({
				id: `rsvp-${invite.id}`,
				kind: "rsvp",
				label:
					invite.status === "confirmed"
						? `${invite.primaryName} confirmó su asistencia`
						: `${invite.primaryName} no podrá asistir`,
				occurredAt: invite.respondedAt,
			});
		}
		if (invite.openedAt) {
			events.push({
				id: `opened-${invite.id}`,
				kind: "invite_opened",
				label: `${invite.primaryName} abrió su invitación`,
				occurredAt: invite.openedAt,
			});
		}
	}

	for (const purchase of purchases) {
		events.push({
			id: `purchase-${purchase.id}`,
			kind: "purchase",
			label: `${purchaserLabel(purchase)} marcó «${purchase.gift.name}» como comprado`,
			occurredAt: purchase.createdAt,
		});
	}

	return events
		.sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime())
		.slice(0, ACTIVITY_FEED_LIMIT)
		.map(({ id, kind, label, occurredAt }) => ({
			id,
			kind,
			label,
			occurredAt: occurredAt.toISOString(),
		}));
}

export function mapDashboardWishlist(
	wishlist: WishlistWithGifts,
): DashboardWishlistCardViewModel {
	const visibleGiftCount = wishlist.gifts.filter(isVisibleAndNotDeleted).length;

	return {
		id: wishlist.id,
		slug: wishlist.slug,
		title: wishlist.title,
		subtitle: wishlist.subtitle,
		eventType: wishlist.eventType,
		language: wishlist.language,
		currency: wishlist.currency,
		welcomeMessage: wishlist.welcomeMessage,
		welcomeMessageAttribution: wishlist.welcomeMessageAttribution,
		thankYouMessage: wishlist.thankYouMessage,
		giftListMessage: wishlist.giftListMessage,
		eventDate: wishlist.eventDate?.toISOString() ?? null,
		eventTime: wishlist.eventTime,
		endTime: wishlist.endTime,
		eventLocation: wishlist.eventLocation,
		dressCode: wishlist.dressCode,
		images: mapImages(wishlist.images),
		themeId: wishlist.themeId,
		layoutId: wishlist.layoutId,
		buttonStyle: wishlist.buttonStyle,
		headingFont: wishlist.headingFont,
		bodyFont: wishlist.bodyFont,
		countdownVariant: wishlist.countdownVariant,
		welcomeMessageVariant: wishlist.welcomeMessageVariant,
		thankYouMessageVariant: wishlist.thankYouMessageVariant,
		showHowItWorks: wishlist.showHowItWorks,
		status: wishlist.status,
		visibleGiftCount,
		gifts: wishlist.gifts.map(mapDashboardGift),
		publishedAt: wishlist.publishedAt?.toISOString() ?? null,
		archivedAt: wishlist.archivedAt?.toISOString() ?? null,
		createdAt: wishlist.createdAt.toISOString(),
		updatedAt: wishlist.updatedAt.toISOString(),
	};
}

export function mapDashboardWishlistSummary(
	wishlist: WishlistWithGifts,
): DashboardWishlistSummaryViewModel {
	const aggregates = getVisibleGiftAggregates(wishlist.gifts);

	return {
		id: wishlist.id,
		slug: wishlist.slug,
		title: wishlist.title,
		subtitle: wishlist.subtitle,
		eventType: wishlist.eventType,
		status: wishlist.status,
		eventDate: wishlist.eventDate?.toISOString() ?? null,
		totalUnits: aggregates.totalUnits,
		purchasedUnits: aggregates.purchasedUnits,
		availableGiftCount: aggregates.availableGiftCount,
		totalGiftCount: aggregates.totalGiftCount,
		createdAt: wishlist.createdAt.toISOString(),
	};
}

type WishlistWithHomeData = WishlistWithGifts & {
	invites: Pick<Invite, "status">[];
	_count: { images: number };
};

export function mapDashboardHomeWishlist(
	wishlist: WishlistWithHomeData,
	{ isOwner, ownerName }: { isOwner: boolean; ownerName: string | null },
): HomeActionWishlistInput {
	const visibleGiftCount = wishlist.gifts.filter(isVisibleAndNotDeleted).length;
	const readiness = evaluatePublishReadiness({
		title: wishlist.title,
		eventType: wishlist.eventType,
		slug: wishlist.slug,
		language: wishlist.language,
		currency: wishlist.currency,
		visibleGiftCount,
		layoutId: wishlist.layoutId,
		imageCount: wishlist._count.images,
	});
	const pendingInvites = wishlist.invites.filter(
		(invite) => invite.status === "pending",
	).length;

	return {
		id: wishlist.id,
		title: wishlist.title,
		status: wishlist.status,
		isOwner,
		ownerName: isOwner ? null : ownerName,
		eventDate: wishlist.eventDate?.toISOString() ?? null,
		rsvpDeadline: wishlist.rsvpDeadline?.toISOString() ?? null,
		createdAt: wishlist.createdAt.toISOString(),
		pendingInvites,
		totalInvites: wishlist.invites.length,
		readiness,
	};
}

export function mapDashboardWishlistOverview(
	wishlist: WishlistWithGifts,
	{
		isOwner,
		publicUrlPath,
		publicUrl,
		whatsAppUrl,
		readiness,
		recentPurchases,
		invites,
		pendingInvitations,
		totalInvitations,
		totalGuests,
		seating,
		analytics,
		viewSeries,
	}: DashboardWishlistOverviewOptions,
): DashboardWishlistOverviewViewModel {
	const aggregates = getVisibleGiftAggregates(wishlist.gifts);
	const engagement = summarizeInviteEngagement(invites);
	const unseatedGuests = countUnseatedGuests(invites, seating);
	const conversionRate =
		isOwner && analytics && analytics.uniqueVisitors > 0
			? Math.min(
					1,
					countDistinctPurchasers(
						collectPurchasesForConversion(wishlist.gifts),
					) / analytics.uniqueVisitors,
				)
			: undefined;

	return {
		id: wishlist.id,
		isOwner,
		slug: wishlist.slug,
		title: wishlist.title,
		subtitle: wishlist.subtitle,
		eventType: wishlist.eventType,
		language: wishlist.language,
		status: wishlist.status,
		publicUrlPath,
		publicUrl,
		whatsAppUrl,
		metrics: {
			totalGifts: aggregates.totalGiftCount,
			availableGifts: aggregates.availableGiftCount,
			purchasedGifts: aggregates.purchasedGifts,
			totalUnits: aggregates.totalUnits,
			purchasedUnits: aggregates.purchasedUnits,
			pendingInvitations,
			totalInvitations,
			totalGuests,
			confirmedGuests: engagement.confirmedGuests,
			declinedGuests: engagement.declinedGuests,
			pendingGuests: engagement.pendingGuests,
			openedInvitations: engagement.openedInvitations,
			unopenedInvitations: engagement.unopenedInvitations,
			seatingTables: seating.tableCount,
			unseatedGuests,
			...(isOwner && analytics
				? {
						latestViewAt: analytics.latestViewAt?.toISOString() ?? null,
						totalViews: analytics.totalViews,
						uniqueVisitors: analytics.uniqueVisitors,
						...(conversionRate !== undefined ? { conversionRate } : {}),
					}
				: {}),
		},
		readiness,
		activity: buildActivityFeed({ invites, purchases: recentPurchases }),
		...(isOwner && viewSeries ? { viewSeries } : {}),
	};
}

/**
 * Eligible people (an RSVP of `declined` drops the person, and a declined
 * invitation drops its whole party) who have no assignment row. An assignment
 * belonging to somebody no longer eligible is ignored, not counted as a seat.
 */
function countUnseatedGuests(
	invites: InviteWithExtras[],
	seating: SeatingOverviewInput,
): number {
	const seated = new Set(
		seating.assignments.map((assignment) =>
			personIdFor(assignment.inviteId, assignment.extraGuestId),
		),
	);
	return toEligiblePeople(invites).filter(
		(person) => !seated.has(person.personId),
	).length;
}
