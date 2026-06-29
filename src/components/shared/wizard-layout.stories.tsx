import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WizardLayout } from "./wizard-layout";
import { WizardNav } from "./wizard-nav";
import { WizardStepper } from "./wizard-stepper";

const meta = {
	component: WizardLayout,
	parameters: {
		layout: "fullscreen",
	},
	title: "Shared/WizardLayout",
} satisfies Meta<typeof WizardLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

const steps = [
	{ id: "event-type", label: "Ocasión" },
	{ id: "details", label: "Detalles" },
	{ id: "design", label: "Diseño" },
	{ id: "gifts", label: "Regalos" },
	{ id: "publish", label: "Publicar" },
];

export const Desktop: Story = {
	args: {
		actions: null,
		children: null,
		stepper: null,
	},
	render: () => (
		<WizardLayout
			actions={
				<WizardNav
					isFirst={false}
					isLast={false}
					onBack={() => undefined}
					onNext={() => undefined}
					saveDraftSlot={<Button variant="outline">Guardar borrador</Button>}
				/>
			}
			contentClassName="max-w-3xl"
			stepper={
				<WizardStepper
					completedSteps={["event-type", "details"]}
					currentStep="design"
					steps={steps}
				/>
			}
		>
			<Card>
				<CardHeader>
					<CardTitle>Diseño y vista previa</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="h-64 rounded-lg bg-muted" />
				</CardContent>
			</Card>
		</WizardLayout>
	),
};

export const Mobile: Story = {
	args: Desktop.args,
	parameters: {
		viewport: {
			defaultViewport: "mobile1",
		},
	},
	render: Desktop.render,
};
