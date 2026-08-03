/* biome-ignore-all lint/performance/noImgElement: preview media is URL-sized, lazy, and outside the first fold. */

import { DEMO_WISHLIST } from "@/config/demo-wishlist";
import type { Currency } from "@/generated/prisma/enums";
import { formatCountdown } from "@/lib/format/countdown";
import { formatMoney } from "@/lib/format/money";
import type { MarketingWishlistPreviewGift } from "@/lib/wishlist/public-presentation";
import { toMarketingWishlistPreview } from "@/lib/wishlist/public-presentation";

const STATUS_BADGE: Record<
	MarketingWishlistPreviewGift["status"],
	{ label: string; bg: string; fg: string }
> = {
	available: { label: "Disponible", bg: "#E4F3E8", fg: "#2F7D43" },
	partial: { label: "", bg: "#FBF1DC", fg: "#9A6F1E" },
	purchased: { label: "✓ Comprado", bg: "#EAECEF", fg: "#71798A" },
};

function statusLabel(gift: MarketingWishlistPreviewGift) {
	if (gift.status === "partial") {
		const purchased = gift.quantityNeeded - gift.remainingQuantity;
		return `${purchased} de ${gift.quantityNeeded}`;
	}
	return STATUS_BADGE[gift.status].label;
}

function sizedImage(url: string | null, width: number, height: number) {
	if (!url) return "";
	if (!url.startsWith("https://images.unsplash.com/")) return url;
	return `${url}?w=${width}&h=${height}&fit=crop&auto=format`;
}

