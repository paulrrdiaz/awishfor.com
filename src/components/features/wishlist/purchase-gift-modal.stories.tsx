import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { TRPCReactProvider } from "@/trpc/react";
import { PurchaseGiftModal } from "./purchase-gift-modal";

const gift = {
	id: "gift-1",
	name: "Juego de sábanas",
	productUrl: "https://example.com/sabanas",
	imageUrl: null,
	storeName: "Casa & Hogar",
	priceAmount: "289.00",
	priceCurrency: "PEN",
	quantityNeeded: 2,
	priority: "high",
	publicNote: "Preferimos tonos neutros.",
	sortOrder: 1,
	categoryId: "cat-1",
	status: "available" as const,
	remainingQuantity: 2,
};

const meta = {
	component: PurchaseGiftModal,
	decorators: [
		(Story) => (
			<TRPCReactProvider>
				<div className="mx-auto max-w-md">
					<Story />
				</div>
			</TRPCReactProvider>
		),
	],
	title: "Features/Wishlist/PurchaseGiftModal",
} satisfies Meta<typeof PurchaseGiftModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Form: Story = {
	args: {
		debugState: { phase: "form" },
		gift,
		onOpenChange: () => undefined,
		open: true,
	},
};

export const Loading: Story = {
	args: {
		debugState: { phase: "loading" },
		gift,
		onOpenChange: () => undefined,
		open: true,
	},
};

export const Success: Story = {
	args: {
		debugState: {
			guestName: "Ana García",
			phase: "success",
			undoSecondsLeft: 8,
		},
		gift,
		onOpenChange: () => undefined,
		open: true,
	},
};

export const UndoAvailable: Story = {
	args: {
		debugState: {
			guestName: "Ana García",
			phase: "undo-available",
			undoSecondsLeft: 5,
		},
		gift,
		onOpenChange: () => undefined,
		open: true,
	},
};

export const UndoExpired: Story = {
	args: {
		debugState: {
			guestName: "Ana García",
			phase: "undo-expired",
			undoSecondsLeft: 0,
		},
		gift,
		onOpenChange: () => undefined,
		open: true,
	},
};

export const PurchaseError: Story = {
	args: {
		debugState: {
			phase: "purchase-error",
			purchaseErrorMessage:
				"No pudimos confirmar tu regalo. Vuelve a intentarlo.",
		},
		gift,
		onOpenChange: () => undefined,
		open: true,
	},
};
