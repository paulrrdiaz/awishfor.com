// @vitest-environment jsdom

import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { PublicGuestViewModel } from "@/server/mappers/view-models";
import { RsvpSection } from "./rsvp-section";

const mutateMock = vi.hoisted(() => vi.fn());
const refreshMock = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
	useRouter: () => ({ refresh: refreshMock }),
}));

vi.mock("@/trpc/react", () => ({
	api: {
		invite: {
			respond: {
				useMutation: () => ({
					mutate: mutateMock,
					isPending: false,
				}),
			},
		},
	},
}));

vi.mock("@/components/providers/public-wishlist-providers", () => ({
	PublicWishlistProviders: ({ children }: { children: React.ReactNode }) => (
		<div data-testid="public-wishlist-trpc-provider">{children}</div>
	),
}));

function makeGuest(
	overrides: Partial<PublicGuestViewModel> = {},
): PublicGuestViewModel {
	return {
		slug: "lady-castillo",
		primaryName: "Lady Castillo",
		status: "pending",
		extraGuests: [],
		...overrides,
	};
}

const defaultProps = {
	wishlistSlug: "lista-de-boda",
	rsvpDeadline: null,
	eventDate: null,
	eventTime: null,
	eventLocation: null,
};

beforeEach(() => {
	mutateMock.mockClear();
	refreshMock.mockClear();
});

afterEach(() => {
	cleanup();
});

describe("RsvpSection", () => {
	it("returns nothing when there is no guest", () => {
		const { container } = render(
			<RsvpSection {...defaultProps} guest={undefined} />,
		);
		expect(container).toBeEmptyDOMElement();
	});

	it("provides tRPC context for an invited guest", () => {
		render(<RsvpSection {...defaultProps} guest={makeGuest()} />);

		expect(screen.getByTestId("public-wishlist-trpc-provider")).toBeVisible();
	});

	it("keeps the submit control disabled until the primary guest chooses", async () => {
		const user = userEvent.setup();
		render(<RsvpSection {...defaultProps} guest={makeGuest()} />);

		const submit = screen.getByRole("button", { name: "Enviar confirmación" });
		expect(submit).toBeDisabled();

		await user.click(screen.getByRole("button", { name: "Sí, ahí estaré" }));
		expect(submit).toBeEnabled();
	});

	it("defaults every extra guest to attending", () => {
		render(
			<RsvpSection
				{...defaultProps}
				guest={makeGuest({
					extraGuests: [
						{ id: "g1", name: "Ana", status: "pending" },
						{ id: "g2", name: "Luis", status: "pending" },
					],
				})}
			/>,
		);

		const viene = screen.getAllByRole("button", { name: "Viene" });
		expect(viene).toHaveLength(2);
	});

	it("collapses the extra-guest rows when the primary declines", async () => {
		const user = userEvent.setup();
		render(
			<RsvpSection
				{...defaultProps}
				guest={makeGuest({
					extraGuests: [{ id: "g1", name: "Ana", status: "pending" }],
				})}
			/>,
		);

		expect(screen.getByText("Ana")).toBeVisible();
		await user.click(screen.getByRole("button", { name: "No podré ir" }));
		expect(screen.queryByText("Ana")).toBeNull();
	});

	it("submits the primary choice with every extra guest's status", async () => {
		const user = userEvent.setup();
		render(
			<RsvpSection
				{...defaultProps}
				guest={makeGuest({
					extraGuests: [
						{ id: "g1", name: "Ana", status: "pending" },
						{ id: "g2", name: "Luis", status: "pending" },
					],
				})}
			/>,
		);

		await user.click(screen.getByRole("button", { name: "Sí, ahí estaré" }));
		const luisRow = screen
			.getByText("Luis")
			.closest("div.justify-between") as HTMLElement;
		await user.click(within(luisRow).getByRole("button", { name: "No viene" }));
		await user.click(
			screen.getByRole("button", { name: "Enviar confirmación" }),
		);

		expect(mutateMock).toHaveBeenCalledWith({
			wishlistSlug: "lista-de-boda",
			guestSlug: "lady-castillo",
			status: "confirmed",
			extraGuests: [
				{ id: "g1", status: "confirmed" },
				{ id: "g2", status: "declined" },
			],
		});
	});

	it("omits the extra-guest area when the invite has no extra guests", () => {
		render(<RsvpSection {...defaultProps} guest={makeGuest()} />);
		expect(screen.queryByText(/Tu acompañante/)).toBeNull();
	});
});