/** Server-only compact proof of the public wishlist contract; no live gift flow. */
export function ExamplePreview() {
	const preview = toMarketingWishlistPreview(DEMO_WISHLIST);
	const countdown = preview.eventDate
		? formatCountdown(preview.eventDate)
		: null;
	const [collageLeft, collageCenter, collageRight] = preview.coverImageUrls;

	return (
		<section
			className="border-[var(--mline)] border-t bg-white px-11 py-[76px] text-center"
			id="ejemplo"
		>
			<div className="m-eyebrow mb-3">Un ejemplo real</div>
			<h2 className="m-serif mb-2 font-semibold text-[38px]">
				Así se ve una wishlist publicada
			</h2>
			<p className="mb-[34px] text-[15px] text-[var(--mmut)]">
				Construida con los mismos componentes públicos, con fotos reales de cada
				regalo.
			</p>

			<div className="m-preview-theme mx-auto max-w-[820px] overflow-hidden rounded-[22px] bg-[var(--card)] text-left text-[var(--fg)] shadow-[0_24px_64px_rgba(30,50,80,0.14)]">
				<div className="flex items-center justify-between border-[var(--border)] border-b bg-[var(--card)] px-[22px] py-3">
					<img alt="" className="h-[18px] w-auto" src="/assets/isotype.svg" />
					<div className="flex items-center gap-2">
						<span className="inline-flex items-center gap-[5px] rounded-full bg-[#E4F3E8] px-[10px] py-1 font-semibold text-[#2F7D43] text-[9px]">
							● Publicada
						</span>
						<span className="inline-flex items-center gap-[6px] rounded-full border border-[var(--border)] px-3 py-[5px] font-medium text-[11px] text-[var(--fg)]">
							Compartir
						</span>
					</div>
				</div>

				<div className="bg-[linear-gradient(180deg,var(--accent),var(--card))] px-11 pt-8 pb-[22px] text-center">
					<div className="m-eyebrow mb-2 text-[var(--muted-fg)]">
						{preview.eyebrow}
					</div>
					<div className="m-serif font-semibold text-[40px] text-[var(--fg)] leading-[1.05]">
						{preview.title}
					</div>
					{preview.displayName && (
						<div className="mt-[6px] text-[13px] text-[var(--muted-fg)]">
							{preview.displayName}
						</div>
					)}
				</div>

				<div className="grid grid-cols-3 items-end gap-3 bg-[linear-gradient(180deg,var(--card),var(--bg))] px-8 pb-[30px]">
					<div className="mt-9 h-[150px] overflow-hidden rounded-xl bg-[var(--ph-tint)] shadow-[0_12px_32px_rgba(30,50,80,0.10)]">
						<img
							alt=""
							className="h-full w-full object-cover"
							loading="lazy"
							src={sizedImage(collageLeft ?? null, 280, 200)}
						/>
					</div>
					<div className="h-[210px] overflow-hidden rounded-xl bg-[var(--ph-tint)] shadow-[0_18px_44px_rgba(30,50,80,0.13)]">
						<img
							alt=""
							className="h-full w-full object-cover"
							loading="lazy"
							src={sizedImage(collageCenter ?? null, 320, 280)}
						/>
					</div>
					<div className="mt-9 h-[150px] overflow-hidden rounded-xl bg-[var(--ph-tint)] shadow-[0_12px_32px_rgba(30,50,80,0.10)]">
						<img
							alt=""
							className="h-full w-full object-cover"
							loading="lazy"
							src={sizedImage(collageRight ?? null, 280, 200)}
						/>
					</div>
				</div>

				<div className="px-8 pt-[26px] pb-[30px]">
					{countdown && (
						<div className="mb-5 rounded-[var(--radius)] bg-[var(--accent)] p-4 text-center">
							<div className="m-eyebrow mb-[3px] text-[9px] opacity-70">
								Cuenta regresiva
							</div>
							<div className="m-serif font-semibold text-[30px]">
								{countdown}
							</div>
						</div>
					)}
					<div className="mb-[6px] flex items-center justify-between">
						<div className="m-serif font-semibold text-[20px] text-[var(--fg)]">
							Lista de regalos
						</div>
						<span className="text-[12px] text-[var(--muted-fg)]">
							{preview.availableGiftCount} disponibles ·{" "}
							{preview.purchasedGiftCount} comprados
						</span>
					</div>
					<div className="mb-3 text-[11px] text-[var(--muted-fg)]">
						↓ Desliza para ver los {preview.gifts.length} regalos
					</div>
					<div
						className="-mx-1 max-h-[300px] overflow-y-auto px-1 pr-1"
						style={{
							maskImage: "linear-gradient(180deg,#000 88%,transparent)",
							WebkitMaskImage: "linear-gradient(180deg,#000 88%,transparent)",
						}}
					>
						<div className="grid grid-cols-2 gap-[14px] sm:grid-cols-3">
							{preview.gifts.map((gift) => {
								const badge = STATUS_BADGE[gift.status];
								const isPurchased = gift.status === "purchased";
								return (
									<article
										className={`overflow-hidden rounded-[var(--radius)] border border-[var(--border)] bg-[var(--card)] ${isPurchased ? "opacity-60" : ""}`}
										key={gift.id}
									>
										<div className="relative">
											<img
												alt={gift.name}
												className="h-[130px] w-full object-cover"
												loading="lazy"
												src={sizedImage(gift.imageUrl, 300, 150)}
											/>
											{gift.priority === "high" && (
												<span className="absolute top-2 left-2 inline-flex items-center rounded-full bg-[var(--accent)] px-[10px] py-1 font-semibold text-[#7A7162] text-[9px]">
													★ Infaltable
												</span>
											)}
										</div>
										<div className="p-3">
											<div className="m-eyebrow mb-[3px] text-[9px] text-[var(--muted-fg)]">
												{[gift.category, gift.store]
													.filter(Boolean)
													.join(" · ")}
											</div>
											<div
												className={`m-serif font-semibold text-[13px] text-[var(--fg)] ${isPurchased ? "line-through" : ""}`}
											>
												{gift.name}
											</div>
											<div className="mt-2 flex items-center justify-between">
												<span
													className={`font-semibold text-[13px] ${isPurchased ? "text-[var(--muted-fg)]" : ""}`}
												>
													{gift.priceAmount && gift.priceCurrency
														? formatMoney(gift.priceAmount, {
																currency: gift.priceCurrency as Currency,
																locale: "es",
															})
														: null}
												</span>
												<span
													className="inline-flex items-center rounded-full px-[10px] py-1 font-semibold text-[9px]"
													style={{ background: badge.bg, color: badge.fg }}
												>
													{statusLabel(gift)}
												</span>
											</div>
										</div>
									</article>
								);
							})}
						</div>
					</div>
				</div>
			</div>
			<div className="mt-[26px]">
				<a className="m-btn m-btn-out" href="/w/esperando-a-mateo">
					Ver ejemplo completo →
				</a>
			</div>
		</section>
	);
}
