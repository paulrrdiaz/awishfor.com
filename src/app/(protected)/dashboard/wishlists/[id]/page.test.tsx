// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const overviewMock = vi.fn();
vi.mock("@/trpc/server", () => ({
	api: {
		wishlist: { overview: (...args: unknown[]) => overviewMock(...args) },
	},
}));
vi.mock("@/trpc/react", () => ({
	api: {
		wishlist: {
			overview: {
				useQuery: () => ({ data: undefined, isPending: false }),
			},
		},
	},
}));
vi.mock("next/navigation", () => ({
	notFound: () => {
		throw new Error("NEXT_NOT_FOUND");
	},
}));

import DashboardWishlistOverviewPage from "./page";

const baseMetrics = {
	totalGifts: 0,
	availableGifts: 0,
	purchasedGifts: 0,
	totalUnits: 0,
	purchasedUnits: 0,
	pendingInvitations: 0,
	totalInvitations: 0,
	totalGuests: 0,
	confirmedGuests: 0,
	declinedGuests: 0,
	pendingGuests: 0,
	openedInvitations: 0,
	unopenedInvitations: 0,
};

function baseOverview(overrides: Record<string, unknown> = {}) {
	return {
		id: "wl-1",
		isOwner: true,
		slug: "my-wishlist",
		title: "My Wishlist",
		subtitle: null,
		eventType: "birthday",
		language: "es",
		status: "published",
		publicUrlPath: "/w/my-wishlist",
		publicUrl: "https://awishfor.com/w/my-wishlist",
		whatsAppUrl: "https://wa.me/?text=hi",
		metrics: baseMetrics,
		readiness: { ready: true, checks: {} },
		activity: [],
		...overrides,
	};
}

describe("DashboardWishlistOverviewPage", () => {
	it("renders the owner variant with view metrics and the trend panel", async () => {
		overviewMock.mockResolvedValue(
			baseOverview({
				metrics: {
					...baseMetrics,
					totalGifts: 4,
					purchasedGifts: 1,
					totalUnits: 4,
					purchasedUnits: 1,
					totalInvitations: 4,
					openedInvitations: 1,
					unopenedInvitations: 3,
					totalViews: 37,
					uniqueVisitors: 21,
					conversionRate: 0.047,
				},
				viewSeries: [{ date: "2026-08-27", views: 5 }],
			}),
		);

		const ui = await DashboardWishlistOverviewPage({
			params: Promise.resolve({ id: "wl-1" }),
		});
		render(ui);

		expect(screen.getByText("Visitas")).toBeVisible();
		expect(screen.getByText("Visitas por día")).toBeVisible();
		expect(overviewMock).toHaveBeenCalledWith({
			wishlistId: "wl-1",
			viewWindowDays: 30,
		});
	});

	it("renders the collaborator variant without owner-only view metrics or the trend panel", async () => {
		overviewMock.mockResolvedValue(baseOverview({ isOwner: false }));

		const ui = await DashboardWishlistOverviewPage({
			params: Promise.resolve({ id: "wl-1" }),
		});
		render(ui);

		expect(screen.queryByText("Visitas")).toBeNull();
		expect(screen.queryByText("Visitas por día")).toBeNull();
		expect(screen.getByText("Regalos")).toBeVisible();
	});

	it("renders every panel's empty state for a wishlist with no activity", async () => {
		overviewMock.mockResolvedValue(baseOverview());

		const ui = await DashboardWishlistOverviewPage({
			params: Promise.resolve({ id: "wl-1" }),
		});
		render(ui);

		expect(screen.getByText("Aún no hay actividad registrada.")).toBeVisible();
		expect(
			screen.getByText("Aún no hay regalos en esta wishlist."),
		).toBeVisible();
		expect(
			screen.getByText("Aún no se han enviado invitaciones."),
		).toBeVisible();
	});
});
