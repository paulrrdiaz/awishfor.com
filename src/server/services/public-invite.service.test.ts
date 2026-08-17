import { TRPCError } from "@trpc/server";
import { describe, expect, it, vi } from "vitest";
import {
	type PublicInviteDatabase,
	resolvePersonalizedInvite,
	respondToInvite,
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

function makeWishlistRow(overrides: Record<string, unknown> = {}) {
	return {
		id: "wishlist_1",
		eventDate: null,
		rsvpDeadline: null,
		...overrides,
	};
}

function makeRespondDb({
	wishlist = makeWishlistRow(),
	invite = makeInvite(),
	inviteUpdate = vi.fn().mockImplementation(({ data }) => ({
		...invite,
		...data,
	})),
	extraGuestUpdate = vi.fn().mockResolvedValue({}),
}: {
	wishlist?: ReturnType<typeof makeWishlistRow> | null;
	invite?: ReturnType<typeof makeInvite>;
	inviteUpdate?: ReturnType<typeof vi.fn>;
	extraGuestUpdate?: ReturnType<typeof vi.fn>;
} = {}) {
	const tx = {
		invite: { update: inviteUpdate },
		inviteExtraGuest: { update: extraGuestUpdate },
	};
	const db = {
		wishlist: { findFirst: vi.fn().mockResolvedValue(wishlist) },
		invite: { findFirst: vi.fn().mockResolvedValue(invite) },
		inviteExtraGuest: { update: extraGuestUpdate },
		$transaction: vi.fn().mockImplementation((cb) => cb(tx)),
	};
	return {
		db: db as unknown as PublicInviteDatabase,
		tx,
		inviteUpdate,
		extraGuestUpdate,
	};
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
						{ id: "g1", name: "Ana", status: "confirmed" },
						{ id: "g2", name: null, status: "pending" },
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
				extraGuests: [
					{ id: "g1", name: "Ana", status: "confirmed" },
					{ id: "g2", name: null, status: "pending" },
				],
				status: "confirmed",
			},
		});
	});
});

