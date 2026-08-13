import { cn } from "@/lib/utils";
import type { PublicWishlistProgress } from "@/server/mappers/view-models";

type Props = {
	progress: PublicWishlistProgress;
	variant?: "block" | "inline";
	className?: string;
};

export function ProgressSummary({
	progress,
	variant = "block",
	className,
}: Props) {
	const { availableGiftCount, purchasedUnits, totalUnits } = progress;

	if (variant === "inline") {
		return (
			<p className={cn("text-muted-foreground text-sm", className)}>
				{availableGiftCount} disponibles · {purchasedUnits} comprados
			</p>
		);
	}

	return (
		<p className={cn("text-center text-muted-foreground text-sm", className)}>
			{availableGiftCount} disponibles · {purchasedUnits} de {totalUnits}{" "}
			unidades compradas
		</p>
	);
}
