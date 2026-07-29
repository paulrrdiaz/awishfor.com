import Image from "next/image";
import Link from "next/link";

import { HERO_OCCASIONS } from "./hero-occasions";

/** Compact H2b proof cards; the full public-wishlist preview remains at #ejemplo. */
export function HeroExampleRail() {
	return (
		<div className="relative mt-8 h-24" data-hero-rails>
			{HERO_OCCASIONS.map((occasion, index) => {
				const isActive = index === 0;
				return (
					<aside
						aria-hidden={isActive ? undefined : true}
						aria-label={`Ejemplo real: la wishlist de ${occasion.rail.name}`}
						className={`absolute inset-0 inline-flex items-center gap-3 rounded-lg border border-white/[.2] bg-[#081A0F]/[.72] px-4 py-3 text-white shadow-[0_10px_26px_rgba(0,0,0,.16)] backdrop-blur-sm ${isActive ? "opacity-100" : "opacity-0"}`}
						data-active={String(isActive)}
						data-hero-index={index}
						data-hero-rail
						inert={!isActive}
						key={occasion.id}
					>
						<div className="space-y-1 border-white/[.22] border-r pr-3">
							<p className="font-mono text-[#D7F09E] text-xs uppercase tracking-[0.16em]">
								{occasion.rail.eyebrow}
							</p>
							<p className="m-serif font-semibold text-md leading-none">
								{occasion.rail.name}
							</p>
							<p className="whitespace-nowrap text-white/[.7] text-xs">
								{occasion.rail.meta}
							</p>
						</div>
						<div className="flex flex-1 justify-start gap-2">
							{occasion.rail.gifts.slice(0, 2).map((gift) => (
								<div
									className="flex min-w-0 items-center gap-1"
									key={gift.name}
								>
									<Image
										alt=""
										className="h-8 w-8 shrink-0 rounded-[4px] object-cover"
										height={32}
										src={gift.image}
										width={32}
									/>
									<p className="truncate font-medium text-white/[.9] text-xs">
										{gift.name}
									</p>
								</div>
							))}
						</div>
						<Link
							className="shrink-0 font-semibold text-[#D7F09E] text-sm hover:text-white focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-4"
							href={`/wishlists/${occasion.id}`}
							rel="noopener noreferrer"
							target="_blank"
						>
							Ver esta wishlist →
						</Link>
					</aside>
				);
			})}
		</div>
	);
}
