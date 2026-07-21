const STORES_DESKTOP = [
	"amazon",
	"liverpool",
	"mercado libre",
	"coppel",
	"sears",
	"etsy",
	"palacio de hierro",
	"ripley",
];

// Mobile canvas frame drops "palacio de hierro" from the strip.
const STORES_MOBILE = STORES_DESKTOP.filter((s) => s !== "palacio de hierro");

function MarqueeTrack({ stores }: { stores: string[] }) {
	// Track is rendered twice so the GSAP -50% translate loops seamlessly.
	const track = [...stores, ...stores];

	return (
		<div className="m-marquee-mask">
			<div className="m-marquee-track" data-marquee>
				{track.map((s, i) => (
					<div
						className="m-ph h-[46px] w-[120px] rounded-[10px] bg-[#D4EEC6]"
						// biome-ignore lint/suspicious/noArrayIndexKey: duplicated static marquee track
						key={`${s}-${i}`}
					>
						<span className="m-ph-lbl">{s}</span>
					</div>
				))}
			</div>
		</div>
	);
}

export function PartnersMarquee() {
	return (
		<section className="overflow-hidden border-[var(--mline)] border-t bg-[#F0FAE8] px-11 py-[52px] text-center">
			<div data-reveal>
				<div className="m-eyebrow mb-2">Tiendas aliadas</div>
				<h2 className="m-serif mt-[10px] mb-[26px] font-semibold text-[30px] lg:hidden">
					Agrega de donde quieras
				</h2>
				<h2 className="m-serif mt-[10px] mb-[26px] hidden font-semibold text-[30px] lg:block">
					Agrega regalos de donde quieras
				</h2>
			</div>
			<div className="lg:hidden">
				<MarqueeTrack stores={STORES_MOBILE} />
			</div>
			<div className="hidden lg:block">
				<MarqueeTrack stores={STORES_DESKTOP} />
			</div>
			<p className="mt-5 text-[14px] text-[var(--mmut)]">
				Y de cualquier tienda con enlace — funciona en todo el mundo.
			</p>
		</section>
	);
}
