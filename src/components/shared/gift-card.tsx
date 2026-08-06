"use client";

import { cva } from "class-variance-authority";
import Image from "next/image";
import { useRef } from "react";
import { useHoverLift } from "@/lib/gsap/use-hover-lift";
import { cn } from "@/lib/utils";
import type { PublicGiftViewModel } from "@/server/mappers/view-models";
import { PriorityBadge } from "./priority-badge";
import { StatusBadge } from "./status-badge";

export type GiftCardStyle =
	| "card"
	| "row"
	| "minimal"
	| "collage"
	| "collage-row";
export type GiftCardStatus = PublicGiftViewModel["status"] | "hidden";

type Props = {
	gift: PublicGiftViewModel;
	cardStyle?: GiftCardStyle;
	categoryName?: string;
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
				collage: "flex flex-col overflow-hidden rounded-[16px] shadow-none",
				"collage-row":
					"relative flex min-h-[90px] items-center gap-3 overflow-hidden rounded-[10px] border-l-[8px] border-l-primary p-3 shadow-none",
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

const giftNameVariants = cva("line-clamp-1 font-medium leading-snug", {
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
	categoryName,
	actionsEnabled = false,
	status = gift.status,
	onGiftAction,
}: Props) {
	const cardRef = useRef<HTMLElement>(null);
	const isPurchased = status === "purchased";
	const isPartial = status === "partial";
	const isHidden = status === "hidden";
	const showAction = actionsEnabled && !isPurchased && !isHidden;
	const isCollage = cardStyle === "collage";
	const isCollageRow = cardStyle === "collage-row";

	useHoverLift(cardRef, {
		scale: cardStyle === "card" ? 1.01 : 1.005,
		y: cardStyle === "card" ? -8 : -4,
	});

	if (isCollageRow) {
		const purchasedQuantity = Math.max(
			0,
			gift.quantityNeeded - gift.remainingQuantity,
		);
		const source = [gift.storeName, categoryName].filter(Boolean).join(" · ");

		return (
			<article
				className={cn(
					giftCardVariants({ cardStyle, status }),
					(isPurchased || isHidden) && "border-l-muted-foreground/60",
				)}
				ref={cardRef}
			>
				<div className="relative size-16 shrink-0 overflow-hidden rounded-md bg-muted">
					{gift.imageUrl && (
						<Image
							alt={gift.name}
							className="object-cover"
							fill
							sizes="64px"
							src={gift.imageUrl}
						/>
					)}
				</div>
				<div className="min-w-0 flex-1 self-center">
					{source && (
						<p className="truncate text-[10px] text-muted-foreground leading-4">
							{source}
						</p>
					)}
					<h3
						className={cn(
							giftNameVariants({ status }),
							"font-heading text-[14px] leading-[18px]",
						)}
					>
						{gift.name}
					</h3>
				</div>
				<div className="flex shrink-0 flex-col items-end gap-2 self-center">
					{gift.priceAmount && gift.priceCurrency && (
						<span className="font-heading font-semibold text-[15px] leading-[18px]">
							{formatPrice(gift.priceAmount, gift.priceCurrency)}
						</span>
					)}
					{isPurchased || isHidden ? (
						<span className="flex h-5 min-w-7 items-center justify-center rounded-full bg-muted px-2 text-[10px] text-muted-foreground">
							✓
						</span>
					) : isPartial ? (
						<span className="rounded-full bg-[#fbf1dc] px-2 py-0.5 font-medium text-[#9a6f1e] text-[10px]">
							{purchasedQuantity} de {gift.quantityNeeded}
						</span>
					) : gift.priority === "high" ? (
						<span className="flex h-5 min-w-7 items-center justify-center rounded-full bg-accent px-2 text-[10px] text-accent-foreground">
							★
						</span>
					) : (
						<StatusBadge className="text-[10px]" status={status} />
					)}
				</div>
				{showAction && (
					<button
						aria-label={`Marcar comprado: ${gift.name}`}
						className="absolute inset-0 z-10 cursor-pointer rounded-[10px] outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
						onClick={() => onGiftAction?.(gift)}
						type="button"
					/>
				)}
			</article>
		);
	}

	if (cardStyle === "row" || cardStyle === "minimal") {
		return (
			<article
				className={cn(giftCardVariants({ cardStyle, status }))}
				ref={cardRef}
			>
				{gift.imageUrl && (
					<div className="relative size-16 shrink-0 overflow-hidden rounded-md bg-muted">
						<Image
							alt={gift.name}
							className="object-contain"
							fill
							sizes="64px"
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
						className="public-btn shrink-0 bg-primary px-4 py-2 text-primary-foreground text-sm transition-colors hover:bg-primary/90"
						onClick={() => onGiftAction?.(gift)}
						type="button"
					>
						Regalar
					</button>
				)}
			</article>
		);
	}

	if (isCollage) {
		const purchasedQuantity = Math.max(
			0,
			gift.quantityNeeded - gift.remainingQuantity,
		);
		const progressPercent =
			gift.quantityNeeded > 0
				? Math.min(100, (purchasedQuantity / gift.quantityNeeded) * 100)
				: 0;
		const source = [categoryName, gift.storeName].filter(Boolean).join(" · ");

		return (
			<article
				className={cn(giftCardVariants({ cardStyle, status }))}
				ref={cardRef}
			>
				<div className="relative h-36 w-full overflow-hidden bg-muted">
					{gift.imageUrl && (
						<Image
							alt={gift.name}
							className="object-cover"
							fill
							sizes="(min-width: 1024px) 440px, (min-width: 640px) 50vw, 100vw"
							src={gift.imageUrl}
						/>
					)}
					{gift.priority === "high" && (
						<PriorityBadge
							className="absolute top-2 left-2 text-[11px]"
							priority="high"
						/>
					)}
				</div>
				<div className="flex flex-1 flex-col px-3 py-3.5">
					{source && (
						<p className="font-mono text-[8px] text-muted-foreground uppercase leading-none tracking-[0.18em]">
							{source}
						</p>
					)}
					<h3
						className={cn(
							giftNameVariants({ status }),
							"mt-1 font-heading text-[14px] leading-[18px]",
						)}
					>
						{gift.name}
					</h3>
					<div className="mt-2.5 flex min-h-[19px] items-center gap-2">
						{gift.priceAmount && gift.priceCurrency && (
							<span className="font-semibold text-[15px] leading-[18px]">
								{formatPrice(gift.priceAmount, gift.priceCurrency)}
							</span>
						)}
						{isPartial ? (
							<span className="rounded-full bg-[#fbf1dc] px-2 py-0.5 font-medium text-[#9a6f1e] text-[10px]">
								{purchasedQuantity} de {gift.quantityNeeded}
							</span>
						) : (
							<StatusBadge className="text-[10px]" status={status} />
						)}
					</div>
					{isPartial && gift.quantityNeeded > 1 && (
						<div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
							<div
								className="h-full rounded-full bg-primary"
								style={{ width: `${progressPercent}%` }}
							/>
						</div>
					)}
					{gift.productUrl && (
						<a
							aria-disabled={isPurchased || isHidden}
							className="mt-1.5 w-fit text-[11px] text-muted-foreground underline underline-offset-2"
							href={isPurchased || isHidden ? undefined : gift.productUrl}
							rel="noopener noreferrer"
							style={{
								pointerEvents: isPurchased || isHidden ? "none" : undefined,
							}}
							target="_blank"
						>
							Ver producto
						</a>
					)}
					{showAction && (
						<button
							className="public-btn mt-3 w-full bg-primary px-4 py-1.5 text-primary-foreground text-xs leading-4 transition-colors hover:bg-primary/90"
							onClick={() => onGiftAction?.(gift)}
							type="button"
						>
							Marcar comprado
						</button>
					)}
				</div>
			</article>
		);
	}

	return (
		<article
			className={cn(giftCardVariants({ cardStyle, status }))}
			ref={cardRef}
		>
			{gift.imageUrl && (
				<div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
					<Image
						alt={gift.name}
						className="object-contain"
						fill
						sizes="(min-width: 1024px) 480px, (min-width: 640px) 50vw, 100vw"
						src={gift.imageUrl}
					/>
				</div>
			)}
			<div className="flex flex-1 flex-col p-4">
				<div className="flex flex-wrap items-start gap-2">
					<h3
						className={cn(
							giftNameVariants({ status }),
							"flex-1 font-heading",
							"text-xl",
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
							className="public-btn ml-auto bg-primary px-4 py-2 text-primary-foreground text-sm transition-colors hover:bg-primary/90"
							onClick={() => onGiftAction?.(gift)}
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
