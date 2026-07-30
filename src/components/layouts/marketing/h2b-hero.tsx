import Image from "next/image";
import Link from "next/link";

import { HeroExampleRail } from "./hero-example-rail";
import { HERO_OCCASIONS, HERO_SCRIM_VALUES } from "./hero-occasions";
import { HeroRotatorDriver } from "./hero-rotator-driver";

export function H2bHero() {
	const wedding = HERO_OCCASIONS[0];

	return (
		<section
			className="relative min-h-[700px] w-full overflow-visible"
			data-h2b-hero
			data-hero-rotator
			style={HERO_SCRIM_VALUES[wedding.scrim]}
		>
			<div className="absolute inset-x-0 top-0 h-full overflow-hidden">
				<Image
					alt=""
					className="object-cover brightness-[1.2] contrast-[.95] saturate-[1.06]"
					data-hero-photo-index="0"
					fill
					loading="eager"
					priority
					sizes="(min-width: 1240px) 1240px, 100vw"
					src={wedding.photo.desktop}
					style={{ transform: "translate(-0.5%, -0.25%) scale(1.04)" }}
				/>
				<HeroRotatorDriver />
				<div
					aria-hidden
					className="absolute inset-0 z-10 bg-[linear-gradient(105deg,rgba(2,16,8,.64)_0%,rgba(2,16,8,.5)_44%,rgba(2,16,8,.3)_100%)]"
					data-hero-drape
				/>
				<div
					aria-hidden
					className="absolute inset-0 z-20 bg-[linear-gradient(96deg,rgb(8_26_15_/_var(--hero-scrim-horizontal-start))_0%,rgb(8_26_15_/_var(--hero-scrim-horizontal-middle))_50%,rgb(8_26_15_/_var(--hero-scrim-horizontal-end))_80%)]"
				/>
				<div
					aria-hidden
					className="absolute inset-0 z-20 bg-[linear-gradient(180deg,rgb(8_26_15_/_var(--hero-scrim-vertical-top))_0%,rgb(8_26_15_/_0%)_40%,rgb(8_26_15_/_var(--hero-scrim-vertical-bottom))_100%)]"
				/>
				<div
					aria-hidden
					className="absolute inset-x-0 top-0 z-20 h-[112px] bg-[linear-gradient(180deg,rgb(8_26_15_/_var(--hero-scrim-header)),rgb(8_26_15_/_0%))]"
				/>
			</div>

			<div className="absolute inset-x-0 bottom-0 z-30 mx-auto h-full max-w-[1240px]">
				<div className="absolute right-6 bottom-16 left-0 max-w-[520px] text-white lg:max-w-[700px]">
					<p className="mb-4 font-mono text-[10px] text-white/70 uppercase tracking-[0.16em] lg:mb-5 lg:text-[10.5px]">
						Wishlists para momentos importantes
					</p>
					<h1 className="m-serif max-w-[700px] font-semibold text-[38px] leading-[1.06] tracking-[-0.02em] lg:text-[52px] lg:leading-[1.04]">
						<span className="lg:hidden">
							Crea una wishlist{" "}
							<span className="text-[#D7F09E] italic">hermosa</span> para tus
							momentos.
						</span>
						<span className="hidden lg:inline">
							Crea una wishlist{" "}
							<span className="text-[#D7F09E] italic">hermosa</span> para tus
							momentos especiales.
						</span>
					</h1>
					<p className="mt-4 max-w-[480px] text-[15px] text-white/[.82] leading-[1.6] lg:text-[16px] lg:leading-[1.62]">
						<span className="lg:hidden">
							Agrega regalos de cualquier tienda, personaliza tu página y
							compártela por enlace, WhatsApp o QR.
						</span>
						<span className="hidden lg:inline">
							Agrega regalos de cualquier tienda, comparte por enlace, WhatsApp
							o QR, y deja que tus invitados marquen lo que compran.
						</span>
					</p>
					<div className="mt-8 flex flex-wrap items-center gap-3 lg:mt-8">
						<Link
							className="rounded-full bg-[var(--mlime)] px-5 py-3 font-semibold text-[#1B3A12] text-[14px] shadow-[0_8px_22px_rgba(140,200,60,0.4)] transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-4 lg:px-[26px] lg:py-[14px] lg:text-[15px]"
							data-glow
							href="/create"
						>
							Crear mi wishlist →
						</Link>
						<a
							className="rounded-full border border-white/[.42] bg-white/[.14] px-5 py-3 font-semibold text-[14px] text-white transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-4 lg:px-[26px] lg:py-[14px] lg:text-[15px]"
							href="#ejemplo"
						>
							Ver ejemplo
						</a>
					</div>
					<HeroExampleRail />
				</div>
			</div>
		</section>
	);
}
