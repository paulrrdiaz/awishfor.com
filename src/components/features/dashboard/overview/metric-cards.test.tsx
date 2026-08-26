// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MetricCards } from "./metric-cards";

const baseMetrics = {
	availableGifts: 2,
	purchasedGifts: 1,
	purchasedUnits: 1,
	totalGifts: 3,
	totalUnits: 3,
};

describe("MetricCards", () => {
	it("renders owner analytics and an explicit no-views-yet state", () => {
		render(
			<MetricCards
				metrics={{
					...baseMetrics,
					latestViewAt: null,
					totalViews: 0,
					uniqueVisitors: 0,
				}}
			/>,
		);

		expect(screen.getByText("Vistas totales")).toBeVisible();
		expect(screen.getByText("Visitantes aprox.")).toBeVisible();
		expect(screen.getByText("Aún no hay vistas")).toBeVisible();
	});

	it("does not render analytics when the owner fields are absent", () => {
		render(<MetricCards metrics={baseMetrics} />);
		expect(screen.queryByText("Vistas totales")).toBeNull();
	});
});
