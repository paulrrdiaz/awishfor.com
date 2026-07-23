import { describe, expect, it, vi } from "vitest";
import {
	type PublicInviteDatabase,
	resolvePersonalizedInvite,
} from "@/server/services/public-invite.service";

const now = new Date("2026-06-28T10:00:00.000Z");

function makeInvite(overrides: Record<string, unknown> = {}) {
	return {
		id: "invite_1",
		wishlistId: "wishlist_1",
		primaryName: "Pedro Castillo",
		primaryEmail: null,
		primaryPhone: null,
		slug: "pedro-castillo",
		status: "pending",
		openedAt: null,
		respondedAt: null,
		createdAt: now,
		updatedAt: now,
		extraGuests: [],
		...overrides,
	};
}

function makeDb(overrides: Partial<PublicInviteDatabase["invite"]> = {}) {
	const invite = {
		findFirst: vi.fn(),
		update: vi.fn(),
		...overrides,
	};
	return { invite } as unknown as PublicInviteDatabase;
}

describe("resolvePersonalizedInvite", () => {
	it("returns notFound when no invite matches the guest slug", async () => {
		const db = makeDb({ findFirst: vi.fn().mockResolvedValue(null) });

		const result = await resolvePersonalizedInvite(db, {
			wishlistId: "wishlist_1",
			guestSlug: "unknown",
		});

		expect(result).toEqual({ kind: "notFound" });
	});

	it("sets openedAt on first open", async () => {
		const update = vi.fn().mockResolvedValue({});
		const db = makeDb({
			findFirst: vi.fn().mockResolvedValue(makeInvite({ openedAt: null })),
			update,
		});

		await resolvePersonalizedInvite(db, {
			wishlistId: "wishlist_1",
			guestSlug: "pedro-castillo",
		});

		expect(update).toHaveBeenCalledWith(
			expect.objectContaining({
				where: { id: "invite_1" },
				data: { openedAt: expect.any(Date) },
			}),
		);
	});

	it("does not overwrite an existing openedAt on later opens", async () => {
		const update = vi.fn();
		const db = makeDb({
			findFirst: vi
				.fn()
				.mockResolvedValue(makeInvite({ openedAt: new Date("2026-06-01") })),
			update,
		});

		await resolvePersonalizedInvite(db, {
			wishlistId: "wishlist_1",
			guestSlug: "pedro-castillo",
		});

		expect(update).not.toHaveBeenCalled();
	});

	it("still returns the guest even when the openedAt write fails", async () => {
		const db = makeDb({
			findFirst: vi.fn().mockResolvedValue(makeInvite({ openedAt: null })),
			update: vi.fn().mockRejectedValue(new Error("db unavailable")),
		});

		const result = await resolvePersonalizedInvite(db, {
			wishlistId: "wishlist_1",
			guestSlug: "pedro-castillo",
		});

		expect(result.kind).toBe("found");
	});

	it("maps named and unnamed extra guests and the RSVP status", async () => {
		const db = makeDb({
			findFirst: vi.fn().mockResolvedValue(
				makeInvite({
					openedAt: new Date("2026-06-01"),
					status: "confirmed",
					extraGuests: [
						{ id: "g1", name: "Ana" },
						{ id: "g2", name: null },
					],
				}),
			),
		});

		const result = await resolvePersonalizedInvite(db, {
			wishlistId: "wishlist_1",
			guestSlug: "pedro-castillo",
		});

		expect(result).toEqual({
			kind: "found",
			guest: {
				slug: "pedro-castillo",
				primaryName: "Pedro Castillo",
				extraGuests: [{ name: "Ana" }, { name: null }],
				status: "confirmed",
			},
		});
	});
});
