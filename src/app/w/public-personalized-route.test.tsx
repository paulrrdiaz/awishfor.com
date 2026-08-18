import type { ReactElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const sharedCache = vi.hoisted(() => new Map<string, Promise<unknown>>());
const wishlistFindUnique = vi.hoisted(() => vi.fn());
const inviteFindFirst = vi.hoisted(() => vi.fn());
const inviteUpdate = vi.hoisted(() => vi.fn());
const unstableCacheMock = vi.hoisted(() =>
	vi.fn(
		<T extends (...args: never[]) => Promise<unknown>>(
			callback: T,
			keyParts: string[] = [],
		) =>
			((...args: Parameters<T>) => {
				const key = JSON.stringify([keyParts, args]);
				const cached = sharedCache.get(key);
				if (cached) return cached;
				const pending = callback(...args);
				sharedCache.set(key, pending);
				return pending;
			}) as T,
	),
);

vi.mock("next/cache", () => ({
	revalidatePath: vi.fn(),
	revalidateTag: vi.fn(),
	unstable_cache: unstableCacheMock,
}));
vi.mock("@/server/db", () => ({
	db: {
		invite: { findFirst: inviteFindFirst, update: inviteUpdate },
		wishlist: { findUnique: wishlistFindUnique },
	},
}));
vi.mock("@/components/layouts/public-wishlist/public-wishlist-page", () => ({
	PublicWishlistPage: () => null,
}));

import PersonalizedWishlistPage, {
	generateMetadata,
} from "./[slug]/[guestSlug]/page";

const BASE_DATE = new Date("2026-06-26T00:00:00.000Z");
const publishedWishlist = {
	id: "wishlist_1",
	ownerId: 1,
	title: "Lista pública",
	slug: "lista-publica",
	eventType: "wedding",
	language: "es",
	currency: "PEN",
	welcomeMessage: "Bienvenidos",
	welcomeMessageAttribution: null,
	thankYouMessage: null,
	eventDate: null,
	eventTime: null,
	rsvpDeadline: null,
	eventLocation: null,
	dressCode: null,
	deliveryRecipientName: null,
	deliveryDocumentId: null,
	deliveryAddress: null,
	deliveryPhone: null,
	themeId: null,
	layoutId: null,
	buttonStyle: null,
	headingFont: null,
	bodyFont: null,
	countdownVariant: null,
	welcomeMessageVariant: null,
	thankYouMessageVariant: null,
	motifId: null,
	motifTreatment: null,
	motifPalette: null,
	showHowItWorks: true,
	status: "published",
	publishedAt: BASE_DATE,
	archivedAt: null,
	createdAt: BASE_DATE,
	updatedAt: BASE_DATE,
	categories: [],
	gifts: [],
	images: [],
	owner: { clerkId: "clerk_owner" },
};

function invite(guestSlug: string) {
	return {
		id: `invite_${guestSlug}`,
		wishlistId: "wishlist_1",
		primaryName: guestSlug === "ana" ? "Ana" : "Luis",
		primaryEmail: null,
		primaryPhone: null,
		slug: guestSlug,
		status: "pending",
		openedAt: null,
		respondedAt: null,
		createdAt: BASE_DATE,
		updatedAt: BASE_DATE,
		extraGuests: [],
	};
}

describe("personalized public wishlist route", () => {
	beforeEach(() => {
		sharedCache.clear();
		wishlistFindUnique.mockReset().mockResolvedValue(publishedWishlist);
		inviteFindFirst
			.mockReset()
			.mockImplementation(({ where }) => Promise.resolve(invite(where.slug)));
		inviteUpdate.mockReset().mockResolvedValue({});
		unstableCacheMock.mockClear();
	});

	it("composes uncached invite state over one reusable published base", async () => {
		const first = (await PersonalizedWishlistPage({
			params: Promise.resolve({ slug: "lista-publica", guestSlug: "ana" }),
		})) as ReactElement<{ wishlist: { guest: { primaryName: string } } }>;
		const second = (await PersonalizedWishlistPage({
			params: Promise.resolve({ slug: "lista-publica", guestSlug: "luis" }),
		})) as ReactElement<{ wishlist: { guest: { primaryName: string } } }>;

		expect(first.props.wishlist.guest.primaryName).toBe("Ana");
		expect(second.props.wishlist.guest.primaryName).toBe("Luis");
		expect(wishlistFindUnique).toHaveBeenCalledTimes(3);
		expect(inviteFindFirst).toHaveBeenCalledTimes(2);
		expect(inviteUpdate).toHaveBeenCalledTimes(2);
		expect(unstableCacheMock).toHaveBeenCalledTimes(2);
	});

	it("keeps metadata side-effect free and records openedAt on page render", async () => {
		await generateMetadata({
			params: Promise.resolve({
				slug: "lista-publica",
				guestSlug: "ana",
			}),
		});

		expect(inviteFindFirst).not.toHaveBeenCalled();
		expect(inviteUpdate).not.toHaveBeenCalled();

		await PersonalizedWishlistPage({
			params: Promise.resolve({ slug: "lista-publica", guestSlug: "ana" }),
		});

		expect(inviteUpdate).toHaveBeenCalledWith({
			where: { id: "invite_ana" },
			data: { openedAt: expect.any(Date) },
		});
	});
});
