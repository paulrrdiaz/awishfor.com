import type { PublicWishlistProgress } from "@/server/mappers/view-models";

type Props = {
	progress: PublicWishlistProgress;
};

export function ProgressSummary({ progress }: Props) {
	const { availableGiftCount, purchasedUnits, totalUnits } = progress;
	return (
		<p className="text-center text-muted-foreground text-sm">
			{availableGiftCount} disponibles · {purchasedUnits} de {totalUnits}{" "}
			unidades compradas
		</p>
	);
}
