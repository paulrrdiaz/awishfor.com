import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

const meta = {
	component: Card,
	title: "UI/Card",
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => (
		<Card className="max-w-sm">
			<CardHeader>
				<CardTitle>Wishlist lista</CardTitle>
				<CardDescription>
					Revisa los detalles antes de compartirla con tus invitados.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<p className="text-sm">
					La tarjeta usa los tokens del tema para superficie, borde y texto.
				</p>
			</CardContent>
			<CardFooter>
				<Button>Continuar</Button>
				<Button variant="outline">Cancelar</Button>
			</CardFooter>
		</Card>
	),
};
