// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ActivityFeed } from "./activity-feed";

describe("ActivityFeed", () => {
	it("renders an empty state when nothing has happened", () => {
		render(<ActivityFeed activity={[]} language="es" />);
		expect(screen.getByText("Aún no hay actividad registrada.")).toBeVisible();
	});

	it("renders each entry with its kind badge", () => {
		render(
			<ActivityFeed
				activity={[
					{
						id: "rsvp-1",
						kind: "rsvp",
						label: "Luis confirmó su asistencia",
						occurredAt: new Date().toISOString(),
					},
					{
						id: "purchase-1",
						kind: "purchase",
						label: "Alguien marcó «Silla» como comprado",
						occurredAt: new Date().toISOString(),
					},
					{
						id: "opened-1",
						kind: "invite_opened",
						label: "Renee abrió su invitación",
						occurredAt: new Date().toISOString(),
					},
				]}
				language="es"
			/>,
		);

		expect(screen.getByText("Luis confirmó su asistencia")).toBeVisible();
		expect(screen.getByText("RSVP")).toBeVisible();
		expect(screen.getByText("Compra")).toBeVisible();
		expect(screen.getByText("Vista")).toBeVisible();
	});
});
