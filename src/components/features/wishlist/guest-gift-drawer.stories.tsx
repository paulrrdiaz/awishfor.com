import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { TRPCReactProvider } from "@/trpc/react";
import { GuestGiftDrawer } from "./guest-gift-drawer";

const gift = {
	id: "gift-1",
	name: "Juego de sábanas",
	productUrl: "https://example.com/sabanas",
	imageUrl: null,
	storeName: "Casa & Hogar",
	priceAmount: "289.00",
	priceCurrency: "PEN",
	quantityNeeded: 2,
	priority: "high" as const,
	publicNote: null,
	sortOrder: 1,
	categoryId: "cat-1",
	status: "available" as const,
	remainingQuantity: 2,
};

const meta = {
	component: GuestGiftDrawer,
	decorators: [
		(Story) => (
			<TRPCReactProvider>
				<div className="public-theme min-h-screen">
					<Story />
				</div>
			</TRPCReactProvider>
		),
	],
	title: "Features/Wishlist/GuestGiftDrawer",
} satisfies Meta<typeof GuestGiftDrawer>;

export default meta;
type Story = StoryObj<typeof meta>;

const common = {
	gift,
	onOpenChange: () => undefined,
	onViewChange: () => undefined,
	open: true,
};

export const ProductWithDelivery: Story = {
	args: {
		...common,
		delivery: {
			address: "Av. Universidad 1500",
			documentId: "46737335",
			line: "Ana Beltrán, DNI: 46737335, Av. Universidad 1500",
			phone: null,
			recipientName: "Ana Beltrán",
			rest: "Av. Universidad 1500",
		},
		view: "product",
	},
};
export const ProductWithoutDelivery: Story = {
	args: { ...common, delivery: null, view: "product" },
};
export const PurchaseForm: Story = { args: { ...common, view: "purchase" } };
export const PurchaseLoading: Story = {
	args: {
		...common,
		debugState: { isLoading: true, view: "purchase" },
		view: "purchase",
	},
};
export const PurchaseError: Story = {
	args: {
		...common,
		debugState: {
			purchaseError: "No pudimos confirmar tu regalo.",
			view: "purchase",
		},
		view: "purchase",
	},
};
export const SuccessWithUndo: Story = {
	args: {
		...common,
		debugState: {
			guestName: "Ana García",
			undoExpiresAt: "2099-01-01T00:00:00.000Z",
			view: "success",
		},
		view: "success",
	},
};
export const SuccessExpired: Story = {
	args: {
		...common,
		debugState: {
			guestName: "Ana García",
			undoExpiresAt: "2000-01-01T00:00:00.000Z",
			view: "success",
		},
		view: "success",
	},
};
export const UndoError: Story = {
	args: {
		...common,
		debugState: {
			guestName: "Ana García",
			undoError: "Undo token has expired",
			view: "success",
		},
		view: "success",
	},
};
