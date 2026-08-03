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
		<section className="border-[var(--mline)] border-t bg-[#F0FAE8] px-11 py-[76px]">
			<div className="mx-auto mb-[52px] max-w-[560px] text-center">
				<div className="m-eyebrow mb-3">Por qué A Wish For</div>
				<h2 className="m-serif font-semibold text-[40px] leading-[1.1]">
					Todo lo que necesitas,
					<br />
					sin complicaciones
				</h2>
			</div>
			<MarketingContainer className="grid grid-cols-2 gap-4 lg:grid-cols-4">
				{BENEFITS.map((b) => (
					<div className="card-lift m-card overflow-hidden" key={b.title}>
						<div className="relative h-[108px]">
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
								className="absolute bottom-[-18px] left-[14px] flex h-11 w-11 items-center justify-center rounded-[13px] text-[19px] shadow-[0_6px_16px_rgba(20,60,20,0.22)]"
								style={{ background: b.badgeBg }}
							>
								{b.icon}
							</div>
						</div>
						<div className="px-5 pt-[26px] pb-[22px]">
							<div className="m-serif mb-2 font-semibold text-[17px]">
								{b.title}
							</div>
							<p className="text-[13px] text-[var(--mmut)] leading-[1.65]">
								{b.body}
							</p>
						</div>
					</div>
				))}
			</MarketingContainer>
		</section>
	);
}
