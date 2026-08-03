// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { NewsletterForm } from "./newsletter-form";

describe("NewsletterForm", () => {
	it("labels the email field and keeps the submit control operable", () => {
		render(<NewsletterForm />);

		const input = screen.getByLabelText("Correo electrónico");
		expect(input).toHaveAttribute("type", "email");

		const submit = screen.getByRole("button", { name: "Unirme" });
		expect(submit).not.toBeDisabled();
	});

	it("acknowledges submission without claiming a stored subscription", () => {
		render(<NewsletterForm />);

		fireEvent.change(screen.getByLabelText("Correo electrónico"), {
			target: { value: "ana@example.com" },
		});
		fireEvent.click(screen.getByRole("button", { name: "Unirme" }));

		const ack = screen.getByRole("status");
		expect(ack.textContent).not.toMatch(/suscri/i);
		expect(ack.textContent).not.toMatch(/guardad/i);
		expect(
			screen.queryByLabelText("Correo electrónico"),
		).not.toBeInTheDocument();
	});
});
