// @vitest-environment jsdom

import {
	act,
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const nuqs = vi.hoisted(() => ({
	query: { q: "María", status: "confirmed" },
	setQ: vi.fn(),
	setStatus: vi.fn(),
	setParams: vi.fn(),
}));

vi.mock("nuqs", () => ({
	useQueryState: (key: "q" | "status") => {
		if (key === "q") return [nuqs.query.q, nuqs.setQ];
		return [nuqs.query.status, nuqs.setStatus];
	},
	useQueryStates: () => [nuqs.query, nuqs.setParams],
}));

vi.mock("@/components/features/dashboard/guests/guest-sheet", () => ({
	GuestSheet: () => null,
}));

import { GuestStatusFilterChips } from "./guest-status-filter-chips";
import { GuestsEmptyState } from "./guests-empty-state";
import { GuestsFilteredEmptyState } from "./guests-filtered-empty-state";
import { GuestsSearchInput } from "./guests-search-input";

afterEach(() => {
	cleanup();
	vi.clearAllMocks();
	vi.useRealTimers();
	nuqs.query.q = "María";
	nuqs.query.status = "confirmed";
});

describe("guest filter controls", () => {
	it("shows global status counts and writes the selected status to URL state", () => {
		render(
			<GuestStatusFilterChips
				counts={{ all: 8, pending: 3, confirmed: 4, declined: 1 }}
			/>,
		);

		expect(screen.getByRole("button", { name: "Todos · 8" })).toBeVisible();
		expect(
			screen.getByRole("button", { name: "Pendientes · 3" }),
		).toBeVisible();
		expect(
			screen.getByRole("button", { name: "Confirmados · 4" }),
		).toHaveAttribute("aria-pressed", "true");
		expect(
			screen.getByRole("button", { name: "No asistirán · 1" }),
		).toBeVisible();

		fireEvent.click(screen.getByRole("button", { name: "Todos · 8" }));
		expect(nuqs.setStatus).toHaveBeenCalledWith(null);
	});

	it("updates the visible search value immediately and debounces its URL update", () => {
		vi.useFakeTimers();
		render(<GuestsSearchInput />);
		const input = screen.getByRole("searchbox", { name: "Buscar invitados" });

		fireEvent.change(input, { target: { value: "Ana" } });
		expect(input).toHaveValue("Ana");
		act(() => vi.advanceTimersByTime(300));
		expect(nuqs.setQ).toHaveBeenCalledWith("Ana");
	});

	it("resynchronizes the search input when URL state changes", async () => {
		const { rerender } = render(<GuestsSearchInput />);
		expect(screen.getByRole("searchbox")).toHaveValue("María");

		nuqs.query.q = "Diego";
		rerender(<GuestsSearchInput />);

		await waitFor(() =>
			expect(screen.getByRole("searchbox")).toHaveValue("Diego"),
		);
	});

	it("keeps filtered-results messaging distinct and clears both URL controls", () => {
		const { rerender } = render(<GuestsFilteredEmptyState />);
		expect(
			screen.getByRole("heading", { name: "Sin resultados" }),
		).toBeVisible();
		expect(screen.queryByText("Aún no has agregado invitados")).toBeNull();

		fireEvent.click(screen.getByRole("button", { name: "Quitar filtros" }));
		expect(nuqs.setParams).toHaveBeenCalledWith(null);

		rerender(<GuestsEmptyState wishlistId="wishlist_1" />);
		expect(
			screen.getByRole("heading", { name: "Aún no has agregado invitados" }),
		).toBeVisible();
	});
});
