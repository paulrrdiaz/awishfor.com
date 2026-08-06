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
	const currentLabel = steps[currentIndex]?.label ?? "";

	return (
		<nav aria-label="Progreso de creación" className={cn("w-full", className)}>
			<div className="flex gap-2 border-border border-b bg-card px-4 py-3.5 sm:px-6">
				{steps.map((step) => {
					const isActive = step.id === currentStep;
					const isDone = completedSteps.includes(step.id);
					const canSelect = isDone && !isActive && !!onSelectStep;
					const state = isActive ? "active" : isDone ? "done" : "upcoming";

					const segmentClassName = cn(
						"h-1 flex-1 rounded-full transition-colors",
						state === "done" && "bg-foreground",
						state === "active" && "bg-primary",
						state === "upcoming" && "bg-border",
					);

					if (canSelect) {
						return (
							<button
								aria-label={`Ir a ${step.label}`}
								className={cn(
									segmentClassName,
									"focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
								)}
								key={step.id}
								onClick={() => onSelectStep(step.id)}
								type="button"
							/>
						);
					}

					return (
						<div
							aria-current={isActive ? "step" : undefined}
							aria-label={step.label}
							className={segmentClassName}
							key={step.id}
							role="presentation"
						/>
					);
				})}
			</div>
			<p className="border-border border-b bg-card px-4 py-2 font-mono text-[11px] text-muted-foreground uppercase tracking-widest sm:px-6">
				{`Paso ${currentIndex + 1} de ${steps.length} · `}
				<span className="font-semibold text-foreground">{currentLabel}</span>
			</p>
		</nav>
	);
}
