import type { MotifPreset, MotifTreatment } from "@/config/motifs";
import { cn } from "@/lib/utils";
import type { PublicGiftViewModel } from "@/server/mappers/view-models";
import { GiftCard, type GiftCardStyle } from "./gift-card";

// Static lookup — Tailwind JIT requires full class literals (no interpolation)
const COLUMN_CLASSES: Record<number, string> = {
	1: "grid-cols-1",
	2: "grid-cols-1 sm:grid-cols-2",
	3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
	4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
};

const SMALL_BREAKPOINT_COLUMN_CLASSES: Record<number, string> = {
	1: "grid-cols-1",
	2: "grid-cols-1 sm:grid-cols-2",
	3: "grid-cols-1 sm:grid-cols-3",
};

type Props = {
	gifts: PublicGiftViewModel[];
	giftColumns?: number;
	giftCardStyle?: GiftCardStyle;
	actionsEnabled?: boolean;
	categoryNames?: Record<string, string>;
	columnsAtSmallBreakpoint?: boolean;
	onProductAction?: (gift: PublicGiftViewModel) => void;
	onPurchaseAction?: (gift: PublicGiftViewModel) => void;
	motif?: MotifPreset | null;
	motifTreatment?: MotifTreatment;
};

export function GiftGrid({
	gifts,
	giftColumns = 3,
	giftCardStyle = "card",
	actionsEnabled = false,
	categoryNames,
	columnsAtSmallBreakpoint = false,
	onProductAction,
	onPurchaseAction,
	motif,
	motifTreatment,
}: Props) {
	if (gifts.length === 0) return null;

	const columnClasses = columnsAtSmallBreakpoint
		? SMALL_BREAKPOINT_COLUMN_CLASSES
		: COLUMN_CLASSES;
	const colClass = columnClasses[giftColumns] ?? columnClasses[3];
	const gapClass =
		giftCardStyle === "collage-row"
			? "gap-2.5"
			: giftCardStyle === "collage"
				? "gap-[14px]"
				: "gap-6";
	// Positional rotation for the tilted style — applied by the grid from
	// each card's column position rather than an index prop into GiftCard.
	// Scoped to sm: so the single-column mobile stack isn't rotated, and
	// skipped entirely at 1 column: a full-width row reads as misaligned
	// when tilted, not playful.
	const tiltClass =
		giftCardStyle === "tilted" && giftColumns !== 1
			? "sm:[&>*:nth-child(3n+1)]:rotate-[-1.6deg] sm:[&>*:nth-child(3n+2)]:mt-4 sm:[&>*:nth-child(3n+2)]:rotate-[1.4deg] sm:[&>*:nth-child(3n+3)]:rotate-[-0.8deg]"
			: undefined;

	return (
		<div className={cn("grid", gapClass, colClass, tiltClass)}>
			{gifts.map((gift) => (
				<GiftCard
					actionsEnabled={actionsEnabled}
					cardStyle={giftCardStyle}
					categoryName={
						gift.categoryId ? categoryNames?.[gift.categoryId] : undefined
					}
					gift={gift}
					// cardStyle is keyed in too: useHoverLift writes GSAP's transform
					// cache as an inline style, which bakes in whatever rotation the
					// "tilted" style's CSS class had at the time of the last hover.
					// Reusing the DOM node across a cardStyle switch (e.g. tilted ->
					// collage-row when the column toggle goes to 1) would leave that
					// stale inline transform in place since nothing else clears it —
					// keying on cardStyle forces a fresh node instead.
					key={`${gift.id}-${giftCardStyle}`}
					motif={motif}
					motifTreatment={motifTreatment}
					onProductAction={onProductAction}
					onPurchaseAction={onPurchaseAction}
				/>
			))}
		</div>
	);
}
