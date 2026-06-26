import { Badge } from "@/components/ui/badge";

const PRIORITY_LABELS: Record<string, string> = {
	high: "Alta",
	medium: "Media",
	low: "Baja",
};

type Props = {
	priority: string;
	visibilityStatus: string;
	remainingQuantity: number;
	purchasedQuantity: number;
	quantityNeeded: number;
};

export function GiftStatusBadges({
	priority,
	visibilityStatus,
	remainingQuantity,
	purchasedQuantity,
	quantityNeeded,
}: Props) {
	const isHidden = visibilityStatus === "hidden";
	const isFullyPurchased = !isHidden && remainingQuantity === 0;
	const isPartial = !isHidden && purchasedQuantity > 0 && remainingQuantity > 0;

	return (
		<div className="flex flex-wrap items-center gap-1.5">
			{isHidden && <Badge variant="secondary">Oculto</Badge>}
			{isFullyPurchased && <Badge variant="default">Comprado</Badge>}
			{isPartial && (
				<Badge variant="outline">
					{purchasedQuantity}/{quantityNeeded} comprado
					{purchasedQuantity !== 1 ? "s" : ""}
				</Badge>
			)}
			<Badge variant="outline">{PRIORITY_LABELS[priority] ?? priority}</Badge>
		</div>
	);
}
