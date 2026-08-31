// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ViewTrendPanel } from "./view-trend-panel";

const useQueryMock = vi.fn();
vi.mock("@/trpc/react", () => ({
	api: {
		wishlist: {
			overview: {
				useQuery: (...args: unknown[]) => useQueryMock(...args),
			},
		},
	},
}));

afterEach(() => {
	cleanup();
	useQueryMock.mockReset();
});

describe("ViewTrendPanel", () => {
	it("renders the initial window's series without querying", () => {
		useQueryMock.mockReturnValue({ data: undefined, isPending: false });

		render(
			<ViewTrendPanel
				initialSeries={[
					{ date: "2026-08-25", views: 0 },
					{ date: "2026-08-26", views: 0 },
					{ date: "2026-08-27", views: 5 },
				]}
				initialWindowDays={30}
				wishlistId="wl-1"
			/>,
		);

		expect(screen.getByText("Visitas por día")).toBeVisible();
		expect(useQueryMock).toHaveBeenCalledWith(
			{ wishlistId: "wl-1", viewWindowDays: 30 },
			expect.objectContaining({ enabled: false }),
		);
	});

	it("renders an empty state when every bucket in the window is zero", () => {
		useQueryMock.mockReturnValue({ data: undefined, isPending: false });

		render(
			<ViewTrendPanel
				initialSeries={[{ date: "2026-08-27", views: 0 }]}
				initialWindowDays={30}
				wishlistId="wl-1"
			/>,
		);

		expect(
			screen.getByText("Aún no hay visitas registradas en este periodo."),
		).toBeVisible();
	});

	it("re-queries with the selected window when switched away from the initial one", () => {
		useQueryMock.mockReturnValue({
			data: { viewSeries: [{ date: "2026-08-21", views: 2 }] },
			isPending: false,
		});

		render(
			<ViewTrendPanel
				initialSeries={[{ date: "2026-08-27", views: 5 }]}
				initialWindowDays={30}
				wishlistId="wl-1"
			/>,
		);

		fireEvent.click(screen.getByRole("button", { name: "7d" }));

		expect(useQueryMock).toHaveBeenCalledWith(
			{ wishlistId: "wl-1", viewWindowDays: 7 },
			expect.objectContaining({ enabled: true }),
		);
	});
});
