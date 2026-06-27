import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type Step = {
	id: string;
	label: string;
	complete: boolean;
};

type Props = {
	steps: Step[];
	className?: string;
};

export function StepProgress({ steps, className }: Props) {
	return (
		<ol className={cn("grid gap-3 sm:grid-cols-3", className)}>
			{steps.map((step) => (
				<li className="flex items-center gap-3" key={step.id}>
					<span
						className={cn(
							"flex size-8 items-center justify-center rounded-full border text-xs",
							step.complete
								? "border-primary bg-primary text-primary-foreground"
								: "border-border bg-card text-muted-foreground",
						)}
					>
						{step.complete ? <Check className="size-4" /> : step.id}
					</span>
					<span className="font-medium text-sm">{step.label}</span>
				</li>
			))}
		</ol>
	);
}
