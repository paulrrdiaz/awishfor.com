// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
	InvitationProgressPanel,
	PurchaseProgressPanel,
} from "./progress-panels";

describe("PurchaseProgressPanel", () => {
	it("reflects purchased units as a percentage", () => {
		render(<PurchaseProgressPanel purchasedUnits={1} totalUnits={4} />);
		expect(screen.getByText("25%")).toBeVisible();
		expect(screen.getByText("1 de 4 regalos")).toBeVisible();
	});

	it("renders an empty state instead of dividing by zero", () => {
		render(<PurchaseProgressPanel purchasedUnits={0} totalUnits={0} />);
		expect(
			screen.getByText("Aún no hay regalos en esta wishlist."),
		).toBeVisible();
		expect(screen.queryByText("0%")).toBeNull();
	});
});

describe("InvitationProgressPanel", () => {
	it("calls out how many invitations remain unopened", () => {
		render(
			<InvitationProgressPanel
				openedInvitations={1}
				totalInvitations={4}
				unopenedInvitations={3}
			/>,
		);
		expect(screen.getByText("invitaciones abiertas")).toBeVisible();
		expect(
			screen.getByText("3 sin abrir · recordar por WhatsApp"),
		).toBeVisible();
	});

	it("renders an empty state instead of dividing by zero", () => {
		render(
			<InvitationProgressPanel
				openedInvitations={0}
				totalInvitations={0}
				unopenedInvitations={0}
			/>,
		);
		expect(
			screen.getByText("Aún no se han enviado invitaciones."),
		).toBeVisible();
	});
});
