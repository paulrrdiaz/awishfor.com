// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EventProximityIndicator } from "./event-proximity-indicator";

describe("EventProximityIndicator", () => {
	it.each([
		["within_14_days", "Faltan 14 días para el evento"],
		["within_7_days", "Faltan 7 días para el evento"],
		["tomorrow", "El evento es mañana"],
		["today", "El evento es hoy"],
		["past", "El evento ya pasó"],
	] as const)("renders the %s date-boundary state", (stage, label) => {
		render(
			<EventProximityIndicator proximity={{ daysAway: 1, label, stage }} />,
		);
		expect(screen.getByText(label)).toBeVisible();
	});
});
