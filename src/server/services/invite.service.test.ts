import { describe, expect, it, vi } from "vitest";
import type { InviteExtraGuest } from "@/generated/prisma/client";
import {
	type InviteWithExtras,
	type OwnerFollowUpDatabase,
	recordFollowUpCopy,
	summarizeInviteEngagement,
} from "./invite.service";

const now = new Date("2026-08-27T10:00:00.000Z");

function makeExtraGuest(
	overrides: Partial<InviteExtraGuest> = {},
): InviteExtraGuest {
	return {
		id: "extra-1",
		inviteId: "invite-1",
		name: null,
		status: "pending",
		sortOrder: 0,
		...overrides,
	};
}

function makeInvite(
	overrides: Partial<InviteWithExtras> = {},
): InviteWithExtras {
	return {
		id: "invite-1",
		wishlistId: "wl-1",
		primaryName: "Guest",
		primaryEmail: null,
		primaryPhone: null,
		slug: "guest",
		status: "pending",
		openedAt: null,
		viewCount: 0,
		lastViewedAt: null,
		lastFollowUpKind: null,
		lastFollowUpCopiedAt: null,
		respondedAt: null,
		responseSource: null,
		responseLockedAt: null,
		createdAt: now,
		updatedAt: now,
		extraGuests: [],
		...overrides,
	};
}

describe("summarizeInviteEngagement", () => {
	it("reports zero for every count when there are no invitations", () => {
		expect(summarizeInviteEngagement([])).toEqual({
			confirmedGuests: 0,
			declinedGuests: 0,
			pendingGuests: 0,
			openedInvitations: 0,
			unopenedInvitations: 0,
		});
	});

	it("spans primary and extra guests when tallying RSVP status", () => {
		const invite = makeInvite({
			status: "confirmed",
			extraGuests: [makeExtraGuest({ status: "declined" })],
		});

		const result = summarizeInviteEngagement([invite]);

		expect(result.confirmedGuests).toBe(1);
		expect(result.declinedGuests).toBe(1);
		expect(result.pendingGuests).toBe(0);
	});

	it("counts opened and unopened invitations from openedAt", () => {
		const invites = [
			makeInvite({ id: "i1", openedAt: now }),
			makeInvite({ id: "i2", openedAt: null }),
			makeInvite({ id: "i3", openedAt: null }),
			makeInvite({ id: "i4", openedAt: null }),
		];

		const result = summarizeInviteEngagement(invites);

		expect(result.openedInvitations).toBe(1);
		expect(result.unopenedInvitations).toBe(3);
	});
});

describe("recordFollowUpCopy", () => {
	it("updates only the latest follow-up kind and copy time for the owner", async () => {
		const update = vi.fn().mockResolvedValue(makeInvite());
		const db = {
			invite: { findFirst: vi.fn().mockResolvedValue(makeInvite()), update },
			wishlist: {
				findFirst: vi.fn().mockResolvedValue({ id: "wl-1", ownerId: 1 }),
			},
		} as unknown as OwnerFollowUpDatabase;
		const copiedAt = new Date("2026-09-22T12:00:00.000Z");

		await recordFollowUpCopy(db, {
			localUserId: 1,
			wishlistId: "wl-1",
			inviteId: "invite-1",
			kind: "event_7_day",
			now: copiedAt,
		});

		expect(update).toHaveBeenCalledWith({
			where: { id: "invite-1" },
			data: { lastFollowUpKind: "event_7_day", lastFollowUpCopiedAt: copiedAt },
		});
	});

	it("rejects a copied follow-up scoped to another wishlist", async () => {
		const update = vi.fn();
		const db = {
			invite: { findFirst: vi.fn().mockResolvedValue(makeInvite()), update },
			wishlist: {
				findFirst: vi.fn().mockResolvedValue({ id: "wl-1", ownerId: 1 }),
			},
		} as unknown as OwnerFollowUpDatabase;

		await expect(
			recordFollowUpCopy(db, {
				localUserId: 1,
				wishlistId: "another-wishlist",
				inviteId: "invite-1",
				kind: "invitation",
			}),
		).rejects.toMatchObject({ code: "NOT_FOUND" });
		expect(update).not.toHaveBeenCalled();
	});

	it("allows a collaborator to record follow-up copy metadata", async () => {
		const update = vi.fn().mockResolvedValue(makeInvite());
		const db = {
			invite: { findFirst: vi.fn().mockResolvedValue(makeInvite()), update },
			wishlist: {
				findFirst: vi.fn().mockResolvedValue({ id: "wl-1", ownerId: 1 }),
			},
		} as unknown as OwnerFollowUpDatabase;
		const copiedAt = new Date("2026-09-22T12:00:00.000Z");

		await recordFollowUpCopy(db, {
			localUserId: 2,
			wishlistId: "wl-1",
			inviteId: "invite-1",
			kind: "rsvp_reminder",
			now: copiedAt,
		});

		expect(update).toHaveBeenCalledWith({
			where: { id: "invite-1" },
			data: {
				lastFollowUpKind: "rsvp_reminder",
				lastFollowUpCopiedAt: copiedAt,
			},
		});
	});

	it("rejects a caller with no wishlist access", async () => {
		const update = vi.fn();
		const db = {
			invite: { findFirst: vi.fn().mockResolvedValue(makeInvite()), update },
			wishlist: { findFirst: vi.fn().mockResolvedValue(null) },
		} as unknown as OwnerFollowUpDatabase;

		await expect(
			recordFollowUpCopy(db, {
				localUserId: 3,
				wishlistId: "wl-1",
				inviteId: "invite-1",
				kind: "invitation",
			}),
		).rejects.toMatchObject({ code: "NOT_FOUND" });
		expect(update).not.toHaveBeenCalled();
	});
});
