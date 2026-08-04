/* biome-ignore-all lint/performance/noImgElement: the photograph is a local, optimized, lazily loaded asset. */
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGuestFinder } from "@/lib/wishlist/use-guest-finder";

export function GuestFinder() {
	const { error, clearError, onSubmit } = useGuestFinder();

	return (
		<section className="relative min-h-[220px] overflow-hidden border-[var(--mline)] border-t lg:min-h-[280px]">
			<img
				alt=""
				className="absolute inset-0 h-full w-full object-cover"
				decoding="async"
				height={1279}
				loading="lazy"
				src="/assets/hero/buscas-la-lista-de-alguien.jpg"
				width={1917}
			/>
			<div className="absolute inset-0 bg-[linear-gradient(160deg,rgba(11,30,20,0.72),rgba(11,30,20,0.55))] lg:bg-[linear-gradient(150deg,rgba(11,30,20,0.72),rgba(11,30,20,0.55))]" />
			<div className="relative px-[22px] py-11 text-center text-white lg:px-11 lg:py-[70px]">
				<div className="mb-[10px] text-[22px] lg:mb-3 lg:text-[26px]">🔍</div>
				<h2 className="m-serif mb-[6px] font-semibold text-[23px] lg:mb-2 lg:text-[34px]">
					¿Buscas la lista de alguien?
				</h2>
				<p className="mb-5 text-[13px] text-white/[.82] lg:mb-[26px] lg:text-[15px]">
					Encuentra su wishlist por nombre o por enlace.
				</p>
				<form className="mx-auto max-w-[520px]" noValidate onSubmit={onSubmit}>
					<div className="flex flex-col gap-[10px] lg:flex-row lg:items-center">
						<Input
							aria-invalid={Boolean(error)}
							aria-label="Enlace o nombre de la lista"
							className="h-auto flex-1 rounded-[14px] border-white/[.32] bg-white/[.14] px-5 py-[13px] text-[13.5px] text-white placeholder:text-white/[.85] focus-visible:border-white lg:rounded-full lg:py-[14px] lg:text-[14px] lg:backdrop-blur-[4px]"
							name="query"
							onChange={clearError}
							placeholder="Nombre del evento o la pareja…"
						/>
						<Button
							className="m-btn m-btn-glow m-btn-lime h-auto w-full lg:w-auto"
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
