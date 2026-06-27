import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { EmptyState } from "./empty-state";

const meta = {
	component: EmptyState,
	title: "Shared/EmptyState",
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		title: "No hay regalos para mostrar.",
		description: "Cambia el filtro o vuelve a la lista completa.",
		action: (
			<button
				className="rounded-full border border-primary px-4 py-2 font-medium text-primary text-sm"
				type="button"
			>
				Ver todos
			</button>
		),
	},
};
