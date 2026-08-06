import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type WizardNavProps = {
	isFirst: boolean;
	/**
	 * "default" shows a Next button; "review" swaps it for the publish CTA
	 * portal target, since the publish action lives in the review step body.
	 */
	variant: "default" | "review";
	onBack: () => void;
	onNext: () => void;
	saveDraftSlot?: ReactNode;
	className?: string;
};

export function WizardNav({
	isFirst,
	variant,
	onBack,
	onNext,
	saveDraftSlot,
	className,
}: WizardNavProps) {
	const isReview = variant === "review";

	return (
		<>
			<div
				className={cn(
					"flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:hidden",
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

				{!isReview && (
					<Button className="min-h-11 px-5" onClick={onNext} type="button">
						Siguiente
					</Button>
				)}
				{isReview && <div id="publish-cta-slot-mobile" />}
			</div>

			<div
				className={cn(
					"hidden items-center border-border bg-card px-9 py-4 lg:flex",
					isFirst ? "justify-end" : "justify-between",
					className,
				)}
			>
				{!isFirst && (
					<Button
						className="min-h-11 px-6"
						onClick={onBack}
						type="button"
						variant="outline"
					>
						← Atrás
					</Button>
				)}

				{!isReview && (
					<Button
						className="min-h-11 px-8 py-[13px]"
						onClick={onNext}
						type="button"
					>
						Continuar →
					</Button>
				)}
				{isReview && <div id="publish-cta-slot-desktop" />}
			</div>
		</>
	);
}
