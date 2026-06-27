"use client";

import Image from "next/image";
import { useState } from "react";
import { PurchaseGiftModal } from "@/components/features/wishlist/purchase-gift-modal";
import type { PublicGiftViewModel } from "@/server/mappers/view-models";

type GiftCardStyle = "card" | "row" | "minimal";

type Props = {
	gift: PublicGiftViewModel;
	cardStyle?: GiftCardStyle;
	actionsEnabled?: boolean;
};

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

export function GiftCard({
	gift,
	cardStyle = "card",
	actionsEnabled = false,
}: Props) {
	const [modalOpen, setModalOpen] = useState(false);
	const isPurchased = gift.status === "purchased";
	const isPartial = gift.status === "partial";
	const isHigh = gift.priority === "high";

	if (cardStyle === "row" || cardStyle === "minimal") {
		return (
			<div
				className="flex items-center gap-4 rounded-lg border p-4 transition-opacity"
				style={{
					borderColor: "var(--public-border)",
					backgroundColor: "var(--public-surface)",
					opacity: isPurchased ? 0.6 : 1,
				}}
			>
				{gift.imageUrl && (
					<div className="relative size-16 shrink-0 overflow-hidden rounded-md">
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
						<span
							className="font-medium"
							style={{ color: "var(--public-text)" }}
						>
							{gift.name}
						</span>
						{isHigh && (
							<span
								className="rounded-full px-2 py-0.5 font-semibold text-xs"
								style={{
									backgroundColor: "var(--public-accent)",
									color: "var(--public-bg)",
								}}
							>
								Infaltable
							</span>
						)}
						{isPurchased && (
							<span
								className="rounded-full px-2 py-0.5 font-medium text-xs"
								style={{
									backgroundColor: "var(--public-border)",
									color: "var(--public-text-muted)",
								}}
							>
								Comprado
							</span>
						)}
					</div>
					<div
						className="mt-1 flex flex-wrap gap-3 text-sm"
						style={{ color: "var(--public-text-muted)" }}
					>
						{gift.priceAmount && gift.priceCurrency && (
							<span>{formatPrice(gift.priceAmount, gift.priceCurrency)}</span>
						)}
						{gift.storeName && <span>{gift.storeName}</span>}
						{gift.productUrl && (
							<a
								aria-disabled={isPurchased}
								className="underline underline-offset-2"
								href={isPurchased ? undefined : gift.productUrl}
								rel="noopener noreferrer"
								style={{
									color: "var(--public-text-muted)",
									pointerEvents: isPurchased ? "none" : undefined,
								}}
								target="_blank"
							>
								Ver producto
							</a>
						)}
					</div>
					{gift.publicNote && (
						<p
							className="mt-1 text-sm"
							style={{ color: "var(--public-text-muted)" }}
						>
							{gift.publicNote}
						</p>
					)}
					{isPartial && gift.quantityNeeded > 1 && (
						<p
							className="mt-1 text-xs"
							style={{ color: "var(--public-accent)" }}
						>
							Aún quedan algunos disponibles
						</p>
					)}
				</div>
				{actionsEnabled && !isPurchased && (
					<button
						className="shrink-0 rounded px-4 py-2 font-medium text-sm transition-colors"
						onClick={() => setModalOpen(true)}
						style={{
							backgroundColor: "var(--public-accent)",
							color: "var(--public-bg)",
							borderRadius: "var(--public-btn-radius, 0.375rem)",
							fontWeight: "var(--public-btn-weight, 500)",
						}}
						type="button"
					>
						Regalar
					</button>
				)}
				{actionsEnabled && (
					<PurchaseGiftModal
						gift={gift}
						onOpenChange={setModalOpen}
						open={modalOpen}
					/>
				)}
			</div>
		);
	}

	// card style (default)
	return (
		<div
			className="flex flex-col overflow-hidden rounded-xl border transition-opacity"
			style={{
				borderColor: "var(--public-border)",
				backgroundColor: "var(--public-surface)",
				opacity: isPurchased ? 0.6 : 1,
			}}
		>
			{gift.imageUrl && (
				<div className="relative aspect-[4/3] w-full overflow-hidden">
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
						className="flex-1 font-medium leading-snug"
						style={{ color: "var(--public-text)" }}
					>
						{gift.name}
					</h3>
					{isHigh && (
						<span
							className="rounded-full px-2 py-0.5 font-semibold text-xs"
							style={{
								backgroundColor: "var(--public-accent)",
								color: "var(--public-bg)",
							}}
						>
							Infaltable
						</span>
					)}
				</div>
				<div
					className="mt-2 flex flex-wrap gap-3 text-sm"
					style={{ color: "var(--public-text-muted)" }}
				>
					{gift.priceAmount && gift.priceCurrency && (
						<span className="font-medium">
							{formatPrice(gift.priceAmount, gift.priceCurrency)}
						</span>
					)}
					{gift.storeName && <span>{gift.storeName}</span>}
					{gift.productUrl && (
						<a
							aria-disabled={isPurchased}
							className="underline underline-offset-2"
							href={isPurchased ? undefined : gift.productUrl}
							rel="noopener noreferrer"
							style={{
								color: "var(--public-text-muted)",
								pointerEvents: isPurchased ? "none" : undefined,
							}}
							target="_blank"
						>
							Ver producto
						</a>
					)}
				</div>
				{gift.publicNote && (
					<p
						className="mt-2 text-sm leading-relaxed"
						style={{ color: "var(--public-text-muted)" }}
					>
						{gift.publicNote}
					</p>
				)}
				<div className="mt-auto flex items-center justify-between pt-4">
					{isPurchased ? (
						<span
							className="rounded-full px-2 py-0.5 font-medium text-xs"
							style={{
								backgroundColor: "var(--public-border)",
								color: "var(--public-text-muted)",
							}}
						>
							Comprado
						</span>
					) : (
						<span />
					)}
					{isPartial && gift.quantityNeeded > 1 && (
						<span className="text-xs" style={{ color: "var(--public-accent)" }}>
							Parcialmente regalado
						</span>
					)}
					{actionsEnabled && !isPurchased && (
						<button
							className="ml-auto rounded px-4 py-2 font-medium text-sm"
							onClick={() => setModalOpen(true)}
							style={{
								backgroundColor: "var(--public-accent)",
								color: "var(--public-bg)",
								borderRadius: "var(--public-btn-radius, 0.375rem)",
								fontWeight: "var(--public-btn-weight, 500)",
							}}
							type="button"
						>
							Regalar
						</button>
					)}
				</div>
				{actionsEnabled && (
					<PurchaseGiftModal
						gift={gift}
						onOpenChange={setModalOpen}
						open={modalOpen}
					/>
				)}
			</div>
		</div>
	);
}
