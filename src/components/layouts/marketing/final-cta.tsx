/* biome-ignore-all lint/performance/noImgElement: the band photograph is a local, optimized, lazily loaded asset. */
export function FinalCta() {
	return (
		<section className="relative min-h-[220px] overflow-hidden text-center lg:min-h-[280px]">
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
			<div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,30,20,0.55),rgba(10,30,20,0.88))] lg:bg-[linear-gradient(180deg,rgba(10,30,20,0.55),rgba(10,30,20,0.86))]" />
			<div className="relative px-[22px] py-16 lg:px-11 lg:py-[110px]">
				<h2 className="m-serif mx-auto mb-[14px] font-semibold text-[29px] text-white leading-[1.12] lg:mb-[18px] lg:max-w-[680px] lg:text-[52px] lg:leading-[1.07]">
					Tu próximo momento especial merece una página hermosa.
				</h2>
				<p className="mb-[26px] text-[14px] text-white/80 leading-[1.6] lg:mb-[34px] lg:text-[17px]">
					Crea tu wishlist en minutos. Es gratis y se siente bonito. 🌿
				</p>
				<a
					className="!px-10 !py-[15px] !text-[15px] lg:!py-[17px] lg:!text-[16px] m-btn m-btn-glow m-btn-lime w-full lg:w-auto"
					href="/create"
				>
					Crear mi wishlist →
				</a>
			</div>
		</section>
	);
}
