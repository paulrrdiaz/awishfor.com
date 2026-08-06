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
			className="border-[var(--mline)] border-t bg-white px-[22px] py-11 text-center lg:px-11 lg:py-[76px]"
			id="ejemplo"
		>
			<div className="m-eyebrow mb-[9px] lg:mb-3">Un ejemplo real</div>
			<h2 className="m-serif mb-[6px] font-semibold text-[25px] lg:mb-2 lg:text-[38px]">
				Así se ve una wishlist publicada
			</h2>
			<p className="mb-[22px] text-[13px] text-[var(--mmut)] lg:mb-[34px] lg:text-[15px]">
				Construida con los mismos componentes públicos, con fotos reales de cada
				regalo.
			</p>

			<div className="m-preview-theme mx-auto max-w-[820px] overflow-clip rounded-[18px] bg-[var(--card)] text-left text-[var(--fg)] shadow-[0_18px_44px_rgba(30,50,80,0.14)] lg:rounded-[22px] lg:shadow-[0_24px_64px_rgba(30,50,80,0.14)]">
				<div className="hidden items-center justify-between border-[var(--border)] border-b bg-[var(--card)] px-[22px] py-3 lg:flex">
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

				<div className="bg-[linear-gradient(180deg,var(--accent),var(--card))] px-[18px] pt-[22px] pb-4 text-center lg:px-11 lg:pt-8 lg:pb-[22px]">
					<div className="m-eyebrow mb-[6px] text-[9px] text-[var(--muted-fg)] lg:mb-2">
						{preview.eyebrow}
					</div>
					<div className="m-serif font-semibold text-[26px] text-[var(--fg)] leading-[1.05] lg:text-[40px]">
						{preview.title}
					</div>
				</div>

				<div className="grid grid-cols-[1fr_1.1fr_1fr] items-end gap-2 bg-[linear-gradient(180deg,var(--card),var(--bg))] px-[18px] pb-5 lg:grid-cols-[1fr_1.15fr_1fr] lg:gap-3 lg:px-8 lg:pb-[30px]">
					<div className="mt-[22px] h-[82px] overflow-clip rounded-xl bg-[var(--ph-tint)] shadow-[0_12px_32px_rgba(30,50,80,0.10)] lg:mt-9 lg:h-[150px]">
						<img
							alt=""
							className="m-parallax h-full w-full scale-[1.14] object-cover [--m-par-from:-6%] [--m-par-to:6%]"
							loading="lazy"
							src={sizedImage(collageLeft ?? null, 280, 200)}
						/>
					</div>
					<div className="h-[118px] overflow-clip rounded-xl bg-[var(--ph-tint)] shadow-[0_18px_44px_rgba(30,50,80,0.13)] lg:h-[210px]">
						<img
							alt=""
							className="m-parallax h-full w-full scale-[1.08] object-cover [--m-par-from:-3%] [--m-par-to:3%]"
							loading="lazy"
							src={sizedImage(collageCenter ?? null, 320, 280)}
						/>
					</div>
					<div className="mt-[22px] h-[82px] overflow-clip rounded-xl bg-[var(--ph-tint)] shadow-[0_12px_32px_rgba(30,50,80,0.10)] lg:mt-9 lg:h-[150px]">
						<img
							alt=""
							className="m-parallax h-full w-full scale-[1.14] object-cover [--m-par-from:-6%] [--m-par-to:6%]"
							loading="lazy"
							src={sizedImage(collageRight ?? null, 280, 200)}
						/>
					</div>
				</div>

				<div className="px-[18px] pt-4 pb-5 lg:px-8 lg:pt-[26px] lg:pb-[30px]">
					{countdown && (
						<div className="mb-[10px] rounded-xl bg-[var(--accent)] p-3 text-center text-[var(--accent-fg)] lg:mb-5 lg:rounded-[var(--radius)] lg:p-4">
							<div className="m-eyebrow mb-[3px] text-[9px] opacity-70">
								Cuenta regresiva
							</div>
							<div className="m-serif font-semibold text-[22px] lg:text-[30px]">
								{countdown}
							</div>
						</div>
					)}
					<div className="mb-[6px] hidden items-center justify-between lg:flex">
						<div className="m-serif font-semibold text-[20px] text-[var(--fg)]">
							Lista de regalos
						</div>
						<span className="text-[12px] text-[var(--muted-fg)]">
							{preview.availableGiftCount} disponibles ·{" "}
							{preview.purchasedGiftCount} comprados
						</span>
					</div>
					<div className="mb-2 text-[10px] text-[var(--muted-fg)] lg:mb-3 lg:text-[11px]">
						↓ Desliza para ver los {preview.gifts.length} regalos
					</div>
					<div
						className="-mx-1 max-h-[240px] overflow-y-auto px-1 pr-1 lg:max-h-[300px]"
						style={{
							maskImage: "linear-gradient(180deg,#000 88%,transparent)",
							WebkitMaskImage: "linear-gradient(180deg,#000 88%,transparent)",
						}}
					>
						<div className="grid grid-cols-2 gap-[10px] lg:grid-cols-3 lg:gap-[14px]">
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
												className="h-[84px] w-full object-cover lg:h-[130px]"
												loading="lazy"
												src={sizedImage(gift.imageUrl, 300, 150)}
											/>
											{gift.priority === "high" && (
												<span className="absolute top-1.5 left-1.5 inline-flex items-center rounded-full bg-[var(--accent)] px-[10px] py-1 font-semibold text-[8px] text-[var(--accent-fg)] lg:top-2 lg:left-2 lg:text-[9px]">
													★ Infaltable
												</span>
											)}
										</div>
										<div className="p-[9px] lg:p-3">
											<div className="m-eyebrow mb-[3px] text-[9px] text-[var(--muted-fg)]">
												{[gift.category, gift.store]
													.filter(Boolean)
													.join(" · ")}
											</div>
											<div
												className={`m-serif font-semibold text-[11px] text-[var(--fg)] lg:text-[13px] ${isPurchased ? "line-through" : ""}`}
											>
												{gift.name}
											</div>
											<div className="mt-2 flex items-center justify-between">
												<span
													className={`font-semibold text-[11px] lg:text-[13px] ${isPurchased ? "text-[var(--muted-fg)]" : ""}`}
												>
													{gift.priceAmount && gift.priceCurrency
														? formatMoney(gift.priceAmount, {
																currency: gift.priceCurrency as Currency,
																locale: "es",
															})
														: null}
												</span>
												<span
													className="inline-flex items-center rounded-full px-[10px] py-1 font-semibold text-[8px] lg:text-[9px]"
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
			<div className="mt-5 lg:mt-[26px]">
				<a
					className="m-btn m-btn-out w-full lg:w-auto"
					href="/w/esperando-a-mateo"
				>
					Ver ejemplo completo →
				</a>
			</div>
		</section>
	);
}
