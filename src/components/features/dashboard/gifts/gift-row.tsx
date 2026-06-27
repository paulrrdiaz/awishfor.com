import Image from "next/image";
import type { DashboardGiftRowViewModel } from "@/server/mappers/view-models";
import { GiftRowActions } from "./gift-row-actions";
import { GiftStatusBadges } from "./gift-status-badges";

type Props = {
	gift: DashboardGiftRowViewModel;
	wishlistId: string;
};

export function GiftRow({ gift, wishlistId }: Props) {
	const isHidden = gift.visibilityStatus === "hidden";

	return (
		<div
			className={[
				"flex items-start gap-4 rounded-2xl border p-4",
				isHidden
					? "border-gray-100 bg-gray-50 opacity-70"
					: "border-gray-200 bg-white",
			].join(" ")}
		>
			{gift.imageUrl && (
				<div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100">
					<Image
						alt={gift.name}
						className="object-cover"
						fill
						src={gift.imageUrl}
					/>
				</div>
			)}
			<div className="min-w-0 flex-1">
				<div className="flex items-start justify-between gap-2">
					<div className="min-w-0">
						<p className="truncate font-medium text-gray-900 text-sm">
							{gift.name}
						</p>
						<div className="mt-0.5 flex flex-wrap gap-2 text-gray-500 text-xs">
							{gift.storeName && <span>{gift.storeName}</span>}
							{gift.priceAmount && (
								<span>
									{gift.priceCurrency ?? ""} {gift.priceAmount}
								</span>
							)}
							<span>
								{gift.purchasedQuantity}/{gift.quantityNeeded} comprado
								{gift.purchasedQuantity !== 1 ? "s" : ""}
							</span>
						</div>
					</div>
					<GiftRowActions gift={gift} wishlistId={wishlistId} />
				</div>
				<div className="mt-2">
					<GiftStatusBadges
						priority={gift.priority}
						purchasedQuantity={gift.purchasedQuantity}
						quantityNeeded={gift.quantityNeeded}
						remainingQuantity={gift.remainingQuantity}
						visibilityStatus={gift.visibilityStatus}
					/>
				</div>
			</div>
		</div>
	);
}
