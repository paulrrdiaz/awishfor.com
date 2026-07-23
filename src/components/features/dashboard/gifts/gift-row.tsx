import { Gift as GiftIcon, Star } from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { DashboardGiftRowViewModel } from "@/server/mappers/view-models";
import { GiftRowActions } from "./gift-row-actions";

type Props = {
	gift: DashboardGiftRowViewModel;
	wishlistId: string;
	categoryName?: string | null;
	onEdit: () => void;
};

export function GiftRow({ gift, wishlistId, categoryName, onEdit }: Props) {
	const isHidden = gift.visibilityStatus === "hidden";
	const isFullyPurchased = !isHidden && gift.remainingQuantity === 0;
	const isPartial =
		!isHidden && gift.purchasedQuantity > 0 && gift.remainingQuantity > 0;
	const isHighPriority = gift.priority === "high";

	const metaLabel = [gift.storeName ?? "Sin enlace", categoryName, gift.size]
		.filter(Boolean)
		.join(" · ");

	return (
		<div
			className={cn(
				"flex items-center gap-3.5 rounded-2xl border border-border bg-card p-3.5",
				isHidden || isFullyPurchased ? "opacity-60" : undefined,
			)}
		>
			<div className="relative size-13 shrink-0 overflow-hidden rounded-xl bg-muted">
				{gift.imageUrl ? (
					<Image
						alt={gift.name}
						className="object-cover"
						fill
						src={gift.imageUrl}
						unoptimized
					/>
				) : (
					<div className="flex h-full items-center justify-center text-muted-foreground">
						<GiftIcon className="size-5" />
					</div>
				)}
			</div>

			<div className="min-w-0 flex-1">
				<div className="flex min-w-0 items-center gap-1.5">
					{isHighPriority && (
						<Star className="size-3.5 shrink-0 fill-current text-primary" />
					)}
					<span
						className={cn(
							"truncate font-semibold text-sm",
							isFullyPurchased && "text-muted-foreground line-through",
						)}
					>
						{gift.name}
					</span>
				</div>
				<div className="mt-0.5 text-muted-foreground text-xs">{metaLabel}</div>
				<div className="mt-2 flex flex-wrap items-center gap-3">
					<span
						className={cn(
							"font-semibold text-sm",
							isFullyPurchased && "text-muted-foreground",
						)}
					>
						{gift.priceAmount
							? `${gift.priceCurrency ?? ""} ${gift.priceAmount}`.trim()
							: "Sin precio"}
					</span>
					{gift.quantityNeeded > 1 && (
						<div className="flex items-center gap-2">
							<span className="text-muted-foreground text-xs">
								{gift.purchasedQuantity} / {gift.quantityNeeded} comprados
							</span>
							<Progress
								className="h-1.5 w-18"
								max={gift.quantityNeeded}
								value={gift.purchasedQuantity}
							/>
						</div>
					)}
				</div>
			</div>

			<div className="flex shrink-0 flex-col items-end gap-2.5">
				{isHidden && <Badge variant="secondary">Oculto</Badge>}
				{isFullyPurchased && <Badge>✓ Comprado</Badge>}
				{isPartial && (
					<Badge variant="outline">
						{gift.purchasedQuantity} de {gift.quantityNeeded}
					</Badge>
				)}
				<GiftRowActions gift={gift} onEdit={onEdit} wishlistId={wishlistId} />
			</div>
		</div>
	);
}
