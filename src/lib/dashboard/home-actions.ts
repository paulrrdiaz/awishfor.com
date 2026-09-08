import type {
	PublishReadinessChecks,
	PublishReadinessResult,
} from "@/lib/wishlist/publish-readiness";

function wishlistHref(wishlistId: string, segment: "" | "guests" | "settings") {
	const base = `/dashboard/wishlists/${wishlistId}`;
	return segment ? `${base}/${segment}` : base;
}

export type HomeActionWishlistStatus = "draft" | "published" | "archived";

export type HomeActionWishlistInput = {
	id: string;
	title: string;
	status: HomeActionWishlistStatus;
	isOwner: boolean;
	ownerName: string | null;
	eventDate: string | null;
	rsvpDeadline: string | null;
	createdAt: string;
	pendingInvites: number;
	totalInvites: number;
	readiness: PublishReadinessResult;
};

type HomeActionBase = {
	wishlistId: string;
	wishlistTitle: string;
	wishlistStatus: HomeActionWishlistStatus;
	isOwner: boolean;
	ownerName: string | null;
	eventDate: string | null;
	createdAt: string;
	description: string;
	destination: string;
};

export type CompleteDraftAction = HomeActionBase & {
	kind: "complete_draft";
	readiness: PublishReadinessResult;
};

export type ReviewRsvpsAction = HomeActionBase & {
	kind: "review_rsvps";
	rsvpDeadline: string | null;
	pendingCount: number;
};

export type InviteGuestsAction = HomeActionBase & {
	kind: "invite_guests";
};

export type ArchiveAction = HomeActionBase & {
	kind: "archive";
};

export type HomeAction =
	| CompleteDraftAction
	| ReviewRsvpsAction
	| InviteGuestsAction
	| ArchiveAction;

export type HomeActionsInput = {
	wishlists: HomeActionWishlistInput[];
	now?: Date;
};

export type HomeActionsResult = {
	actions: HomeAction[];
	nextStep: HomeAction | null;
	subsequentActions: HomeAction[];
};

const KIND_ORDER: Record<HomeAction["kind"], number> = {
	complete_draft: 0,
	review_rsvps: 1,
	invite_guests: 2,
	archive: 3,
};

const CHECK_ORDER: (keyof PublishReadinessChecks)[] = [
	"title",
	"eventType",
	"slug",
	"language",
	"currency",
	"visibleGift",
	"images",
];

const MISSING_CHECK_LABELS: Record<keyof PublishReadinessChecks, string> = {
	title: "el título",
	eventType: "el tipo de evento",
	slug: "un enlace público válido",
	language: "el idioma",
	currency: "la moneda",
	visibleGift: "un regalo visible",
	images: "suficientes fotos de portada",
};

function describeMissingChecks(checks: PublishReadinessChecks): string {
	const missing = CHECK_ORDER.filter((key) => !checks[key]);

	if (missing.length === 0) {
		return "Todo listo para publicar.";
	}

	const [first, second, ...rest] = missing;
	if (missing.length === 1) {
		return `Falta ${MISSING_CHECK_LABELS[first as keyof PublishReadinessChecks]}.`;
	}
	if (missing.length === 2) {
		return `Faltan ${MISSING_CHECK_LABELS[first as keyof PublishReadinessChecks]} y ${MISSING_CHECK_LABELS[second as keyof PublishReadinessChecks]}.`;
	}
	return `Faltan ${MISSING_CHECK_LABELS[first as keyof PublishReadinessChecks]}, ${MISSING_CHECK_LABELS[second as keyof PublishReadinessChecks]} y ${rest.length} más.`;
}

function describeReviewRsvps(pendingCount: number): string {
	return pendingCount === 1
		? "1 invitado no ha respondido todavía."
		: `${pendingCount} invitados no han respondido todavía.`;
}

const INVITE_GUESTS_DESCRIPTION =
	"Esta wishlist está publicada pero todavía no tiene invitados.";
const ARCHIVE_DESCRIPTION =
	"El evento ya pasó. Puedes archivar esta wishlist cuando quieras.";

function deriveActionsForWishlist(
	wishlist: HomeActionWishlistInput,
	now: Date,
): HomeAction[] {
	if (wishlist.status === "archived") {
		return [];
	}

	const base: HomeActionBase = {
		wishlistId: wishlist.id,
		wishlistTitle: wishlist.title,
		wishlistStatus: wishlist.status,
		isOwner: wishlist.isOwner,
		ownerName: wishlist.isOwner ? null : wishlist.ownerName,
		eventDate: wishlist.eventDate,
		createdAt: wishlist.createdAt,
		description: "",
		destination: "",
	};

	const actions: HomeAction[] = [];

	if (wishlist.status === "draft" && !wishlist.readiness.ready) {
		actions.push({
			...base,
			kind: "complete_draft",
			readiness: wishlist.readiness,
			description: describeMissingChecks(wishlist.readiness.checks),
			destination: wishlistHref(wishlist.id, ""),
		});
	}

	if (wishlist.pendingInvites > 0) {
		actions.push({
			...base,
			kind: "review_rsvps",
			rsvpDeadline: wishlist.rsvpDeadline,
			pendingCount: wishlist.pendingInvites,
			description: describeReviewRsvps(wishlist.pendingInvites),
			destination: wishlistHref(wishlist.id, "guests"),
		});
	}

	if (wishlist.status === "published" && wishlist.totalInvites === 0) {
		actions.push({
			...base,
			kind: "invite_guests",
			description: INVITE_GUESTS_DESCRIPTION,
			destination: wishlistHref(wishlist.id, "guests"),
		});
	}

	if (
		wishlist.isOwner &&
		wishlist.eventDate !== null &&
		new Date(wishlist.eventDate).getTime() < now.getTime()
	) {
		actions.push({
			...base,
			kind: "archive",
			description: ARCHIVE_DESCRIPTION,
			destination: wishlistHref(wishlist.id, "settings"),
		});
	}

	return actions;
}

function relevantDateValue(action: HomeAction): number | null {
	const iso =
		action.kind === "review_rsvps" ? action.rsvpDeadline : action.eventDate;
	return iso ? new Date(iso).getTime() : null;
}

function compareActions(a: HomeAction, b: HomeAction): number {
	const kindDiff = KIND_ORDER[a.kind] - KIND_ORDER[b.kind];
	if (kindDiff !== 0) {
		return kindDiff;
	}

	const dateA = relevantDateValue(a);
	const dateB = relevantDateValue(b);
	if (dateA === null && dateB !== null) {
		return 1;
	}
	if (dateA !== null && dateB === null) {
		return -1;
	}
	if (dateA !== null && dateB !== null && dateA !== dateB) {
		return dateA - dateB;
	}

	return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
}

export function deriveHomeActions({
	wishlists,
	now = new Date(),
}: HomeActionsInput): HomeActionsResult {
	const actions = wishlists
		.flatMap((wishlist) => deriveActionsForWishlist(wishlist, now))
		.sort(compareActions);

	const [nextStep = null, ...subsequentActions] = actions;

	return { actions, nextStep, subsequentActions };
}
