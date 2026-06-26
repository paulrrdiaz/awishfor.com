export const WIZARD_STEPS = [
	"event-type",
	"details",
	"design",
	"gifts",
	"publish",
] as const;

export type WizardStep = (typeof WIZARD_STEPS)[number];

export const DEFAULT_WIZARD_STEP: WizardStep = "event-type";

export const WIZARD_STEP_LABELS: Record<WizardStep, string> = {
	"event-type": "Ocasión",
	details: "Detalles",
	design: "Diseño",
	gifts: "Regalos",
	publish: "Publicar",
};

export function isWizardStep(step: string | null): step is WizardStep {
	return WIZARD_STEPS.includes(step as WizardStep);
}

export function resolveWizardStep(step: string | null): WizardStep {
	return isWizardStep(step) ? step : DEFAULT_WIZARD_STEP;
}

export function getPreviousWizardStep(step: WizardStep): WizardStep | null {
	const index = WIZARD_STEPS.indexOf(step);
	return index > 0 ? (WIZARD_STEPS[index - 1] ?? null) : null;
}

export function getNextWizardStep(step: WizardStep): WizardStep | null {
	const index = WIZARD_STEPS.indexOf(step);
	return index >= 0 && index < WIZARD_STEPS.length - 1
		? (WIZARD_STEPS[index + 1] ?? null)
		: null;
}
