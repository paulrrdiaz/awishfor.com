"use client";

import { useSearchParams } from "next/navigation";
import { EventTypeStep } from "./event-type-step";
import { RecoveryPrompt } from "./recovery-prompt";
import { useWizardStore } from "./wizard-provider";

type WizardStep = "event-type";

const STEPS: WizardStep[] = ["event-type"];
const DEFAULT_STEP: WizardStep = "event-type";

function isValidStep(s: string | null): s is WizardStep {
	return STEPS.includes(s as WizardStep);
}

function StepContent({ step }: { step: WizardStep }) {
	if (step === "event-type") return <EventTypeStep />;
	return null;
}

export function WizardShell() {
	const searchParams = useSearchParams();
	const raw = searchParams.get("step");
	const step: WizardStep = isValidStep(raw) ? raw : DEFAULT_STEP;
	const hasHydrated = useWizardStore((s) => s._hasHydrated);

	if (!hasHydrated) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<span className="text-gray-400 text-sm">Cargando…</span>
			</div>
		);
	}

	return (
		<main className="min-h-screen bg-gray-50">
			<RecoveryPrompt />
			<StepContent step={step} />
		</main>
	);
}
