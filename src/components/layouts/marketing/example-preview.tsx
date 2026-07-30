import Image from "next/image";

import { DEMO_WISHLIST } from "@/config/demo-wishlist";

/** Server-only compact proof of the public wishlist contract; no live gift flow. */
export function ExamplePreview() {
	return (
		<section
			className="border-[var(--mline)] border-t bg-white px-11 py-[76px] text-center"
			id="ejemplo"
		>
			<div data-reveal>
				<div className="m-eyebrow mb-3">Un ejemplo real</div>
				<h2 className="m-serif mb-2 font-semibold text-[30px] lg:hidden">
					Una wishlist publicada
				</h2>
				<h2 className="m-serif mb-2 hidden font-semibold text-[38px] lg:block">
					Así se ve una wishlist publicada
				</h2>
				<p className="mb-8 text-[15px] text-[var(--mmut)]">
					Con fotos reales de cada regalo.
				</p>
			</div>
			<div
				className="m-card mx-auto max-w-[820px] overflow-hidden text-left shadow-[0_20px_60px_rgba(60,40,20,0.1)]"
				data-reveal
			>
				<div className="relative aspect-[5/2] overflow-hidden">
					<Image
						alt=""
						className="object-cover"
						fill
						loading="lazy"
						sizes="(min-width: 1024px) 820px, 100vw"
						src={DEMO_WISHLIST.coverImageUrl ?? ""}
					/>
					<div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(23,62,41,.76),transparent_70%)]" />
					<div className="absolute inset-x-0 bottom-0 p-6 text-white">
						<p className="m-serif font-semibold text-3xl">
							{DEMO_WISHLIST.title}
						</p>
						<p className="mt-1 text-sm text-white/80">
							{DEMO_WISHLIST.displayName}
						</p>
					</div>
				</div>
				<div className="grid gap-4 p-5 sm:grid-cols-3">
					{DEMO_WISHLIST.gifts.map((gift) => (
						<article
							className="overflow-hidden rounded-xl border border-[var(--mline)]"
							key={gift.id}
						>
							<div className="relative aspect-[4/3]">
								<Image
									alt={gift.name}
									className="object-cover"
									fill
									loading="lazy"
									sizes="240px"
									src={gift.imageUrl ?? ""}
								/>
							</div>
							<div className="p-3">
								<h3 className="m-serif font-semibold text-[var(--mink)]">
									{gift.name}
								</h3>
								<p className="mt-1 text-[13px] text-[var(--mmut)]">
									S/ {gift.priceAmount}
								</p>
								<span
									aria-disabled
									className="mt-3 inline-block rounded-full bg-[var(--mline)] px-3 py-1 text-[12px] text-[var(--mmut)]"
								>
									Solo ejemplo
								</span>
							</div>
						</article>
					))}
				</div>
			</div>
		</section>
	);
}
