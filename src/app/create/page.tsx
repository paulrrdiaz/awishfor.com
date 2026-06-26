import { Suspense } from "react";
import { WizardProvider } from "@/components/features/wizard/wizard-provider";
import { WizardShell } from "@/components/features/wizard/wizard-shell";

export default function CreatePage() {
	return (
		<WizardProvider>
			<Suspense>
				<WizardShell />
			</Suspense>
		</WizardProvider>
	);
}
