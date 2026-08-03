/* biome-ignore-all lint/performance/noImgElement: the band photograph is a local, optimized, lazily loaded asset. */
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGuestFinder } from "@/lib/wishlist/use-guest-finder";

export function GuestFinder() {
	const { error, clearError, onSubmit } = useGuestFinder();

	return (
		<section className="relative min-h-[280px] overflow-hidden border-[var(--mline)] border-t">
			<picture>
				<source
					media="(min-width: 1024px)"
					srcSet="/assets/hero/guest-finder-band.jpg"
				/>
				<img
					alt=""
					className="absolute inset-0 h-full w-full object-cover"
					decoding="async"
					height={1066}
					loading="lazy"
					src="/assets/hero/guest-finder-band-mobile.jpg"
					width={640}
				/>
			</picture>
			<div className="absolute inset-0 bg-[linear-gradient(150deg,rgba(11,30,20,0.72),rgba(11,30,20,0.55))]" />
			<div className="relative px-11 py-[70px] text-center text-white">
				<div className="mb-3 text-[26px]">🔍</div>
				<h2 className="m-serif mb-2 font-semibold text-[34px]">
					¿Buscas la lista de alguien?
				</h2>
				<p className="mb-[26px] text-[15px] text-white/[.82]">
					Encuentra su wishlist por nombre o por enlace.
				</p>
				<form className="mx-auto max-w-[520px]" noValidate onSubmit={onSubmit}>
					<div className="flex items-center gap-[10px]">
						<Input
							aria-invalid={Boolean(error)}
							aria-label="Enlace o nombre de la lista"
							className="h-auto flex-1 rounded-full border-white/[.32] bg-white/[.14] px-5 py-[14px] text-[14px] text-white backdrop-blur-[4px] placeholder:text-white/[.85] focus-visible:border-white"
							name="query"
							onChange={clearError}
							placeholder="Nombre del evento o la pareja…"
						/>
						<Button
							className="m-btn m-btn-glow m-btn-lime h-auto"
							type="submit"
						>
							Buscar
						</Button>
					</div>
					<p
						aria-live="polite"
						className="mt-[10px] min-h-[20px] text-[13px] text-white"
					>
						{error}
					</p>
				</form>
			</div>
		</section>
	);
}
