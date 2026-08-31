// @vitest-environment jsdom

import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { PublicGuestViewModel } from "@/server/mappers/view-models";
import { RsvpSection } from "./rsvp-section";

const mutateMock = vi.hoisted(() => vi.fn());
const refreshMock = vi.hoisted(() => vi.fn());
const analytics = vi.hoisted(() => ({ captureRsvp: vi.fn() }));
const respondCallbacks = vi.hoisted(() => ({
	onSuccess: undefined as
		| ((data: { status: "confirmed" | "declined" }) => void)
		| undefined,
}));

vi.mock("next/navigation", () => ({
	useRouter: () => ({ refresh: refreshMock }),
}));

vi.mock("@/trpc/react", () => ({
	api: {
		invite: {
			respond: {
				useMutation: (options: {
					onSuccess?: typeof respondCallbacks.onSuccess;
				}) => {
					respondCallbacks.onSuccess = options.onSuccess;
					return { isPending: false, mutate: mutateMock };
				},
			},
		},
	},
}));

vi.mock("@/components/providers/public-wishlist-providers", () => ({
	PublicWishlistProviders: ({ children }: { children: React.ReactNode }) => (
		<div data-testid="public-wishlist-trpc-provider">{children}</div>
	),
}));

vi.mock(
	"@/components/layouts/public-wishlist/public-wishlist-analytics",
	() => ({ usePublicWishlistAnalytics: () => analytics }),
);

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
	eventTitle: "Boda de Lady",
	eventDescription: "Una tarde para celebrar juntos.",
	inviteUrl: "https://awishfor.com/w/lista-de-boda/lady-castillo",
	rsvpDeadline: null,
	eventDate: null,
	eventTime: null,
	eventLocation: null,
};

beforeEach(() => {
	mutateMock.mockClear();
	refreshMock.mockClear();
	analytics.captureRsvp.mockClear();
	respondCallbacks.onSuccess = undefined;
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

	it("renders owner-locked responses read-only", () => {
		render(
			<RsvpSection
				{...defaultProps}
				eventDate="2026-10-17"
				guest={makeGuest({
					status: "confirmed",
					responseSource: "owner",
					responseLockedAt: "2026-06-28T10:00:00.000Z",
				})}
			/>,
		);

		expect(
			screen.getByText("Respuesta registrada por el anfitrión"),
		).toBeVisible();
		expect(screen.queryByRole("button", { name: "Cambiar" })).toBeNull();
	});

	it("keeps the RSVP deadline's stored calendar day for viewers west of UTC", () => {
		const previousTimezone = process.env.TZ;
		process.env.TZ = "America/Lima";

		try {
			render(
				<RsvpSection
					{...defaultProps}
					guest={makeGuest()}
					rsvpDeadline="2026-09-13T00:00:00.000Z"
				/>,
			);

			expect(screen.getByText("Domingo, 13 de setiembre")).toBeVisible();
		} finally {
			if (previousTimezone === undefined) {
				delete process.env.TZ;
			} else {
				process.env.TZ = previousTimezone;
			}
		}
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

	it("captures RSVP only after success with status and party size", async () => {
		const user = userEvent.setup();
		render(
			<RsvpSection
				{...defaultProps}
				guest={makeGuest({
					extraGuests: [{ id: "g1", name: "Ana", status: "pending" }],
				})}
			/>,
		);

		await user.click(screen.getByRole("button", { name: "Sí, ahí estaré" }));
		await user.click(
			screen.getByRole("button", { name: "Enviar confirmación" }),
		);
		expect(analytics.captureRsvp).not.toHaveBeenCalled();
		respondCallbacks.onSuccess?.({ status: "confirmed" });
		expect(analytics.captureRsvp).toHaveBeenCalledWith("confirmed", 2);
	});

	it("shows the calendar save action only for confirmed guests with an event date", () => {
		const { rerender } = render(
			<RsvpSection
				{...defaultProps}
				eventDate="2026-10-17"
				guest={makeGuest({ status: "confirmed" })}
			/>,
		);

		expect(
			screen.getByRole("button", { name: "Guardar en mi calendario" }),
		).toBeVisible();

		rerender(
			<RsvpSection
				{...defaultProps}
				eventDate="2026-10-17"
				guest={makeGuest({ status: "declined" })}
			/>,
		);
		expect(
			screen.queryByRole("button", { name: "Guardar en mi calendario" }),
		).toBeNull();
	});

	it("does not show the calendar action for pending guests or date-less events", () => {
		const { rerender } = render(
			<RsvpSection
				{...defaultProps}
				eventDate="2026-10-17"
				guest={makeGuest()}
			/>,
		);
		expect(
			screen.queryByRole("button", { name: "Guardar en mi calendario" }),
		).toBeNull();

		rerender(
			<RsvpSection
				{...defaultProps}
				eventDate={null}
				guest={makeGuest({ status: "confirmed" })}
			/>,
		);
		expect(
			screen.queryByRole("button", { name: "Guardar en mi calendario" }),
		).toBeNull();
	});
});
