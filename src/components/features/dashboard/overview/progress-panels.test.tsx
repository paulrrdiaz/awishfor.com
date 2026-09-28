// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
	ApproxValuePanel,
	InvitationProgressPanel,
	PurchaseProgressPanel,
} from "./progress-panels";

const filledApproxValue = {
	receivedAmount: "100.00",
	goalAmount: "250.00",
	pricedGiftCount: 2,
	visibleGiftCount: 2,
	foreignReceived: [],
};

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

describe("ApproxValuePanel", () => {
	it("shows received value, goal, and coverage when prices are partial", () => {
		render(
			<ApproxValuePanel
				approxValue={{ ...filledApproxValue, visibleGiftCount: 3 }}
				currency="PEN"
				language="es"
			/>,
		);

		expect(screen.getByText("Valor aproximado recibido")).toBeVisible();
		expect(screen.getByText(/de.*250/)).toBeVisible();
		expect(screen.getByText("2 de 3 regalos con precio")).toBeVisible();
	});

	it("hides the coverage line when all visible gifts are priced", () => {
		render(
			<ApproxValuePanel
				approxValue={filledApproxValue}
				currency="PEN"
				language="es"
			/>,
		);

		expect(screen.queryByText(/regalos con precio/)).toBeNull();
	});

	it("footnotes received foreign-currency values without including them in the headline", () => {
		render(
			<ApproxValuePanel
				approxValue={{
					...filledApproxValue,
					foreignReceived: [{ currency: "USD", amount: "45.00" }],
				}}
				currency="PEN"
				language="es"
			/>,
		);

		expect(screen.getByText(/en otra moneda \(no incluido\)/)).toBeVisible();
	});

	it("shows an empty state without a zero amount", () => {
		render(
			<ApproxValuePanel
				approxValue={{
					receivedAmount: "0.00",
					goalAmount: "0.00",
					pricedGiftCount: 0,
					visibleGiftCount: 1,
					foreignReceived: [],
				}}
				currency="PEN"
				language="es"
			/>,
		);

		expect(
			screen.getByText(
				"Agrega precios a tus regalos para ver el valor aproximado.",
			),
		).toBeVisible();
		expect(screen.queryByText(/S\/.*0/)).toBeNull();
	});

	it("keeps the foreign-currency footnote in the foreign-only empty state", () => {
		render(
			<ApproxValuePanel
				approxValue={{
					receivedAmount: "0.00",
					goalAmount: "0.00",
					pricedGiftCount: 0,
					visibleGiftCount: 1,
					foreignReceived: [{ currency: "USD", amount: "45.00" }],
				}}
				currency="PEN"
				language="es"
			/>,
		);

		expect(
			screen.getByText(
				"Agrega precios a tus regalos para ver el valor aproximado.",
			),
		).toBeVisible();
		expect(screen.getByText(/en otra moneda \(no incluido\)/)).toBeVisible();
	});
});
