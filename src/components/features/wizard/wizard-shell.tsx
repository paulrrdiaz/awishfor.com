"use client";

import { useRouter, useSearchParams } from "next/navigation";
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
			<div className="flex min-h-screen items-center justify-center">
				<span className="text-gray-400 text-sm">Cargando…</span>
			</div>
		);
	}

	return (
		<main className="min-h-screen bg-gray-50">
			<RecoveryPrompt />

			{/* Step indicator */}
			<div className="border-gray-100 border-b bg-white">
				<div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
					{WIZARD_STEPS.map((s, i) => {
						const isActive = s === step;
						const isDone = i < currentIndex;
						return (
							<button
								className={[
									"flex items-center gap-2 text-sm transition-colors",
									isActive
										? "font-semibold text-gray-900"
										: isDone
											? "text-gray-500 hover:text-gray-700"
											: "cursor-default text-gray-300",
								].join(" ")}
								disabled={!isDone && !isActive}
								key={s}
								onClick={() => isDone && navigate(s)}
								type="button"
							>
								<span
									className={[
										"flex h-6 w-6 items-center justify-center rounded-full text-xs",
										isActive
											? "bg-gray-900 text-white"
											: isDone
												? "bg-gray-200 text-gray-600"
												: "bg-gray-100 text-gray-400",
									].join(" ")}
								>
									{isDone ? "✓" : i + 1}
								</span>
								<span className="hidden sm:inline">
									{WIZARD_STEP_LABELS[s]}
								</span>
							</button>
						);
					})}
				</div>
			</div>

			<StepContent step={step} />

			{/* Back / Next navigation */}
			<div className="sticky bottom-0 border-gray-100 border-t bg-white px-4 py-4">
				<div className="mx-auto flex max-w-2xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					<div className="flex items-center justify-between gap-3">
						<button
							className={[
								"rounded-lg border border-gray-200 px-5 py-2 text-sm transition-colors",
								isFirst
									? "cursor-default text-gray-300"
									: "text-gray-700 hover:bg-gray-50",
							].join(" ")}
							disabled={isFirst}
							onClick={goBack}
							type="button"
						>
							Atrás
						</button>
						{!publishSuccess && <SaveDraftControls />}
					</div>
					{!isLast && (
						<button
							className="rounded-lg bg-gray-900 px-5 py-2 text-sm text-white transition-colors hover:bg-gray-800"
							onClick={goNext}
							type="button"
						>
							Siguiente
						</button>
					)}
				</div>
			</div>
		</main>
	);
}
