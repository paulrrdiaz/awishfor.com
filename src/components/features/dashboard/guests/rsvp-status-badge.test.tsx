// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Badge } from "@/components/ui/badge";
import { RsvpStatusBadge } from "./rsvp-status-badge";

describe("RsvpStatusBadge", () => {
	it("uses dedicated semantic treatment for declined RSVP responses", () => {
		render(<RsvpStatusBadge status="declined" />);

		expect(screen.getByText("No asistirá")).toHaveClass("bg-status-declined");
		expect(screen.getByText("No asistirá")).toHaveClass(
			"text-status-declined-foreground",
		);
	});

	it("keeps confirmed and pending RSVP treatments stable", () => {
		const { rerender } = render(<RsvpStatusBadge status="confirmed" />);
		expect(screen.getByText("Confirmado")).toHaveClass("bg-status-published");

		rerender(<RsvpStatusBadge status="pending" />);
		expect(screen.getByText("Pendiente")).toHaveClass("bg-status-draft");
	});

	it("keeps archived and destructive badge treatments stable", () => {
		const { rerender } = render(<Badge variant="archived">Archivado</Badge>);
		expect(screen.getByText("Archivado")).toHaveClass("bg-status-archived");

		rerender(<Badge variant="destructive">Eliminar</Badge>);
		expect(screen.getByText("Eliminar")).toHaveClass("bg-destructive/10");
	});
});
