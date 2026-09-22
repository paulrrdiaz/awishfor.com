import type { ImageOrientation } from "@/config/public-layouts";
import type { PublishReadinessChecks } from "@/lib/wishlist/publish-readiness";
import type { GiftPublicStatus } from "@/server/services/purchase.service";

export type WishlistImageViewModel = {
	url: string;
	width: number;
	height: number;
	orientation: ImageOrientation;
	/**
	 * Set only by wizard/dashboard preview compositing (`draftToPreview`) to
	 * mark a placeholder sample image. Never set for persisted images, so it
	 * is always absent on a published page.
	 */
	isSample?: boolean;
};

export type PublicWishlistProgress = {
	availableGiftCount: number;
	purchasedUnits: number;
	totalUnits: number;
};

export type PublicGiftViewModel = {
	id: string;
	name: string;
	productUrl: string | null;
	imageUrl: string | null;
	storeName: string | null;
	priceAmount: string | null;
	priceCurrency: string | null;
	quantityNeeded: number;
	priority: string;
	publicNote: string | null;
	sortOrder: number;
	categoryId: string | null;
	status: GiftPublicStatus;
	remainingQuantity: number;
};

export type PublicCategoryViewModel = {
	id: string;
	name: string;
	sortOrder: number;
};

export type PublicGuestExtraGuestViewModel = {
	id: string;
	name: string | null;
	status: string;
};

export type PublicGuestViewModel = {
	slug: string;
	primaryName: string;
	extraGuests: PublicGuestExtraGuestViewModel[];
	status: string;
	responseSource?: string | null;
	responseLockedAt?: string | null;
};

export type PublicContributorsViewModel = {
	count: number;
	initials: string[];
};

export type PublicWishlistViewModel = {
	id: string;
	slug: string;
	title: string;
	hostName?: string | null;
	subtitle: string | null;
	eventType: string;
	language: string;
	currency: string;
	welcomeMessage: string;
	welcomeMessageAttribution: string | null;
	thankYouMessage: string | null;
	giftListMessage: string | null;
	eventDate: string | null;
	eventTime: string | null;
	endTime: string | null;
	rsvpDeadline: string | null;
	eventLocation: string | null;
	dressCode: string | null;
	deliveryRecipientName: string | null;
	deliveryDocumentId: string | null;
	deliveryAddress: string | null;
	deliveryPhone: string | null;
	images: WishlistImageViewModel[];
	themeId: string | null;
	layoutId: string | null;
	buttonStyle: string | null;
	headingFont: string | null;
	bodyFont: string | null;
	countdownVariant: string | null;
	welcomeMessageVariant: string | null;
	thankYouMessageVariant: string | null;
	motifId: string | null;
	motifTreatment: string | null;
	motifPalette: string | null;
	showHowItWorks: boolean;
	categories: PublicCategoryViewModel[];
	gifts: PublicGiftViewModel[];
	progress: PublicWishlistProgress;
	contributors: PublicContributorsViewModel;
	createdAt: string;
	guest?: PublicGuestViewModel;
};

export type DashboardGiftRowViewModel = {
	id: string;
	name: string;
	productUrl: string | null;
	imageUrl: string | null;
	storeName: string | null;
	size: string | null;
	priceAmount: string | null;
	priceCurrency: string | null;
	quantityNeeded: number;
	purchasedQuantity: number;
	remainingQuantity: number;
	priority: string;
	visibilityStatus: string;
	publicNote: string | null;
	hasInternalNote: boolean;
	sortOrder: number;
	categoryId: string | null;
	deletedAt: string | null;
	createdAt: string;
	updatedAt: string;
};

export type OwnerPurchaseRecordViewModel = {
	id: string;
	giftId: string;
	guestName: string;
	guestEmail: string | null;
	guestPhone: string | null;
	message: string | null;
	quantity: number;
	createdAt: string;
	updatedAt: string;
};

export type WishlistViewSeriesPointViewModel = {
	date: string;
	views: number;
};

export type DashboardActivityEntryViewModel = {
	id: string;
	kind: "rsvp" | "purchase" | "invite_opened";
	label: string;
	occurredAt: string;
};

export type DashboardWishlistSummaryViewModel = {
	id: string;
	slug: string;
	title: string;
	subtitle: string | null;
	eventType: string;
	status: string;
	eventDate: string | null;
	totalUnits: number;
	purchasedUnits: number;
	availableGiftCount: number;
	totalGiftCount: number;
	createdAt: string;
};

export type SharedDashboardWishlistSummaryViewModel =
	DashboardWishlistSummaryViewModel & { ownerName: string };

