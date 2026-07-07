"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { WizardLayout } from "@/components/shared/wizard-layout";
import { WizardNav } from "@/components/shared/wizard-nav";
import { WizardStepper } from "@/components/shared/wizard-stepper";
import { DesignStep } from "./design-step";
import { DetailsStep } from "./details-step";
import { EventTypeStep } from "./event-type-step";
import { GiftsStep } from "./gifts-step";
import { PublishStep } from "./publish-step";
import { RecoveryPrompt } from "./recovery-prompt";
import { SaveDraftControls } from "./save-draft-controls";
import { useWizardStore } from "./wizard-provider";
import {
	getNextWizardStep,
	getPreviousWizardStep,
	resolveWizardStep,
	WIZARD_STEP_LABELS,
	WIZARD_STEPS,
	type WizardStep,
} from "./wizard-steps";

function StepContent({ step }: { step: WizardStep }) {
	if (step === "event-type") return <EventTypeStep />;
	if (step === "details") return <DetailsStep />;
	if (step === "design") return <DesignStep />;
	if (step === "gifts") return <GiftsStep />;
	if (step === "publish") return <PublishStep />;
	return null;
}

export function WizardShell() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const raw = searchParams.get("step");
	const step = resolveWizardStep(raw);
	const hasHydrated = useWizardStore((s) => s._hasHydrated);
	const publishSuccess = useWizardStore((s) => s.publishSuccess);

	const currentIndex = WIZARD_STEPS.indexOf(step);
	const isFirst = currentIndex === 0;
	const isLast = currentIndex === WIZARD_STEPS.length - 1;
	const completedSteps = WIZARD_STEPS.slice(0, currentIndex);
	const stepperSteps = WIZARD_STEPS.map((wizardStep) => ({
		id: wizardStep,
		label: WIZARD_STEP_LABELS[wizardStep],
	}));

	function navigate(targetStep: WizardStep) {
		const params = new URLSearchParams(searchParams.toString());
		params.set("step", targetStep);
		router.push(`?${params.toString()}`);
	}

	function goBack() {
		if (isFirst) return;
		const previousStep = getPreviousWizardStep(step);
		if (previousStep) {
			navigate(previousStep);
		}
	}

	function goNext() {
		if (isLast) return;
		const nextStep = getNextWizardStep(step);
		if (nextStep) {
			navigate(nextStep);
		}
	}

	if (!hasHydrated) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-background text-foreground">
				<span className="text-muted-foreground text-sm">Cargando…</span>
			</div>
		);
	}

	return (
		<WizardLayout
			actions={
				<WizardNav
					isFirst={isFirst}
					isLast={isLast}
					onBack={goBack}
					onNext={goNext}
					saveDraftSlot={!publishSuccess && <SaveDraftControls />}
				/>
			}
			desktopActions={!publishSuccess && <SaveDraftControls />}
			stepper={
				<WizardStepper
					completedSteps={completedSteps}
					currentStep={step}
					onSelectStep={navigate}
					steps={stepperSteps}
				/>
			}
		>
			<RecoveryPrompt />
			<StepContent step={step} />
		</WizardLayout>
	);
}