describe("respondToInvite", () => {
	it("confirms the whole party", async () => {
		const invite = makeInvite({
			extraGuests: [
				{ id: "g1", name: "Ana" },
				{ id: "g2", name: "Luis" },
			],
		});
		const { db, inviteUpdate, extraGuestUpdate } = makeRespondDb({ invite });

		const result = await respondToInvite(db, {
			wishlistSlug: "boda-lu",
			guestSlug: "pedro-castillo",
			status: "confirmed",
			extraGuests: [
				{ id: "g1", status: "confirmed" },
				{ id: "g2", status: "confirmed" },
			],
		});

		expect(result).toEqual({ status: "confirmed" });
		expect(inviteUpdate).toHaveBeenCalledWith(
			expect.objectContaining({
				where: { id: "invite_1" },
				data: { status: "confirmed", respondedAt: expect.any(Date) },
			}),
		);
		expect(extraGuestUpdate).toHaveBeenCalledWith({
			where: { id: "g1" },
			data: { status: "confirmed" },
		});
		expect(extraGuestUpdate).toHaveBeenCalledWith({
			where: { id: "g2" },
			data: { status: "confirmed" },
		});
	});

	it("confirms the primary but declines one companion", async () => {
		const invite = makeInvite({
			extraGuests: [
				{ id: "g1", name: "Ana" },
				{ id: "g2", name: "Luis" },
			],
		});
		const { db, extraGuestUpdate } = makeRespondDb({ invite });

		const result = await respondToInvite(db, {
			wishlistSlug: "boda-lu",
			guestSlug: "pedro-castillo",
			status: "confirmed",
			extraGuests: [
				{ id: "g1", status: "confirmed" },
				{ id: "g2", status: "declined" },
			],
		});

		expect(result).toEqual({ status: "confirmed" });
		expect(extraGuestUpdate).toHaveBeenCalledWith({
			where: { id: "g1" },
			data: { status: "confirmed" },
		});
		expect(extraGuestUpdate).toHaveBeenCalledWith({
			where: { id: "g2" },
			data: { status: "declined" },
		});
	});

	it("forces every extra guest to declined when the primary declines", async () => {
		const invite = makeInvite({
			extraGuests: [
				{ id: "g1", name: "Ana" },
				{ id: "g2", name: "Luis" },
			],
		});
		const { db, extraGuestUpdate } = makeRespondDb({ invite });

		const result = await respondToInvite(db, {
			wishlistSlug: "boda-lu",
			guestSlug: "pedro-castillo",
			status: "declined",
			extraGuests: [
				{ id: "g1", status: "confirmed" },
				{ id: "g2", status: "confirmed" },
			],
		});

		expect(result).toEqual({ status: "declined" });
		expect(extraGuestUpdate).toHaveBeenCalledWith({
			where: { id: "g1" },
			data: { status: "declined" },
		});
		expect(extraGuestUpdate).toHaveBeenCalledWith({
			where: { id: "g2" },
			data: { status: "declined" },
		});
	});

	it("rejects a mismatched extra-guest id set", async () => {
		const invite = makeInvite({
			extraGuests: [
				{ id: "g1", name: "Ana" },
				{ id: "g2", name: "Luis" },
			],
		});
		const { db, inviteUpdate } = makeRespondDb({ invite });

		await expect(
			respondToInvite(db, {
				wishlistSlug: "boda-lu",
				guestSlug: "pedro-castillo",
				status: "confirmed",
				extraGuests: [{ id: "g1", status: "confirmed" }],
			}),
		).rejects.toThrow(TRPCError);
		expect(inviteUpdate).not.toHaveBeenCalled();
	});

	it("rejects once the wishlist's event date has passed", async () => {
		const { db, inviteUpdate } = makeRespondDb({
			wishlist: makeWishlistRow({ eventDate: new Date("2020-01-01") }),
		});

		await expect(
			respondToInvite(db, {
				wishlistSlug: "boda-lu",
				guestSlug: "pedro-castillo",
				status: "confirmed",
				extraGuests: [],
			}),
		).rejects.toThrow(TRPCError);
		expect(inviteUpdate).not.toHaveBeenCalled();
	});

	it("rejects once the RSVP deadline has passed when there is no event date", async () => {
		const { db, inviteUpdate } = makeRespondDb({
			wishlist: makeWishlistRow({ rsvpDeadline: new Date("2020-01-01") }),
		});

		await expect(
			respondToInvite(db, {
				wishlistSlug: "boda-lu",
				guestSlug: "pedro-castillo",
				status: "confirmed",
				extraGuests: [],
			}),
		).rejects.toThrow(TRPCError);
		expect(inviteUpdate).not.toHaveBeenCalled();
	});

	it("allows a later response to overwrite an earlier one", async () => {
		const invite = makeInvite({
			status: "confirmed",
			respondedAt: new Date("2026-06-01"),
			extraGuests: [{ id: "g1", name: "Ana" }],
		});
		const { db, inviteUpdate } = makeRespondDb({ invite });

		const result = await respondToInvite(db, {
			wishlistSlug: "boda-lu",
			guestSlug: "pedro-castillo",
			status: "declined",
			extraGuests: [{ id: "g1", status: "confirmed" }],
		});

		expect(result).toEqual({ status: "declined" });
		expect(inviteUpdate).toHaveBeenCalledWith(
			expect.objectContaining({
				data: { status: "declined", respondedAt: expect.any(Date) },
			}),
		);
	});

	it("throws NOT_FOUND when the wishlist slug does not match", async () => {
		const { db } = makeRespondDb({ wishlist: null });

		await expect(
			respondToInvite(db, {
				wishlistSlug: "unknown",
				guestSlug: "pedro-castillo",
				status: "confirmed",
				extraGuests: [],
			}),
		).rejects.toThrow(TRPCError);
	});
});
