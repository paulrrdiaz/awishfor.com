// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MetricCards } from "./metric-cards";

const baseMetrics = {
	totalGifts: 4,
	purchasedGifts: 1,
	confirmedGuests: 1,
	totalGuests: 4,
};

describe("MetricCards", () => {
	it("renders the ungated cards without the owner-only view cards", () => {
		render(<MetricCards metrics={baseMetrics} />);

		expect(screen.getByText("Regalos")).toBeVisible();
		expect(screen.getByText("Comprados")).toBeVisible();
		expect(screen.getByText("Confirmados")).toBeVisible();
		expect(screen.queryByText("Visitas")).toBeNull();
		expect(screen.queryByText("Visitantes únicos")).toBeNull();
		expect(screen.queryByText("Tasa de compra")).toBeNull();
	});

	it("renders the owner view cards, with a placeholder conversion rate when there are no visitors", () => {
		render(
			<MetricCards
				metrics={{
					...baseMetrics,
					totalViews: 37,
					uniqueVisitors: 0,
					conversionRate: undefined,
				}}
			/>,
		);

		expect(screen.getByText("Visitas")).toBeVisible();
		expect(screen.getByText("37")).toBeVisible();
		expect(screen.getByText("Tasa de compra")).toBeVisible();
		expect(screen.getByText("—")).toBeVisible();
	});

	it("formats the conversion rate as a percentage when available", () => {
		render(
			<MetricCards
				metrics={{
					...baseMetrics,
					totalViews: 37,
					uniqueVisitors: 21,
					conversionRate: 0.047,
				}}
			/>,
		);

		expect(screen.getByText("4.7%")).toBeVisible();
	});
});
