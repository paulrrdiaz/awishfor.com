import { describe, expect, it } from "vitest";
import type { InviteExtraGuest } from "@/generated/prisma/client";
import {
	type InviteWithExtras,
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
