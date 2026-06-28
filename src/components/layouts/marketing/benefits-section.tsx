const BENEFITS = [
	{
		icon: "🛍️",
		border: "#BCE25A",
		grad: "linear-gradient(135deg,#DFFAC4,#C5ECA0)",
		title: "Todo en un lugar",
		body: "Regalos de cualquier tienda en una sola página hermosa.",
	},
	{
		icon: "🎁",
		border: "#7FB069",
		grad: "linear-gradient(135deg,#E2F7D4,#C0E5A0)",
		title: "Gratis, sin comisiones",
		body: "Crea y comparte sin costo. Tus invitados nunca pagan comisiones.",
	},
	{
		icon: "🔗",
		border: "#56A86B",
		grad: "linear-gradient(135deg,#D8F5DF,#AADFC0)",
		title: "Enlace y QR gratis",
		body: "Enlace único y código QR para WhatsApp o invitaciones físicas.",
	},
	{
		icon: "✨",
		border: "#9CC4A0",
		grad: "linear-gradient(135deg,#E6F7EA,#C2E5CA)",
		title: "Listas sugeridas",
		body: "Empieza con una lista de esenciales curada para tu ocasión.",
	},
];

export function BenefitsSection() {
	return (
		<section className="border-[var(--mline)] border-t bg-white px-11 py-[76px]">
			<div className="mx-auto mb-[52px] max-w-[560px] text-center" data-reveal>
				<div className="m-eyebrow mb-3">Por qué A Wish For</div>
				<h2 className="m-serif font-semibold text-[40px] leading-[1.1]">
					Todo lo que necesitas,
					<br />
					sin complicaciones
				</h2>
			</div>
			<div
				className="mx-auto grid max-w-[1152px] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
				data-reveal-stagger
			>
				{BENEFITS.map((b) => (
					<div
						className="card-lift m-card p-[26px]"
						key={b.title}
						style={{ borderTop: `3px solid ${b.border}` }}
					>
						<div
							className="mb-4 flex h-12 w-12 items-center justify-center rounded-[14px] text-[22px]"
							style={{ background: b.grad }}
						>
							{b.icon}
						</div>
						<div className="m-serif mb-2 font-semibold text-[17px]">
							{b.title}
						</div>
						<p className="text-[13px] text-[var(--mmut)] leading-[1.65]">
							{b.body}
						</p>
					</div>
				))}
			</div>
		</section>
	);
}