export type DashboardWishlistOverviewViewModel = {
	id: string;
	isOwner: boolean;
	slug: string;
	title: string;
	subtitle: string | null;
	eventType: string;
	language: string;
	status: string;
	eventDate: string | null;
	eventTime: string | null;
	eventLocation: string | null;
	rsvpDeadline: string | null;
	publicUrlPath: string;
	publicUrl: string;
	whatsAppUrl: string;
	metrics: {
		totalGifts: number;
		availableGifts: number;
		purchasedGifts: number;
		totalUnits: number;
		purchasedUnits: number;
		pendingInvitations: number;
		totalInvitations: number;
		totalGuests: number;
		confirmedGuests: number;
		declinedGuests: number;
		pendingGuests: number;
		openedInvitations: number;
		unopenedInvitations: number;
		/** Tables on this wishlist's floor plan. Feeds the Mesas badge's suppression rule. */
		seatingTables: number;
		/** Eligible people with no table yet. Meaningless until `seatingTables > 0`. */
		unseatedGuests: number;
		totalViews?: number;
		uniqueVisitors?: number;
		latestViewAt?: string | null;
		/** Distinct purchasers over unique visitors. Owner-only; absent with no visitors or when analytics is disabled. */
		conversionRate?: number;
	};
	readiness: {
		ready: boolean;
		checks: PublishReadinessChecks;
	};
	activity: DashboardActivityEntryViewModel[];
	/** Daily view counts for the requested window. Owner-only; absent when view analytics is disabled. */
	viewSeries?: WishlistViewSeriesPointViewModel[];
};

export type InviteExtraGuestViewModel = {
	id: string;
	name: string | null;
	status: string;
};

export type DashboardInviteViewModel = {
	id: string;
	wishlistId: string;
	primaryName: string;
	primaryEmail: string | null;
	primaryPhone: string | null;
	slug: string;
	status: string;
	partySize: number;
	extraGuests: InviteExtraGuestViewModel[];
	openedAt: string | null;
	viewCount?: number;
	lastViewedAt?: string | null;
	lastFollowUpKind?: InviteFollowUpKind | null;
	lastFollowUpCopiedAt?: string | null;
	respondedAt: string | null;
	responseSource?: string | null;
	responseLockedAt?: string | null;
	createdAt: string;
	updatedAt: string;
};

export type DashboardWishlistCardViewModel = {
	id: string;
	slug: string;
	title: string;
	subtitle: string | null;
	eventType: string;
	language: string;
	currency: string;
	welcomeMessage: string;
	welcomeMessageAttribution: string | null;
	thankYouMessage: string | null;
	giftListMessage: string | null;
	eventDate: string | null;
	eventTime: string | null;
	endTime: string | null;
	eventLocation: string | null;
	dressCode: string | null;
	images: WishlistImageViewModel[];
	themeId: string | null;
	layoutId: string | null;
	buttonStyle: string | null;
	headingFont: string | null;
	bodyFont: string | null;
	countdownVariant: string | null;
	welcomeMessageVariant: string | null;
	thankYouMessageVariant: string | null;
	showHowItWorks: boolean;
	status: string;
	visibleGiftCount: number;
	gifts: DashboardGiftRowViewModel[];
	publishedAt: string | null;
	archivedAt: string | null;
	createdAt: string;
	updatedAt: string;
};

export type SeatingTableViewModel = {
	id: string;
	/** `name` when set, otherwise `Mesa {sortOrder + 1}`. */
	label: string;
	name: string | null;
	shape: string;
	capacity: number;
	/** Derived: assignment rows whose person is still eligible. */
	seated: number;
	x: number;
	y: number;
	sortOrder: number;
};

export type SeatingPersonViewModel = {
	personId: string;
	displayName: string;
	partyLabel: string;
	status: string;
	isUnnamed: boolean;
	inviteId: string;
	extraGuestId: string | null;
	/** The party's public invitation link. Shared per invitation, not per person. */
	inviteUrl: string;
	tableId: string | null;
	/** When their assignment row was written; null when they have no table. Drives "who moves first". */
	seatedAt: string | null;
};

export type SeatingBoardTotalsViewModel = {
	tables: number;
	capacity: number;
	eligiblePeople: number;
	seated: number;
	unseated: number;
	declinedExcluded: number;
};

export type SeatingBoardViewModel = {
	wishlistId: string;
	tables: SeatingTableViewModel[];
	people: SeatingPersonViewModel[];
	totals: SeatingBoardTotalsViewModel;
};

import type { InviteFollowUpKind } from "@/lib/dashboard/invite-follow-up";
