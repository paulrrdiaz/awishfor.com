import type { PublicWishlistProgress } from "@/server/mappers/view-models";

type Props = {
	progress: PublicWishlistProgress;
};

export function ProgressSummary({ progress }: Props) {
	const { availableGiftCount, purchasedUnits, totalUnits } = progress;
	return (
		<p
			className="text-center text-sm"
			style={{ color: "var(--public-text-muted, var(--public-text))" }}
		>
			{availableGiftCount} disponibles · {purchasedUnits} de {totalUnits}{" "}
			unidades compradas
		</p>
	);
}
