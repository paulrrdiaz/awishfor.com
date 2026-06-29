import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type WizardNavProps = {
	isFirst: boolean;
	isLast: boolean;
	onBack: () => void;
	onNext: () => void;
	saveDraftSlot?: ReactNode;
	className?: string;
};

export function WizardNav({
	isFirst,
	isLast,
	onBack,
	onNext,
	saveDraftSlot,
	className,
}: WizardNavProps) {
	return (
		<div
			className={cn(
				"flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
				className,
			)}
		>
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
				<Button
					className="min-h-11 px-5"
					disabled={isFirst}
					onClick={onBack}
					type="button"
					variant="outline"
				>
					Atrás
				</Button>
				{saveDraftSlot}
			</div>

			{!isLast && (
				<Button className="min-h-11 px-5" onClick={onNext} type="button">
					Siguiente
				</Button>
			)}
		</div>
	);
}
