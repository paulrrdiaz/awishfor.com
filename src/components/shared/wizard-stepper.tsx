import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

type WizardStepperStep<TStep extends string> = {
	id: TStep;
	label: string;
};

type WizardStepperProps<TStep extends string> = {
	steps: WizardStepperStep<TStep>[];
	currentStep: TStep;
	completedSteps: TStep[];
	onSelectStep?: (step: TStep) => void;
	className?: string;
};

export function WizardStepper<TStep extends string>({
	steps,
	currentStep,
	completedSteps,
	onSelectStep,
	className,
}: WizardStepperProps<TStep>) {
	const currentIndex = Math.max(
		0,
		steps.findIndex((step) => step.id === currentStep),
	);

	return (
		<nav aria-label="Progreso de creación" className={cn("w-full", className)}>
			<div className="flex gap-2 border-border border-b bg-card px-4 py-3.5 lg:hidden">
				{steps.map((step, index) => {
					const isFilled =
						index <= currentIndex || completedSteps.includes(step.id);
					const canSelect =
						completedSteps.includes(step.id) &&
						step.id !== currentStep &&
						!!onSelectStep;

					if (canSelect) {
						return (
							<button
								aria-label={`Ir a ${step.label}`}
								className={cn(
									"h-1 flex-1 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
									isFilled ? "bg-primary" : "bg-border",
								)}
								key={step.id}
								onClick={() => onSelectStep(step.id)}
								type="button"
							/>
						);
					}

					return (
						<div
							aria-current={step.id === currentStep ? "step" : undefined}
							aria-label={step.label}
							className={cn(
								"h-1 flex-1 rounded-full",
								isFilled ? "bg-primary" : "bg-border",
							)}
							key={step.id}
							role="presentation"
						/>
					);
				})}
			</div>

			<ol className="hidden items-center justify-center border-border border-b bg-card px-10 py-[18px] lg:flex">
				{steps.map((step, index) => {
					const isActive = step.id === currentStep;
					const isDone = completedSteps.includes(step.id);
					const canSelect = isDone && !isActive && !!onSelectStep;
					const state = isActive ? "active" : isDone ? "done" : "upcoming";
					const content = (
						<>
							<span
								className={cn(
									"flex size-[26px] shrink-0 items-center justify-center rounded-full border-2 text-xs transition-colors",
									state === "active" &&
										"border-primary bg-primary text-primary-foreground",
									state === "done" &&
										"border-[#2E7D4F] bg-[#EAF6EE] text-[#2E7D4F]",
									state === "upcoming" &&
										"border-border bg-card text-muted-foreground",
								)}
							>
								{isDone ? <Check className="size-3.5 stroke-[3]" /> : index + 1}
							</span>
							<span
								className={cn(
									"truncate text-xs",
									state === "active" && "font-bold text-foreground",
									state === "done" && "font-semibold text-[#2E7D4F]",
									state === "upcoming" && "text-muted-foreground",
								)}
							>
								{step.label}
							</span>
						</>
					);

					return (
						<li className="flex items-center" key={step.id}>
							{canSelect ? (
								<button
									className="flex min-h-[26px] items-center gap-2 rounded-md text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
									onClick={() => onSelectStep(step.id)}
									type="button"
								>
									{content}
								</button>
							) : (
								<div
									aria-current={isActive ? "step" : undefined}
									className="flex min-h-[26px] items-center gap-2 rounded-md"
								>
									{content}
								</div>
							)}
							{index < steps.length - 1 && (
								<span
									aria-hidden
									className={cn(
										"mx-3 h-0.5 w-14 rounded-full",
										isDone ? "bg-[#C3E63E]" : "bg-border",
									)}
								/>
							)}
						</li>
					);
				})}
			</ol>
		</nav>
	);
}
