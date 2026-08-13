// @vitest-environment jsdom
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { GiftGrid } from "./gift-grid";
import { sampleGifts } from "./story-data";

describe("GiftGrid tilted style", () => {
	it("applies positional rotation classes to the grid wrapper", () => {
		const { container } = render(
			<GiftGrid giftCardStyle="tilted" gifts={sampleGifts} />,
		);
		const wrapper = container.firstElementChild;
		expect(wrapper?.className).toContain("nth-child(3n+1)");
		expect(wrapper?.className).toContain("nth-child(3n+2)");
		expect(wrapper?.className).toContain("nth-child(3n+3)");
	});

	it("leaves other presentations without rotation classes", () => {
		const { container } = render(
			<GiftGrid giftCardStyle="card" gifts={sampleGifts} />,
		);
		const wrapper = container.firstElementChild;
		expect(wrapper?.className).not.toContain("nth-child");
	});
});
