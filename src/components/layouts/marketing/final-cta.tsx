/* biome-ignore-all lint/performance/noImgElement: the band photograph is a local, optimized, lazily loaded asset. */
export function FinalCta() {
	return (
		<section className="relative min-h-[280px] overflow-hidden text-center">
			<picture>
				<source
					media="(min-width: 1024px)"
					srcSet="/assets/hero/final-cta-band.jpg"
				/>
				<img
					alt=""
					className="absolute inset-0 h-full w-full object-cover"
					decoding="async"
					height={1066}
					loading="lazy"
					src="/assets/hero/final-cta-band-mobile.jpg"
					width={640}
				/>
			</picture>
			<div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,30,20,0.55),rgba(10,30,20,0.86))]" />
			<div className="relative px-11 py-[110px]">
				<h2 className="m-serif mx-auto mb-[18px] max-w-[680px] font-semibold text-[52px] text-white leading-[1.07]">
					Tu próximo momento especial merece una página hermosa.
				</h2>
				<p className="mb-[34px] text-[17px] text-white/80 leading-[1.6]">
					Crea tu wishlist en minutos. Es gratis y se siente bonito. 🌿
				</p>
				<a
					className="!px-10 !py-[17px] !text-[16px] m-btn m-btn-glow m-btn-lime"
					href="/create"
				>
					Crear mi wishlist →
				</a>
			</div>
		</section>
	);
}
