// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { CompleteDraftAction } from "@/lib/dashboard/home-actions";

vi.mock("@clerk/nextjs", () => ({
	useUser: () => ({
		user: { firstName: "Paul", fullName: "Paul Diaz", imageUrl: undefined },
	}),
}));

const refetchMock = vi.fn();
const queryStateRef = {
	current: {
		data: undefined as unknown,
		isLoading: false,
		isError: false,
		refetch: refetchMock,
	},
};

vi.mock("@/trpc/react", () => ({
	api: {
		wishlist: {
			home: {
				useQuery: () => queryStateRef.current,
			},
		},
	},
}));

import { DashboardHomePage } from "@/components/features/dashboard/home/dashboard-home-page";

const nextStepAction: CompleteDraftAction = {
	kind: "complete_draft",
	wishlistId: "wl_1",
	wishlistTitle: "Baby shower de Emilia",
	wishlistStatus: "draft",
	isOwner: true,
	ownerName: null,
	eventDate: null,
	createdAt: "2026-06-01T00:00:00.000Z",
	description: "Falta la moneda.",
	destination: "/dashboard/wishlists/wl_1",
	readiness: {
		ready: false,
		checks: {
			title: true,
			eventType: true,
			slug: true,
			language: true,
			currency: false,
			visibleGift: true,
			images: true,
		},
	},
};

const zeroSummary = {
	activeWishlists: 0,
	totalUnits: 0,
	purchasedUnits: 0,
	pendingRsvps: 0,
};

afterEach(() => {
	cleanup();
	refetchMock.mockClear();
	queryStateRef.current = {
		data: undefined,
		isLoading: false,
		isError: false,
		refetch: refetchMock,
	};
});

describe("DashboardHomePage", () => {
	it("renders the loading skeleton while the query is in flight", () => {
		queryStateRef.current.isLoading = true;
		render(<DashboardHomePage />);

		expect(screen.getByTestId("home-skeleton")).toBeInTheDocument();
	});

	it("renders the error state and retries through refetch", () => {
		queryStateRef.current.isError = true;
		render(<DashboardHomePage />);

		expect(
			screen.getByText("No pudimos cargar tus acciones"),
		).toBeInTheDocument();

		fireEvent.click(screen.getByRole("button", { name: /reintentar/i }));
		expect(refetchMock).toHaveBeenCalled();
	});

	it("renders the pending-actions state with the next step and the summary", () => {
		queryStateRef.current.data = {
			actions: [nextStepAction],
			nextStep: nextStepAction,
			subsequentActions: [],
			upcomingEvent: null,
			summary: { ...zeroSummary, activeWishlists: 1 },
		};
		render(<DashboardHomePage />);

		expect(screen.getByText("Tu siguiente paso")).toBeInTheDocument();
		expect(screen.getByText("Baby shower de Emilia")).toBeInTheDocument();
		expect(screen.getByText("Resumen")).toBeInTheDocument();
	});

	it("renders the all-clear state when there are wishlists but no actions", () => {
		queryStateRef.current.data = {
			actions: [],
			nextStep: null,
			subsequentActions: [],
			upcomingEvent: null,
			summary: { ...zeroSummary, activeWishlists: 2 },
		};
		render(<DashboardHomePage />);

		expect(screen.getByText("Todo está encaminado")).toBeInTheDocument();
	});

	it("renders the first-run state with no summary when the user has no wishlists", () => {
		queryStateRef.current.data = {
			actions: [],
			nextStep: null,
			subsequentActions: [],
			upcomingEvent: null,
			summary: zeroSummary,
		};
		render(<DashboardHomePage />);

		expect(screen.getByText("Tu wishlist en tres pasos")).toBeInTheDocument();
		expect(screen.queryByText("Resumen")).not.toBeInTheDocument();
	});
});
