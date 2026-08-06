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
	onGiftAction?: (gift: PublicGiftViewModel) => void;
};

export function GiftGrid({
	gifts,
	giftColumns = 3,
	giftCardStyle = "card",
	actionsEnabled = false,
	categoryNames,
	columnsAtSmallBreakpoint = false,
	onGiftAction,
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

	return (
		<div className={cn("grid", gapClass, colClass)}>
			{gifts.map((gift) => (
				<GiftCard
					actionsEnabled={actionsEnabled}
					cardStyle={giftCardStyle}
					categoryName={
						gift.categoryId ? categoryNames?.[gift.categoryId] : undefined
					}
					gift={gift}
					key={gift.id}
					onGiftAction={onGiftAction}
				/>
			))}
		</div>
	);
}
