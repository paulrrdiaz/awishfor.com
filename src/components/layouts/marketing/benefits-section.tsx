/* biome-ignore-all lint/performance/noImgElement: card headers are URL-sized and lazy, outside the first fold. */

import { MarketingContainer } from "./marketing-container";

const BENEFITS = [
	{
		icon: "🛍️",
		badgeBg: "#BCE25A",
		photo: "https://images.unsplash.com/photo-1519689680058-324335c77eba",
		title: "Todo en un lugar",
		body: "Regalos de cualquier tienda en una sola página hermosa. Sin límites.",
	},
	{
		icon: "🎁",
		badgeBg: "#7FB069",
		photo: "https://images.unsplash.com/photo-1555252333-9f8e92e65df9",
		title: "Gratis, sin comisiones",
		body: "Crea y comparte sin costo. Tus invitados nunca pagan comisiones.",
	},
	{
		icon: "🔗",
		badgeBg: "#56A86B",
		photo: "https://images.unsplash.com/photo-1519741497674-611481863552",
		title: "Enlace y QR gratis",
		body: "Un enlace único y código QR para WhatsApp o invitaciones físicas.",
	},
	{
		icon: "✨",
		badgeBg: "#F4C84A",
		photo: "https://images.unsplash.com/photo-1592194996308-7b43878e84a6",
		title: "Listas sugeridas",
		body: "¿Sin ideas? Empieza con regalos sugeridos para tu ocasión y ajústalos.",
	},
];

export function BenefitsSection() {
	return (
		<section className="border-[var(--mline)] border-t bg-[#F0FAE8] px-[22px] py-11 lg:px-11 lg:py-[76px]">
			<div className="mx-auto mb-[26px] max-w-[560px] text-center lg:mb-[52px]">
				<div className="m-eyebrow mb-[9px] lg:mb-3">Por qué A Wish For</div>
				<h2 className="m-serif font-semibold text-[27px] leading-[1.1] lg:text-[40px]">
					Todo lo que necesitas,
					<br />
					sin complicaciones
				</h2>
			</div>
			<MarketingContainer className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
				{BENEFITS.map((b) => (
					<div className="card-lift m-card overflow-hidden" key={b.title}>
						<div className="relative h-20 lg:h-[108px]">
							<img
								alt=""
								className="h-full w-full object-cover"
								decoding="async"
								height={220}
								loading="lazy"
								src={`${b.photo}?w=340&h=220&fit=crop&auto=format`}
								width={340}
							/>
							<div
								className="absolute bottom-[-14px] left-3 flex h-9 w-9 items-center justify-center rounded-[11px] text-[16px] shadow-[0_5px_12px_rgba(20,60,20,0.22)] lg:bottom-[-18px] lg:left-[14px] lg:h-11 lg:w-11 lg:rounded-[13px] lg:text-[19px] lg:shadow-[0_6px_16px_rgba(20,60,20,0.22)]"
								style={{ background: b.badgeBg }}
							>
								{b.icon}
							</div>
						</div>
						<div className="px-3.5 pt-5 pb-4 lg:px-5 lg:pt-[26px] lg:pb-[22px]">
							<div className="m-serif mb-[5px] font-semibold text-[14.5px] lg:mb-2 lg:text-[17px]">
								{b.title}
							</div>
							<p className="text-[12px] text-[var(--mmut)] leading-[1.55] lg:text-[13px] lg:leading-[1.65]">
								{b.body}
							</p>
						</div>
					</div>
				))}
			</MarketingContainer>
		</section>
	);
}
