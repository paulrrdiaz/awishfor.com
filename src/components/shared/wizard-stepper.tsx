import { Check } from "lucide-react";

import { Progress } from "@/components/ui/progress";
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
	const current = steps[currentIndex];
	const progressValue =
		steps.length > 1 ? (currentIndex / (steps.length - 1)) * 100 : 100;

	return (
		<nav aria-label="Progreso de creación" className={cn("w-full", className)}>
			<div className="space-y-2 lg:hidden">
				<div className="flex items-center justify-between gap-4">
					<p className="font-medium text-sm">
						Paso {currentIndex + 1} de {steps.length}
					</p>
					<p className="truncate text-muted-foreground text-sm">
						{current?.label}
					</p>
				</div>
				<Progress aria-label="Progreso de creación" value={progressValue} />
			</div>

			<ol className="hidden items-center justify-between gap-3 lg:flex">
				{steps.map((step, index) => {
					const isActive = step.id === currentStep;
					const isDone = completedSteps.includes(step.id);
					const canSelect = isDone && !isActive && !!onSelectStep;
					const state = isActive ? "active" : isDone ? "done" : "upcoming";
					const content = (
						<>
							<span
								className={cn(
									"flex size-8 shrink-0 items-center justify-center rounded-full border text-xs transition-colors",
									state === "active" &&
										"border-primary bg-primary text-primary-foreground",
									state === "done" &&
										"border-primary/40 bg-primary/15 text-primary",
									state === "upcoming" &&
										"border-border bg-muted text-muted-foreground",
								)}
							>
								{isDone ? <Check className="size-3.5" /> : index + 1}
							</span>
							<span
								className={cn(
									"truncate text-sm",
									state === "active" && "font-semibold text-foreground",
									state === "done" && "text-foreground",
									state === "upcoming" && "text-muted-foreground",
								)}
							>
								{step.label}
							</span>
						</>
					);

					return (
						<li className="min-w-0 flex-1" key={step.id}>
							{canSelect ? (
								<button
									className="flex min-h-11 w-full items-center gap-2 rounded-lg px-2 text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
									onClick={() => onSelectStep(step.id)}
									type="button"
								>
									{content}
								</button>
							) : (
								<div
									aria-current={isActive ? "step" : undefined}
									className="flex min-h-11 w-full items-center gap-2 rounded-lg px-2"
								>
									{content}
								</div>
							)}
						</li>
					);
				})}
			</ol>
		</nav>
	);
}
