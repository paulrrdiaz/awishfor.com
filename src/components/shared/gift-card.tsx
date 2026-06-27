"use client";

import { cva } from "class-variance-authority";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { PublicGiftViewModel } from "@/server/mappers/view-models";
import { PriorityBadge } from "./priority-badge";
import { StatusBadge } from "./status-badge";

export type GiftCardStyle = "card" | "row" | "minimal";
export type GiftCardStatus = PublicGiftViewModel["status"] | "hidden";

type Props = {
	gift: PublicGiftViewModel;
	cardStyle?: GiftCardStyle;
	actionsEnabled?: boolean;
	status?: GiftCardStatus;
	onGiftAction?: (gift: PublicGiftViewModel) => void;
};

const giftCardVariants = cva(
	"border border-border bg-card text-card-foreground shadow-sm transition-opacity",
	{
		variants: {
			cardStyle: {
				card: "flex flex-col overflow-hidden rounded-xl",
				row: "flex items-center gap-4 rounded-lg p-4",
				minimal: "flex items-center gap-4 rounded-lg p-4 shadow-none",
			},
			status: {
				available: "",
				partial: "ring-1 ring-primary/20",
				purchased: "opacity-60",
				hidden: "opacity-45 grayscale",
			},
		},
		defaultVariants: {
			cardStyle: "card",
			status: "available",
		},
	},
);

const giftNameVariants = cva("font-medium leading-snug", {
	variants: {
		status: {
			available: "",
			partial: "",
			purchased: "line-through decoration-foreground/60",
			hidden: "line-through decoration-foreground/50",
		},
	},
	defaultVariants: {
		status: "available",
	},
});

function formatPrice(amount: string, currency: string): string {
	const value = Number.parseFloat(amount);
	if (Number.isNaN(value)) return amount;
	try {
		return new Intl.NumberFormat("es-PE", {
			style: "currency",
			currency,
		}).format(value);
	} catch {
		return `${currency} ${value}`;
	}
}

function GiftMeta({
	gift,
	isDisabled,
}: {
	gift: PublicGiftViewModel;
	isDisabled: boolean;
}) {
	return (
		<div className="mt-2 flex flex-wrap gap-3 text-muted-foreground text-sm">
			{gift.priceAmount && gift.priceCurrency && (
				<span className="font-medium">
					{formatPrice(gift.priceAmount, gift.priceCurrency)}
				</span>
			)}
			{gift.storeName && <span>{gift.storeName}</span>}
			{gift.productUrl && (
				<a
					aria-disabled={isDisabled}
					className="underline underline-offset-2"
					href={isDisabled ? undefined : gift.productUrl}
					rel="noopener noreferrer"
					style={{ pointerEvents: isDisabled ? "none" : undefined }}
					target="_blank"
				>
					Ver producto
				</a>
			)}
		</div>
	);
}

export function GiftCard({
	gift,
	cardStyle = "card",
	actionsEnabled = false,
	status = gift.status,
	onGiftAction,
}: Props) {
	const isPurchased = status === "purchased";
	const isPartial = status === "partial";
	const isHidden = status === "hidden";
	const showAction = actionsEnabled && !isPurchased && !isHidden;

	if (cardStyle === "row" || cardStyle === "minimal") {
		return (
			<article className={cn(giftCardVariants({ cardStyle, status }))}>
				{gift.imageUrl && (
					<div className="relative size-16 shrink-0 overflow-hidden rounded-md bg-muted">
						<Image
							alt={gift.name}
							className="object-cover"
							fill
							src={gift.imageUrl}
						/>
					</div>
				)}
				<div className="min-w-0 flex-1">
					<div className="flex flex-wrap items-center gap-2">
						<h3 className={cn(giftNameVariants({ status }))}>{gift.name}</h3>
						{gift.priority === "high" && <PriorityBadge priority="high" />}
						<StatusBadge status={status} />
					</div>
					<GiftMeta gift={gift} isDisabled={isPurchased || isHidden} />
					{gift.publicNote && (
						<p className="mt-1 text-muted-foreground text-sm">
							{gift.publicNote}
						</p>
					)}
					{isPartial && gift.quantityNeeded > 1 && (
						<p className="mt-1 text-primary text-xs">
							Aún quedan {gift.remainingQuantity} disponibles
						</p>
					)}
				</div>
				{showAction && (
					<button
						className="shrink-0 rounded-[var(--public-btn-radius,0.75rem)] bg-primary px-4 py-2 font-medium text-primary-foreground text-sm transition-colors hover:bg-primary/90"
						onClick={() => onGiftAction?.(gift)}
						style={{ fontWeight: "var(--public-btn-weight, 500)" }}
						type="button"
					>
						Regalar
					</button>
				)}
			</article>
		);
	}

	return (
		<article className={cn(giftCardVariants({ cardStyle, status }))}>
			{gift.imageUrl && (
				<div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
					<Image
						alt={gift.name}
						className="object-cover"
						fill
						src={gift.imageUrl}
					/>
				</div>
			)}
			<div className="flex flex-1 flex-col p-4">
				<div className="flex flex-wrap items-start gap-2">
					<h3
						className={cn(
							giftNameVariants({ status }),
							"flex-1 font-heading text-xl",
						)}
					>
						{gift.name}
					</h3>
					{gift.priority === "high" && <PriorityBadge priority="high" />}
				</div>
				<GiftMeta gift={gift} isDisabled={isPurchased || isHidden} />
				{gift.publicNote && (
					<p className="mt-2 text-muted-foreground text-sm leading-relaxed">
						{gift.publicNote}
					</p>
				)}
				<div className="mt-auto flex items-center justify-between gap-3 pt-4">
					<StatusBadge status={status} />
					{isPartial && gift.quantityNeeded > 1 && (
						<span className="text-primary text-xs">Parcialmente regalado</span>
					)}
					{showAction && (
						<button
							className="ml-auto rounded-[var(--public-btn-radius,0.75rem)] bg-primary px-4 py-2 font-medium text-primary-foreground text-sm transition-colors hover:bg-primary/90"
							onClick={() => onGiftAction?.(gift)}
							style={{ fontWeight: "var(--public-btn-weight, 500)" }}
							type="button"
						>
							Regalar
						</button>
					)}
				</div>
			</div>
		</article>
	);
}
