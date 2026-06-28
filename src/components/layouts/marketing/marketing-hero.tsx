import Link from "next/link";

import { HeroCardCarousel } from "./hero-card-carousel";

export function MarketingHero() {
	return (
		<section
			className="relative overflow-hidden px-11 pt-[76px] pb-[88px]"
			data-mesh
			style={{
				background:
					"linear-gradient(150deg,#D6F2C0 0%,#EEF9E6 38%,#E2F7D8 65%,#D0EDBC 100%)",
				backgroundSize: "200% 200%",
			}}
		>
			{/* ambient blobs */}
			<div
				className="m-blob"
				data-float
				style={{
					width: 440,
					height: 440,
					background: "#BCE25A",
					filter: "blur(110px)",
					opacity: 0.2,
					top: -160,
					left: -100,
				}}
			/>
			<div
				className="m-blob"
				data-float-rev
				style={{
					width: 320,
					height: 320,
					background: "#7FB069",
					filter: "blur(90px)",
					opacity: 0.18,
					bottom: -100,
					right: -20,
				}}
			/>
			<div
				className="m-blob"
				data-float-3
				style={{
					width: 180,
					height: 180,
					background: "#BCE25A",
					filter: "blur(60px)",
					opacity: 0.16,
					top: "30%",
					left: "43%",
				}}
			/>
			{/* dot grid */}
			<div
				className="pointer-events-none absolute inset-0"
				style={{
					backgroundImage:
						"radial-gradient(circle,rgba(23,62,41,.055) 1.5px,transparent 1.5px)",
					backgroundSize: "28px 28px",
				}}
			/>
			{/* floating emoji */}
			<div
				className="pointer-events-none absolute text-[34px]"
				data-float
				style={{ top: 44, right: "29%" }}
			>
				🎁
			</div>
			<div
				className="pointer-events-none absolute text-[30px]"
				data-float-rev
				style={{ bottom: 60, left: "4%" }}
			>
				🌿
			</div>
			<div
				className="pointer-events-none absolute text-[22px]"
				data-float-3
				style={{ top: 110, left: "44%" }}
			>
				✨
			</div>
			<div
				className="pointer-events-none absolute text-[24px] opacity-80"
				data-float
				style={{ bottom: 90, right: "11%" }}
			>
				🎉
			</div>

			<div className="relative mx-auto grid max-w-[1152px] grid-cols-1 items-center gap-[52px] lg:grid-cols-[1.1fr_0.9fr]">
				{/* left column */}
				<div data-reveal>
					<div
						className="mb-[26px] inline-flex items-center gap-2 rounded-full border border-[rgba(94,190,90,0.3)] bg-white px-4 py-[7px] font-semibold text-[12px]"
						style={{ boxShadow: "0 4px 14px rgba(60,140,60,.12)" }}
					>
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
						Agrega regalos de cualquier tienda, personaliza tu página y
						compártela con tus invitados por enlace, WhatsApp o QR.
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
						className="absolute z-10 flex h-[54px] w-[54px] items-center justify-center rounded-[16px] text-[24px]"
						data-spin
						style={{
							background: "var(--msun)",
							top: -22,
							right: "6%",
							boxShadow: "0 8px 20px rgba(244,200,74,.45)",
						}}
					>
						🎉
					</div>
					<div
						className="absolute"
						style={{
							inset: -14,
							borderRadius: 32,
							background:
								"linear-gradient(135deg,rgba(188,226,90,.22),rgba(86,168,107,.14))",
							filter: "blur(20px)",
						}}
					/>
					<div data-bob>
						<HeroCardCarousel />
					</div>
					<div
						className="absolute z-20 flex items-center gap-[10px] rounded-[16px] border border-[rgba(23,62,41,0.1)] bg-white px-4 py-[10px]"
						data-float
						style={{
							bottom: -18,
							left: -22,
							boxShadow: "0 8px 24px rgba(23,62,41,.1)",
						}}
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
