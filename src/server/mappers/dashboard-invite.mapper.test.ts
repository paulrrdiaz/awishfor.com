import { describe, expect, it } from "vitest";
import type { InviteWithExtras } from "@/server/services/invite.service";
import { mapDashboardInvite } from "./dashboard-invite.mapper";

const copiedAt = new Date("2026-09-22T12:00:00.000Z");
const invite = {
	id: "invite_1",
	wishlistId: "wishlist_1",
	primaryName: "María",
	primaryEmail: null,
	primaryPhone: null,
	slug: "maria",
	status: "pending",
	openedAt: null,
	viewCount: 2,
	lastViewedAt: copiedAt,
	lastFollowUpKind: "rsvp_reminder",
	lastFollowUpCopiedAt: copiedAt,
	respondedAt: null,
	responseSource: null,
	responseLockedAt: null,
	createdAt: copiedAt,
	updatedAt: copiedAt,
	extraGuests: [],
} satisfies InviteWithExtras;

describe("mapDashboardInvite", () => {
	it("keeps viewRecency and lastFollowUpKind present for both owner and collaborator", () => {
		const owner = mapDashboardInvite(invite, { includeAnalytics: true });
		expect(owner).toMatchObject({
			lastFollowUpKind: "rsvp_reminder",
			lastFollowUpCopiedAt: copiedAt.toISOString(),
		});
		expect(["never", "recent", "intermediate", "stale"]).toContain(
			owner.viewRecency,
		);

		const collaborator = mapDashboardInvite(invite);
		expect(collaborator.lastFollowUpKind).toBe("rsvp_reminder");
		expect(["never", "recent", "intermediate", "stale"]).toContain(
			collaborator.viewRecency,
		);
		expect(collaborator).not.toHaveProperty("lastFollowUpCopiedAt");
		expect(collaborator).not.toHaveProperty("lastViewedAt");
		expect(collaborator).not.toHaveProperty("viewCount");
	});
});
