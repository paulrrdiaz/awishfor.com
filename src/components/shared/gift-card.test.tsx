// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
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
		const onProductAction = vi.fn();
		const onPurchaseAction = vi.fn();

		render(
			<GiftCard
				actionsEnabled
				cardStyle="collage-row"
				gift={sampleGift}
				onProductAction={onProductAction}
				onPurchaseAction={onPurchaseAction}
			/>,
		);

		await user.click(
			screen.getByRole("button", {
				name: `Ver producto: ${sampleGift.name}`,
			}),
		);
		expect(onProductAction).toHaveBeenCalledWith(sampleGift);

		await user.click(
			screen.getByRole("button", {
				name: `Marcar como comprado: ${sampleGift.name}`,
			}),
		);
		expect(onPurchaseAction).toHaveBeenCalledOnce();
		expect(onPurchaseAction).toHaveBeenCalledWith(sampleGift);
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

describe("GiftCard actions across styles", () => {
	it.each([
		"card",
		"tilted",
		"collage",
		"collage-row",
		"row",
		"minimal",
	] as const)("routes product and purchase actions for %s cards", async (cardStyle) => {
		const user = userEvent.setup();
		const onProductAction = vi.fn();
		const onPurchaseAction = vi.fn();
		const { unmount } = render(
			<GiftCard
				actionsEnabled
				cardStyle={cardStyle}
				gift={sampleGift}
				onProductAction={onProductAction}
				onPurchaseAction={onPurchaseAction}
			/>,
		);

		await user.click(
			screen.getByRole("button", { name: /ver producto|ver regalo/i }),
		);
		await user.click(screen.getByRole("button", { name: /marcar|regalar/i }));

		expect(onProductAction).toHaveBeenCalledWith(sampleGift);
		expect(onPurchaseAction).toHaveBeenCalledWith(sampleGift);
		expect(
			screen.queryByRole("link", { name: /ver producto|ver regalo/i }),
		).toBeNull();
		unmount();
	});

	it("hides product and purchase actions when preview actions are disabled", () => {
		render(<GiftCard cardStyle="card" gift={sampleGift} />);
		expect(
			screen.queryByRole("button", { name: /ver producto|regalar/i }),
		).toBeNull();
	});
});

describe("GiftCard image fallback", () => {
	it("replaces an unavailable remote image with an accessible fallback", () => {
		render(
			<GiftCard
				cardStyle="card"
				gift={{
					...sampleGift,
					imageUrl: "https://example.com/unavailable.jpg",
				}}
			/>,
		);

		fireEvent.error(screen.getByRole("img", { name: sampleGift.name }));

		expect(
			screen.getByRole("img", {
				name: `Imagen no disponible para ${sampleGift.name}`,
			}),
		).toBeVisible();
		expect(screen.getByText("Imagen no disponible")).toBeVisible();
		expect(
			screen.queryByRole("img", { name: sampleGift.name }),
		).not.toBeInTheDocument();
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
		const onPurchaseAction = vi.fn();

		const { unmount } = render(
			<GiftCard
				actionsEnabled
				cardStyle="collage-row"
				gift={sampleGift}
				onPurchaseAction={onPurchaseAction}
			/>,
		);
		const nameBefore = screen.getByRole("heading").textContent;
		const buttonNameBefore = screen
			.getByRole("button", { name: /marcar como comprado/i })
			.getAttribute("aria-label");
		unmount();

		render(
			<GiftCard
				actionsEnabled
				cardStyle="collage-row"
				gift={sampleGift}
				motif={motif}
				motifTreatment="band"
				onPurchaseAction={onPurchaseAction}
			/>,
		);
		expect(screen.getByRole("heading").textContent).toBe(nameBefore);
		expect(
			screen
				.getByRole("button", { name: /marcar como comprado/i })
				.getAttribute("aria-label"),
		).toBe(buttonNameBefore);

		await user.click(
			screen.getByRole("button", { name: /marcar como comprado/i }),
		);
		expect(onPurchaseAction).toHaveBeenCalledWith(sampleGift);
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
