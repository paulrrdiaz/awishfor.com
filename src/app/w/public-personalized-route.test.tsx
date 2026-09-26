import { Children, type ReactElement, type ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const sharedCache = vi.hoisted(() => new Map<string, Promise<unknown>>());
const wishlistFindUnique = vi.hoisted(() => vi.fn());
const inviteFindFirst = vi.hoisted(() => vi.fn());
const inviteUpdate = vi.hoisted(() => vi.fn());
const seatingTableFindMany = vi.hoisted(() => vi.fn());
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
		seatingTable: { findMany: seatingTableFindMany },
	},
}));
vi.mock("@/components/layouts/public-wishlist/public-wishlist-page", () => ({
	PublicWishlistPage: () => null,
}));

import { RsvpSection } from "@/components/shared/rsvp-section";
import { SeatingPass } from "@/components/shared/seating-pass/seating-pass";
import PersonalizedWishlistPage, {
	generateMetadata,
} from "./[slug]/[guestSlug]/page";

function findByType(
	node: ReactNode,
	type: unknown,
): ReactElement<Record<string, unknown>> | undefined {
	for (const child of Children.toArray(node)) {
		const element = child as ReactElement<{ children?: ReactNode }>;
		if (element.type === type) return element;
		const nested = findByType(element.props?.children, type);
		if (nested) return nested;
	}
	return undefined;
}

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
	seatingPassVariant: "pass",
	seatingPassShowMates: true,
	seatingPassShowMap: true,
	status: "published",
	publishedAt: BASE_DATE,
	archivedAt: null,
	createdAt: BASE_DATE,
	updatedAt: BASE_DATE,
	categories: [],
	gifts: [],
	images: [],
	owner: { clerkId: "clerk_owner", name: "Paul Diaz" },
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
		expect(inviteUpdate).not.toHaveBeenCalled();
		expect(unstableCacheMock).toHaveBeenCalledTimes(2);
	});

	it("keeps metadata and page rendering side-effect free", async () => {
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

		expect(inviteUpdate).not.toHaveBeenCalled();
	});

	it("supplies the confirmed RSVP with calendar event details and its personalized URL", async () => {
		wishlistFindUnique.mockResolvedValue({
			...publishedWishlist,
			title: "Boda de Ana y Luis",
			eventDate: new Date("2026-10-17T00:00:00.000Z"),
			eventTime: "14:30",
			endTime: "18:00",
			eventLocation: "Barranco, Lima",
			welcomeMessage: "Una tarde para celebrar juntos.",
		});
		inviteFindFirst.mockResolvedValue({
			...invite("ana"),
			status: "confirmed",
		});

		const page = (await PersonalizedWishlistPage({
			params: Promise.resolve({ slug: "lista-publica", guestSlug: "ana" }),
		})) as ReactElement<{ rsvpSection: ReactElement }>;

		const rsvp = findByType(
			page.props.rsvpSection,
			RsvpSection,
		) as ReactElement<{
			eventTitle: string;
			eventDate: string;
			eventTime: string;
			endTime: string;
			eventLocation: string;
			inviteUrl: string;
		}>;
		expect(rsvp.props).toMatchObject({
			eventTitle: "Boda de Ana y Luis - Paul Diaz",
			eventDescription: "Una tarde para celebrar juntos.",
			eventDate: "2026-10-17T00:00:00.000Z",
			eventTime: "14:30",
			endTime: "18:00",
			eventLocation: "Barranco, Lima",
		});
		expect(new URL(rsvp.props.inviteUrl).pathname).toBe("/w/lista-publica/ana");
	});

	describe("seating pass", () => {
		const seated = [
			{
				id: "t4",
				name: null,
				sortOrder: 3,
				capacity: 8,
				assignments: [
					{
						inviteId: "invite_ana",
						extraGuestId: null,
						invite: { status: "confirmed", primaryName: "Ana" },
						extraGuest: null,
					},
				],
			},
		];

		beforeEach(() => {
			vi.useFakeTimers({ toFake: ["Date"] });
			vi.setSystemTime(new Date("2026-10-13T17:00:00.000Z"));
			seatingTableFindMany.mockReset().mockResolvedValue(seated);
			inviteFindFirst.mockResolvedValue({
				...invite("ana"),
				status: "confirmed",
			});
		});

		afterEach(() => {
			vi.useRealTimers();
		});

		function withEvent(eventDate: string) {
			wishlistFindUnique.mockResolvedValue({
				...publishedWishlist,
				eventDate: new Date(eventDate),
			});
		}

		it("adds the pass beside the hero on mobile and in the RSVP slot on desktop", async () => {
			withEvent("2026-10-17T00:00:00.000Z");
			const page = (await PersonalizedWishlistPage({
				params: Promise.resolve({ slug: "lista-publica", guestSlug: "ana" }),
			})) as ReactElement<{
				rsvpSection: ReactElement;
				seatingPassSection: ReactElement;
			}>;

			// Mobile: pass beside the hero; desktop: pass in the RSVP slot, which
			// hides the RSVP section (both are always rendered, CSS picks one).
			for (const slot of [
				page.props.seatingPassSection,
				page.props.rsvpSection,
			]) {
				expect(findByType(slot, SeatingPass)?.props).toMatchObject({
					variant: "pass",
					pass: { headline: { label: "Mesa 4" } },
				});
			}
			expect(
				findByType(page.props.rsvpSection, RsvpSection)?.props,
			).toMatchObject({ className: "lg:hidden" });
		});

		it("shows no pass outside the window and does not query seating", async () => {
			withEvent("2026-10-20T00:00:00.000Z");
			const page = (await PersonalizedWishlistPage({
				params: Promise.resolve({ slug: "lista-publica", guestSlug: "ana" }),
			})) as ReactElement<{
				rsvpSection: ReactElement;
				seatingPassSection?: ReactElement;
			}>;

			expect(
				findByType(page.props.rsvpSection, RsvpSection)?.props.className,
			).toBeUndefined();
			expect(findByType(page.props.rsvpSection, SeatingPass)).toBeUndefined();
			expect(page.props.seatingPassSection).toBeUndefined();
			expect(seatingTableFindMany).not.toHaveBeenCalled();
		});
	});
});
