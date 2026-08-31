// @vitest-environment jsdom

import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { WishlistStatusStrip } from "./wishlist-status-strip";

vi.mock("next/navigation", () => ({
	useRouter: () => ({ refresh: vi.fn() }),
}));

const publishMutateMock = vi.fn();
const restoreMutateMock = vi.fn();
vi.mock("@/trpc/react", () => ({
	api: {
		wishlist: {
			publish: {
				useMutation: () => ({ mutate: publishMutateMock, isPending: false }),
			},
			restore: {
				useMutation: () => ({ mutate: restoreMutateMock, isPending: false }),
			},
		},
	},
}));

afterEach(() => {
	cleanup();
	publishMutateMock.mockClear();
	restoreMutateMock.mockClear();
});

const READY_READINESS = {
	ready: true,
	checks: {
		title: true,
		eventType: true,
		slug: true,
		language: true,
		currency: true,
		visibleGift: true,
		images: true,
	},
};

const PARTIAL_READINESS = {
	ready: false,
	checks: {
		...READY_READINESS.checks,
		visibleGift: false,
		images: false,
	},
};

describe("WishlistStatusStrip", () => {
	it("renders the draft variant with readiness progress and a publish action", () => {
		render(
			<WishlistStatusStrip
				eventType="wedding"
				isOwner
				publicUrlPath="/w/demo"
				readiness={PARTIAL_READINESS}
				status="draft"
				wishlistId="wl_1"
			/>,
		);

		expect(screen.getByText("5 de 7 listos")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: /Publicar/ })).toBeDisabled();
	});

	it("enables publishing once readiness is met", () => {
		render(
			<WishlistStatusStrip
				eventType="wedding"
				isOwner
				publicUrlPath="/w/demo"
				readiness={READY_READINESS}
				status="draft"
				wishlistId="wl_1"
			/>,
		);

		const button = screen.getByRole("button", { name: /Publicar/ });
		expect(button).toBeEnabled();
		button.click();
		expect(publishMutateMock).toHaveBeenCalledWith({ wishlistId: "wl_1" });
	});

	it("renders the published variant with the public URL and share actions", () => {
		render(
			<WishlistStatusStrip
				eventType="wedding"
				isOwner
				publicUrlPath="/w/demo"
				readiness={READY_READINESS}
				status="published"
				totalViews={12}
				wishlistId="wl_1"
			/>,
		);

		expect(screen.getByText(/\/w\/demo/)).toBeInTheDocument();
		expect(screen.getByText("12 vistas")).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: "Copiar enlace" }),
		).toBeInTheDocument();
		expect(screen.getByRole("link", { name: /WhatsApp/ })).toBeInTheDocument();
	});

	it("confirms a successful copy of the public URL", async () => {
		Object.defineProperty(navigator, "clipboard", {
			configurable: true,
			value: { writeText: vi.fn().mockResolvedValue(undefined) },
		});

		render(
			<WishlistStatusStrip
				eventType="wedding"
				isOwner
				publicUrlPath="/w/demo"
				readiness={READY_READINESS}
				status="published"
				wishlistId="wl_1"
			/>,
		);

		screen.getByRole("button", { name: "Copiar enlace" }).click();
		await waitFor(() =>
			expect(screen.getByText("Enlace copiado")).toBeInTheDocument(),
		);
	});

	it("surfaces a copy failure instead of a success state", async () => {
		Object.defineProperty(navigator, "clipboard", {
			configurable: true,
			value: {
				writeText: vi.fn().mockRejectedValue(new Error("denied")),
			},
		});

		render(
			<WishlistStatusStrip
				eventType="wedding"
				isOwner
				publicUrlPath="/w/demo"
				readiness={READY_READINESS}
				status="published"
				wishlistId="wl_1"
			/>,
		);

		screen.getByRole("button", { name: "Copiar enlace" }).click();
		await waitFor(() =>
			expect(
				screen.getByText("No pudimos copiar el enlace."),
			).toBeInTheDocument(),
		);
		expect(screen.queryByText("Enlace copiado")).not.toBeInTheDocument();
	});

	it("renders the archived variant with a restore action for the owner", () => {
		render(
			<WishlistStatusStrip
				eventType="wedding"
				isOwner
				publicUrlPath="/w/demo"
				readiness={READY_READINESS}
				status="archived"
				wishlistId="wl_1"
			/>,
		);

		expect(
			screen.getByText("Esta wishlist está archivada"),
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: "Restaurar" }),
		).toBeInTheDocument();
	});

	it("hides the restore action from a non-owner on an archived wishlist", () => {
		render(
			<WishlistStatusStrip
				eventType="wedding"
				isOwner={false}
				publicUrlPath="/w/demo"
				readiness={READY_READINESS}
				status="archived"
				wishlistId="wl_1"
			/>,
		);

		expect(
			screen.queryByRole("button", { name: "Restaurar" }),
		).not.toBeInTheDocument();
	});
});
