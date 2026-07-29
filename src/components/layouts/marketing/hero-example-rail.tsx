import Image from "next/image";
import Link from "next/link";

const GIFTS = [
	{
		name: "Copas",
		meta: "$2,400",
		image:
			"https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=96&h=96&fit=crop&auto=format",
	},
	{
		name: "Vajilla",
		meta: "2 de 4",
		image:
			"https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=96&h=96&fit=crop&auto=format",
	},
];

/** Compact H2b proof card; the full public-wishlist preview remains at #ejemplo. */
export function HeroExampleRail() {
	return (
		<aside
			aria-label="Ejemplo real: la wishlist de María y Tomás"
			className="mt-8 flex h-[66px] w-[436px] items-center rounded-[12px] border border-white/[.2] bg-[#081A0F]/[.72] px-[16px] text-white shadow-[0_10px_26px_rgba(0,0,0,.16)] backdrop-blur-sm"
		>
			<div className="w-[116px] shrink-0 border-white/[.22] border-r pr-3">
				<p className="mb-[2px] font-mono text-[#D7F09E] text-[8px] uppercase tracking-[0.16em]">
					Ejemplo real
				</p>
				<p className="m-serif font-semibold text-[13px] leading-none">
					María &amp; Tomás
				</p>
				<p className="mt-[3px] text-[9px] text-white/[.7]">Boda · 16 regalos</p>
			</div>

			<div className="flex min-w-0 flex-1 items-center gap-3 px-3">
				{GIFTS.map((gift) => (
					<div className="flex min-w-0 items-center gap-[7px]" key={gift.name}>
						<Image
							alt=""
							className="h-6 w-6 shrink-0 rounded-[5px] object-cover"
							height={24}
							src={gift.image}
							unoptimized
							width={24}
						/>
						<p className="whitespace-nowrap font-medium text-[9.5px] text-white/[.9]">
							{gift.name} · {gift.meta}
						</p>
					</div>
				))}
			</div>

			<Link
				className="shrink-0 whitespace-nowrap font-semibold text-[#D7F09E] text-[10px] hover:text-white focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-4"
				href="#ejemplo"
			>
				Ver ejemplo →
			</Link>
		</aside>
	);
}
