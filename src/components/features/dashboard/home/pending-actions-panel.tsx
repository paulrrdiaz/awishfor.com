import type { HomeAction } from "@/lib/dashboard/home-actions";
import { NextStepCard } from "./next-step-card";
import { PreparationRibbon, RibbonNode } from "./preparation-ribbon";
import { SubsequentActionRow } from "./subsequent-action-row";

type Props = {
	nextStep: HomeAction;
	subsequentActions: HomeAction[];
};

export function PendingActionsPanel({ nextStep, subsequentActions }: Props) {
	return (
		<PreparationRibbon>
			<RibbonNode label="Tu siguiente paso" tone="done">
				<NextStepCard action={nextStep} />
			</RibbonNode>
			{subsequentActions.length > 0 && (
				<RibbonNode label="Después" tone="pending">
					<div className="flex flex-col gap-2">
						{subsequentActions.map((action) => (
							<SubsequentActionRow
								action={action}
								key={`${action.kind}-${action.wishlistId}`}
							/>
						))}
					</div>
				</RibbonNode>
			)}
		</PreparationRibbon>
	);
}
