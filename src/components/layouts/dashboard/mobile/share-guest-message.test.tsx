// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { ShareGuestMessage } from "./share-guest-message";

afterEach(cleanup);

const baseProps = {
	eventType: "wedding",
	guestName: "Lucía",
	inviteUrl: "https://awishfor.com/w/boda/lucia",
};

describe("ShareGuestMessage", () => {
	it("addresses the guest by name and carries their personal link in the message", () => {
		render(<ShareGuestMessage {...baseProps} initialPurpose="invitation" />);

		expect(screen.getAllByText(/Lucía/).length).toBeGreaterThan(0);
		expect(
			screen.getByText(/https:\/\/awishfor\.com\/w\/boda\/lucia/),
		).toBeInTheDocument();
	});

	it("starts on the initial purpose variant passed in", () => {
		render(<ShareGuestMessage {...baseProps} initialPurpose="reminder" />);

		expect(
			screen.getByText(/recordatorio de nuestra boda/i),
		).toBeInTheDocument();
	});

	it("switches the message body when a different purpose variant is selected", async () => {
		const user = userEvent.setup();
		render(<ShareGuestMessage {...baseProps} initialPurpose="invitation" />);

		await user.click(screen.getByRole("button", { name: "Gracias" }));

		expect(screen.getByText(/Muchas gracias/)).toBeInTheDocument();
	});

	it("points the WhatsApp send target at the currently selected variant", async () => {
		const user = userEvent.setup();
		render(<ShareGuestMessage {...baseProps} initialPurpose="invitation" />);

		await user.click(screen.getByRole("button", { name: "Recordatorio" }));

		const link = screen.getByRole("link", { name: /Enviar por WhatsApp/ });
		const decoded = decodeURIComponent(
			link.getAttribute("href")?.replace("https://wa.me/?text=", "") ?? "",
		);
		expect(decoded).toContain("recordatorio");
	});
});
