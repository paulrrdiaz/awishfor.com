// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { DashboardInviteViewModel } from "@/server/mappers/view-models";

const invites: DashboardInviteViewModel[] = [
	{
		id: "confirmed",
		wishlistId: "wishlist_1",
		primaryName: "Ana Confirmada",
		primaryEmail: null,
		primaryPhone: null,
		slug: "ana-confirmada",
		status: "confirmed",
		partySize: 2,
		extraGuests: [{ id: "ana-extra", name: "Luis", status: "confirmed" }],
		openedAt: null,
		respondedAt: null,
		createdAt: "2026-01-01T00:00:00.000Z",
		updatedAt: "2026-01-01T00:00:00.000Z",
	},
	{
		id: "pending",
		wishlistId: "wishlist_1",
		primaryName: "Beto Pendiente",
		primaryEmail: null,
		primaryPhone: null,
		slug: "beto-pendiente",
		status: "pending",
		partySize: 1,
		extraGuests: [],
		openedAt: null,
		respondedAt: null,
		createdAt: "2026-01-01T00:00:00.000Z",
		updatedAt: "2026-01-01T00:00:00.000Z",
	},
];

const inviteListMock = vi.hoisted(() => vi.fn());
const wishlistOverviewMock = vi.hoisted(() => vi.fn());
const guestListMock = vi.hoisted(() => vi.fn());

vi.mock("./search-params", () => ({
	loadGuestsSearchParams: vi
		.fn()
		.mockResolvedValue({ q: "", status: "pending" }),
}));

vi.mock("@/trpc/server", () => ({
	api: {
		wishlist: {
			overview: wishlistOverviewMock,
		},
		invite: { list: inviteListMock },
	},
}));

vi.mock("@/lib/wishlist/share", () => ({
	toCanonicalWishlistUrl: (path: string) => `https://example.com${path}`,
}));

vi.mock("@/components/features/dashboard/guests/guests-header-toolbar", () => ({
	GuestsHeaderToolbar: (props: {
		confirmedGuests: number;
		confirmedGuestsRoster: string;
		pendingInvitations: number;
		totalGuests: number;
	}) => (
		<div
			data-confirmed={props.confirmedGuests}
			data-pending={props.pendingInvitations}
			data-roster={props.confirmedGuestsRoster}
			data-testid="guest-header"
			data-total={props.totalGuests}
		/>
	),
}));

vi.mock("@/components/features/dashboard/guests/guest-list", () => ({
	GuestList: ({
		invites: visibleInvites,
	}: {
		invites: DashboardInviteViewModel[];
	}) => {
		guestListMock(visibleInvites);
		return (
			<ul>
				{visibleInvites.map((invite) => (
					<li key={invite.id}>{invite.primaryName}</li>
				))}
			</ul>
		);
	},
}));

vi.mock("@/components/features/dashboard/guests/guests-filter-toolbar", () => ({
	GuestsFilterToolbar: () => <div data-testid="guest-filters" />,
}));

vi.mock("@/components/features/dashboard/guests/guests-empty-state", () => ({
	GuestsEmptyState: () => null,
}));

vi.mock(
	"@/components/features/dashboard/guests/guests-filtered-empty-state",
	() => ({
		GuestsFilteredEmptyState: () => null,
	}),
);

import DashboardWishlistGuestsPage from "./page";

describe("DashboardWishlistGuestsPage", () => {
	beforeEach(() => {
		guestListMock.mockReset();
		inviteListMock.mockResolvedValue(invites);
		wishlistOverviewMock.mockResolvedValue({
			isOwner: true,
			slug: "celebracion",
			title: "Celebración",
		});
	});

	it("keeps header metrics and the copied roster anchored to complete invitations", async () => {
		render(
			await DashboardWishlistGuestsPage({
				params: Promise.resolve({ id: "wishlist_1" }),
				searchParams: Promise.resolve({}),
			}),
		);

		const header = screen.getByTestId("guest-header");
		expect(header).toHaveAttribute("data-total", "3");
		expect(header).toHaveAttribute("data-confirmed", "2");
		expect(header).toHaveAttribute("data-pending", "1");
		expect(header).toHaveAttribute(
			"data-roster",
			expect.stringContaining("Ana Confirmada"),
		);
		expect(header).toHaveAttribute(
			"data-roster",
			expect.stringContaining("Luis"),
		);
		expect(screen.getByText("Beto Pendiente")).toBeVisible();
		expect(screen.queryByText("Ana Confirmada")).toBeNull();
	});

	it("derives the same owner-only follow-up passed to the guest card", async () => {
		render(
			await DashboardWishlistGuestsPage({
				params: Promise.resolve({ id: "wishlist_1" }),
				searchParams: Promise.resolve({}),
			}),
		);

		const [visibleInvites] = guestListMock.mock.calls.at(-1) ?? [];
		expect(visibleInvites[0]?.followUp).toMatchObject({
			kind: "invitation",
			label: "Copiar invitación",
		});
		expect(visibleInvites[0]?.followUp.message).toContain(
			"https://example.com/w/celebracion/beto-pendiente",
		);
	});

	it("does not derive follow-ups for a collaborator", async () => {
		wishlistOverviewMock.mockResolvedValue({
			isOwner: false,
			slug: "celebracion",
			title: "Celebración",
		});
		render(
			await DashboardWishlistGuestsPage({
				params: Promise.resolve({ id: "wishlist_1" }),
				searchParams: Promise.resolve({}),
			}),
		);

		const [visibleInvites] = guestListMock.mock.calls.at(-1) ?? [];
		expect(visibleInvites[0]?.followUp).toBeUndefined();
	});
});
