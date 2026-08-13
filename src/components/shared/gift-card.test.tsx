// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { resolveMotif } from "@/config/motifs";
import { GiftCard } from "./gift-card";
import { sampleGift } from "./story-data";

const motif = resolveMotif("bear-cloud");
if (!motif) {
	throw new Error("bear-cloud motif not found in catalog");
}

describe("GiftCard collage row", () => {
	it("offers separate product and purchase actions", async () => {
		const user = userEvent.setup();
		const onGiftAction = vi.fn();

		render(
			<GiftCard
				actionsEnabled
				cardStyle="collage-row"
				gift={sampleGift}
				onGiftAction={onGiftAction}
			/>,
		);

		const productLink = screen.getByRole("link", {
			name: `Abrir ${sampleGift.name} en una nueva pestaña`,
		});
		expect(productLink).toHaveAttribute("href", sampleGift.productUrl);
		expect(productLink).toHaveAttribute("target", "_blank");
		expect(productLink).toHaveAttribute("rel", "noopener noreferrer");

		await user.click(
			screen.getByRole("button", {
				name: `Marcar como comprado: ${sampleGift.name}`,
			}),
		);
		expect(onGiftAction).toHaveBeenCalledOnce();
		expect(onGiftAction).toHaveBeenCalledWith(sampleGift);
	});

	it("hides both actions once the gift is purchased", () => {
		render(
			<GiftCard
				actionsEnabled
				cardStyle="collage-row"
				gift={{ ...sampleGift, remainingQuantity: 0, status: "purchased" }}
			/>,
		);

		expect(screen.queryByRole("link")).not.toBeInTheDocument();
		expect(screen.queryByRole("button")).not.toBeInTheDocument();
	});
});

describe("GiftCard tilted style", () => {
	it("renders a heavier drop shadow than the default card style", () => {
		const { container: tiltedContainer } = render(
			<GiftCard cardStyle="tilted" gift={sampleGift} />,
		);
		const { container: cardContainer } = render(
			<GiftCard cardStyle="card" gift={sampleGift} />,
		);

		const tiltedArticle = tiltedContainer.querySelector("article");
		const cardArticle = cardContainer.querySelector("article");
		expect(tiltedArticle?.className).toContain(
			"shadow-[0_16px_36px_rgba(30,50,80,.20)]",
		);
		expect(cardArticle?.className).not.toContain("shadow-[0_16px_36px");
	});

	it("still renders the gift name, price and action for the tilted style", () => {
		render(<GiftCard actionsEnabled cardStyle="tilted" gift={sampleGift} />);
		expect(
			screen.getByRole("heading", { name: sampleGift.name }),
		).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Regalar" })).toBeInTheDocument();
	});
});

describe("GiftCard motif sticker", () => {
	it("keeps the accessible name of every control unchanged when a motif sticker is added", async () => {
		const user = userEvent.setup();
		const onGiftAction = vi.fn();

		const { unmount } = render(
			<GiftCard
				actionsEnabled
				cardStyle="collage-row"
				gift={sampleGift}
				onGiftAction={onGiftAction}
			/>,
		);
		const nameBefore = screen.getByRole("heading").textContent;
		const linkNameBefore = screen.getByRole("link").getAttribute("aria-label");
		const buttonNameBefore = screen
			.getByRole("button")
			.getAttribute("aria-label");
		unmount();

		render(
			<GiftCard
				actionsEnabled
				cardStyle="collage-row"
				gift={sampleGift}
				motif={motif}
				motifTreatment="band"
				onGiftAction={onGiftAction}
			/>,
		);
		expect(screen.getByRole("heading").textContent).toBe(nameBefore);
		expect(screen.getByRole("link").getAttribute("aria-label")).toBe(
			linkNameBefore,
		);
		expect(screen.getByRole("button").getAttribute("aria-label")).toBe(
			buttonNameBefore,
		);

		await user.click(screen.getByRole("button"));
		expect(onGiftAction).toHaveBeenCalledWith(sampleGift);
	});

	it("marks every motif element aria-hidden so it never registers a role", () => {
		const { container } = render(
			<GiftCard
				cardStyle="card"
				gift={sampleGift}
				motif={motif}
				motifTreatment="scene"
			/>,
		);
		const motifElements = container.querySelectorAll(".mot");
		expect(motifElements.length).toBeGreaterThan(0);
		for (const el of motifElements) {
			expect(el).toHaveAttribute("aria-hidden", "true");
		}
	});

	it("does not obscure the gift image, name, price or priority badge", () => {
		render(
			<GiftCard
				cardStyle="card"
				gift={{
					...sampleGift,
					imageUrl: "https://example.com/cover.jpg",
					priority: "high",
				}}
				motif={motif}
				motifTreatment="band"
			/>,
		);
		expect(screen.getByRole("img", { name: sampleGift.name })).toBeVisible();
		expect(
			screen.getByRole("heading", { name: sampleGift.name }),
		).toBeVisible();
		expect(screen.getByText(/★/)).toBeVisible();
	});
});
