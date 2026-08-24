// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EventDetails } from "./event-details";

const wishlist = {
	eventDate: "2026-03-05T00:00:00.000Z",
	eventTime: "18:00",
	endTime: "20:00",
	eventLocation: "Casa de Ana",
	dressCode: "Casual",
	language: "es",
};

describe("EventDetails", () => {
	it("renders all three cards when data is present", () => {
		render(<EventDetails wishlist={wishlist} />);
		expect(screen.getByText("Fecha")).toBeInTheDocument();
		expect(screen.getByText("Lugar")).toBeInTheDocument();
		expect(screen.getByText("Casa de Ana")).toBeInTheDocument();
	});

	it("renders the date and time range on separate lines in the Fecha block", () => {
		render(<EventDetails wishlist={wishlist} />);
		expect(screen.getByText(/Jueves, 5 de marzo de 2026/i)).toBeInTheDocument();
		expect(screen.getByText(/6:00.*–.*8:00/i)).toBeInTheDocument();
	});

	it("keeps showing the start time for lists without an end time", () => {
		render(<EventDetails wishlist={{ ...wishlist, endTime: null }} />);
		expect(screen.getByText(/^6:00/i)).toBeInTheDocument();
	});

	it("omits the section when no details are present", () => {
		const { container } = render(
			<EventDetails
				wishlist={{
					eventDate: null,
					eventTime: null,
					endTime: null,
					eventLocation: null,
					dressCode: null,
					language: "es",
				}}
			/>,
		);
		expect(container).toBeEmptyDOMElement();
	});

	it("labels the dress-code card 'Código de vestimenta' in the block presentation", () => {
		render(<EventDetails wishlist={wishlist} />);
		expect(screen.getByText("Código de vestimenta")).toBeInTheDocument();
		expect(screen.queryByText("Dresscode")).not.toBeInTheDocument();
	});

	it("labels the dress-code card 'Dresscode' in the compact presentation", () => {
		render(<EventDetails variant="compact" wishlist={wishlist} />);
		expect(screen.getByText("Dresscode")).toBeInTheDocument();
		expect(screen.queryByText("Código de vestimenta")).not.toBeInTheDocument();
	});

	it("renders the same three cards from the same data in both presentations", () => {
		const { unmount } = render(<EventDetails wishlist={wishlist} />);
		expect(screen.getByText("Casa de Ana")).toBeInTheDocument();
		unmount();

		render(<EventDetails variant="compact" wishlist={wishlist} />);
		expect(screen.getByText("Casa de Ana")).toBeInTheDocument();
	});
});
