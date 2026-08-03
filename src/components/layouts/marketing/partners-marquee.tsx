import { MarketingContainer } from "./marketing-container";

const STORES = [
	"Amazon",
	"Liverpool",
	"Mercado Libre",
	"Coppel",
	"Sears",
	"Etsy",
	"Palacio de Hierro",
	"Ripley",
];

export function PartnersMarquee() {
	return (
		<section className="border-[var(--mline)] border-t bg-[#F0FAE8] px-6 py-16 text-center sm:px-10 lg:px-11 lg:py-[76px]">
			<MarketingContainer>
				<div className="m-eyebrow mb-3">Tiendas aliadas</div>
				<h2 className="m-serif mx-auto max-w-[520px] font-semibold text-[30px] leading-[1.15] sm:text-[36px]">
					No dependes de una sola tienda
				</h2>
				<p className="mx-auto mt-[14px] max-w-[480px] text-[14px] text-[var(--mmut)] leading-[1.7] sm:text-[15px]">
					Agrega regalos de las tiendas que ya conoces, o de cualquier enlace
					que encuentres en internet. Funciona en todo el mundo.
				</p>
				<div className="mx-auto mt-8 flex max-w-[680px] flex-wrap justify-center gap-[10px]">
					{STORES.map((store) => (
						<div
							className="m-serif rounded-full border border-[var(--mline)] bg-white px-5 py-[11px] font-semibold text-[13px] text-[var(--mink)] sm:text-[14px]"
							key={store}
						>
							{store}
						</div>
					))}
				</div>
			</MarketingContainer>
		</section>
	);
}
