import Image from "next/image";
import Link from "next/link";

import { HeroExampleRail } from "./hero-example-rail";

export function H2bHero() {
	return (
		<section
			className="relative hidden min-h-[680px] w-full overflow-hidden lg:block"
			data-h2b-hero
		>
			<Image
				alt=""
				className="object-cover brightness-[1.2] contrast-[.95] saturate-[1.06]"
				fill
				priority
				sizes="(min-width: 1240px) 1240px, 100vw"
				src="https://images.unsplash.com/photo-1519741497674-611481863552?w=1280&h=560&fit=crop&auto=format"
				unoptimized
			/>
			<div
				aria-hidden
				className="absolute inset-0 bg-[linear-gradient(96deg,rgba(8,26,15,.66)_0%,rgba(8,26,15,.34)_40%,rgba(8,26,15,.02)_70%)]"
			/>
			<div
				aria-hidden
				className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,26,15,.26)_0%,rgba(8,26,15,0)_30%,rgba(8,26,15,.36)_100%)]"
			/>
			<div
				aria-hidden
				className="absolute inset-x-0 top-0 h-[112px] bg-[linear-gradient(180deg,rgba(8,26,15,.46),rgba(8,26,15,0))]"
			/>

			<div className="absolute inset-0 mx-auto max-w-[1240px]">
				<div className="absolute top-[150px] left-[78px] max-w-[700px] text-white">
					<p className="mb-5 font-mono text-[10.5px] text-white/70 uppercase tracking-[0.16em]">
						Wishlists para momentos importantes
					</p>
					<h1 className="m-serif max-w-[700px] font-semibold text-[52px] leading-[1.04] tracking-[-0.02em]">
						Crea una wishlist{" "}
						<span className="text-[#D7F09E] italic">hermosa</span> para tus
						momentos especiales.
					</h1>
					<p className="mt-4 max-w-[480px] text-[16px] text-white/[.82] leading-[1.62]">
						Agrega regalos de cualquier tienda, comparte por enlace, WhatsApp o
						QR, y deja que tus invitados marquen lo que compran.
					</p>
					<div className="mt-8 flex items-center gap-3">
						<Link
							className="rounded-full bg-[var(--mlime)] px-[26px] py-[14px] font-semibold text-[#1B3A12] text-[15px] shadow-[0_8px_22px_rgba(140,200,60,0.4)] transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-4"
							data-glow
							href="/create"
						>
							Crear mi wishlist →
						</Link>
						<a
							className="rounded-full border border-white/[.42] bg-white/[.14] px-[26px] py-[14px] font-semibold text-[15px] text-white transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-4"
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
