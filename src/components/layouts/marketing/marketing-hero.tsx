import Link from "next/link";

import { HeroCardCarousel } from "./hero-card-carousel";

export function MarketingHero() {
	return (
		<section
			className="relative m-mesh overflow-hidden px-11 pt-[76px] pb-[88px]"
			data-mesh
		>
			{/* ambient blobs */}
			<div
				className="-top-[160px] -left-[100px] m-blob h-[440px] w-[440px] bg-[#BCE25A] opacity-20 blur-[110px]"
				data-float
			/>
			<div
				className="-right-[20px] -bottom-[100px] m-blob h-[320px] w-[320px] bg-[#7FB069] opacity-[0.18] blur-[90px]"
				data-float-rev
			/>
			<div
				className="top-[30%] left-[43%] m-blob h-[180px] w-[180px] bg-[#BCE25A] opacity-[0.16] blur-[60px]"
				data-float-3
			/>
			{/* dot grid */}
			<div className="pointer-events-none absolute inset-0 m-dot-grid" />
			{/* floating emoji */}
			<div
				className="pointer-events-none absolute top-[44px] right-[29%] text-[34px]"
				data-float
			>
				🎁
			</div>
			<div
				className="pointer-events-none absolute bottom-[60px] left-[4%] text-[30px]"
				data-float-rev
			>
				🌿
			</div>
			<div
				className="pointer-events-none absolute top-[110px] left-[44%] text-[22px]"
				data-float-3
			>
				✨
			</div>
			<div
				className="pointer-events-none absolute right-[11%] bottom-[90px] text-[24px] opacity-80"
				data-float
			>
				🎉
			</div>

			<div className="relative mx-auto grid max-w-[1152px] grid-cols-1 items-center gap-[52px] lg:grid-cols-[1.1fr_0.9fr]">
				{/* left column */}
				<div data-reveal>
					<div className="mb-[26px] inline-flex items-center gap-2 rounded-full border border-[rgba(94,190,90,0.3)] bg-white px-4 py-[7px] font-semibold text-[12px] shadow-[0_4px_14px_rgba(60,140,60,0.12)]">
						<span
							className="inline-block h-2 w-2 rounded-full bg-[#56A86B]"
							data-pulse
						/>
						Wishlists con buena vibra ✨
					</div>
					<h1 className="m-serif mb-[22px] font-semibold text-[62px] text-[var(--mink)] leading-[1.02] tracking-[-0.025em]">
						Crea una wishlist{" "}
						<span className="m-shimmer" data-shimmer>
							hermosa
						</span>{" "}
						para tus momentos especiales.
					</h1>
					<p className="mb-8 max-w-[480px] text-[17px] text-[var(--mmut)] leading-[1.65]">
						Agrega regalos de cualquier tienda, personaliza tu página con temas
						hermosos y compártela con tus invitados por enlace, WhatsApp o QR.
						Ellos marcan lo que compran para no repetir.
					</p>
					<div className="mb-9 flex items-center gap-3">
						<Link className="m-btn m-btn-lime" data-glow href="/create">
							Crear mi wishlist →
						</Link>
						<a className="m-btn m-btn-out" href="#ejemplo">
							Ver ejemplo
						</a>
					</div>
					<div className="inline-flex overflow-hidden rounded-[18px] border border-[rgba(23,62,41,0.14)] bg-[rgba(255,255,255,0.86)]">
						<div className="border-[rgba(23,62,41,0.1)] border-r px-[22px] py-[14px] text-center">
							<div className="m-serif font-bold text-[26px] text-[var(--mink)]">
								+10 mil
							</div>
							<div className="mt-[2px] text-[11px] text-[var(--mmut)]">
								listas creadas
							</div>
						</div>
						<div className="border-[rgba(23,62,41,0.1)] border-r px-[22px] py-[14px] text-center">
							<div className="m-serif font-bold text-[26px] text-[var(--mink)]">
								4.9 ★
							</div>
							<div className="mt-[2px] text-[11px] text-[var(--mmut)]">
								satisfacción
							</div>
						</div>
						<div className="px-[22px] py-[14px] text-center">
							<div className="m-serif font-bold text-[26px] text-[var(--mink)]">
								100%
							</div>
							<div className="mt-[2px] text-[11px] text-[var(--mmut)]">
								gratis
							</div>
						</div>
					</div>
				</div>

				{/* right column — teaser card */}
				<div className="relative" data-reveal>
					<div
						className="absolute -top-[22px] right-[6%] z-10 flex h-[54px] w-[54px] items-center justify-center rounded-[16px] bg-[var(--msun)] text-[24px] shadow-[0_8px_20px_rgba(244,200,74,0.45)]"
						data-spin
					>
						🎉
					</div>
					<div className="absolute -inset-[14px] rounded-[32px] bg-[linear-gradient(135deg,rgba(188,226,90,0.22),rgba(86,168,107,0.14))] blur-[20px]" />
					<div data-bob>
						<HeroCardCarousel />
					</div>
					<div
						className="absolute -bottom-[18px] -left-[22px] z-20 flex items-center gap-[10px] rounded-[16px] border border-[rgba(23,62,41,0.1)] bg-white px-4 py-[10px] shadow-[0_8px_24px_rgba(23,62,41,0.1)]"
						data-float
					>
						<div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E4F3DC] text-[15px]">
							🎁
						</div>
						<div>
							<div className="font-bold text-[12px] text-[var(--mink)]">
								¡Regalo marcado!
							</div>
							<div className="text-[10px] text-[var(--mmut)]">
								hace 2 min · María G.
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
