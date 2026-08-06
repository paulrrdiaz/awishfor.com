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
	{ id: "layout", label: "Disposición" },
	{ id: "theme", label: "Tema" },
	{ id: "images", label: "Imágenes" },
	{ id: "gifts", label: "Regalos" },
	{ id: "review", label: "Revisar" },
	{ id: "published", label: "Publicada" },
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
					onBack={() => undefined}
					onNext={() => undefined}
					saveDraftSlot={<Button variant="outline">Guardar borrador</Button>}
					variant="default"
				/>
			}
			desktopActions={
				<Button className="h-8 px-[18px] text-[13px]" variant="outline">
					Guardar borrador
				</Button>
			}
			stepper={
				<WizardStepper
					completedSteps={["event-type", "details"]}
					currentStep="layout"
					steps={steps}
				/>
			}
		>
			<div className="flex h-[calc(100dvh-184px)]">
				<div className="w-[420px] border-border border-r px-8 py-7">
					<Card>
						<CardHeader>
							<CardTitle>Diseña tu página</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="h-48 rounded-lg bg-muted" />
						</CardContent>
					</Card>
				</div>
				<div className="flex-1 bg-[#E6EBF0] p-7">
					<div className="h-full rounded-[18px] border border-border bg-card" />
				</div>
			</div>
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
