"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { WizardLayout } from "@/components/shared/wizard-layout";
import { WizardNav } from "@/components/shared/wizard-nav";
import { WizardStepper } from "@/components/shared/wizard-stepper";
import { DetailsStep } from "./details-step";
import { EventTypeStep } from "./event-type-step";
import { GiftsStep } from "./gifts-step";
import { ImagesStep } from "./images-step";
import { LayoutStep } from "./layout-step";
import { PublishedStep } from "./published-step";
import { RecoveryPrompt } from "./recovery-prompt";
import { ReviewStep } from "./review-step";
import { SaveDraftControls } from "./save-draft-controls";
import { ThemeStep } from "./theme-step";
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
	if (step === "layout") return <LayoutStep />;
	if (step === "theme") return <ThemeStep />;
	if (step === "images") return <ImagesStep />;
	if (step === "gifts") return <GiftsStep />;
	if (step === "review") return <ReviewStep />;
	if (step === "published") return <PublishedStep />;
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
	const isPublished = step === "published";
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
		const nextStep = getNextWizardStep(step);
		if (nextStep) {
			navigate(nextStep);
		}
	}

	useEffect(() => {
		if (!hasHydrated || !isPublished || publishSuccess) return;
		const params = new URLSearchParams(searchParams.toString());
		params.set("step", "review");
		router.push(`?${params.toString()}`);
	}, [hasHydrated, isPublished, publishSuccess, router, searchParams]);

	if (!hasHydrated) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-background text-foreground">
				<span className="text-muted-foreground text-sm">Cargando…</span>
			</div>
		);
	}

	if (isPublished && !publishSuccess) {
		return null;
	}

	return (
		<WizardLayout
			actions={
				!isPublished && (
					<WizardNav
						isFirst={isFirst}
						onBack={goBack}
						onNext={goNext}
						saveDraftSlot={!publishSuccess && <SaveDraftControls />}
						variant={step === "review" ? "review" : "default"}
					/>
				)
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
