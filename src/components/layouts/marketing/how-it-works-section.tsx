const STEPS = [
	{
		n: "01",
		bg: "#BCE25A",
		fg: "#1B3A12",
		shadow: "0 8px 28px rgba(188,226,90,.5)",
		title: "Crea y personaliza",
		body: "Elige un tema hermoso, agrega tus regalos de cualquier tienda y ponle tu toque personal.",
	},
	{
		n: "02",
		bg: "#7FB069",
		fg: "#fff",
		shadow: "0 8px 28px rgba(127,176,105,.45)",
		title: "Comparte el enlace",
		body: "Por WhatsApp, redes sociales o con un QR en tus invitaciones físicas.",
	},
	{
		n: "03",
		bg: "#56A86B",
		fg: "#fff",
		shadow: "0 8px 28px rgba(86,168,107,.45)",
		title: "Recibe sin duplicados",
		body: "Tus invitados marcan lo que compran. Nadie regala lo mismo dos veces.",
	},
];

export function HowItWorksSection() {
	return (
		<section
			className="border-[var(--mline)] border-t bg-[#F0FAE8] px-11 py-[76px]"
			id="como-funciona"
		>
			<div className="mb-[56px] text-center" data-reveal>
				<div className="m-eyebrow mb-3">Cómo funciona</div>
				<h2 className="m-serif font-semibold text-[40px]">
					Tres pasos. Cero complicaciones.
				</h2>
			</div>
			<div
				className="relative mx-auto grid max-w-[1000px] grid-cols-1 md:grid-cols-3"
				data-reveal-stagger
			>
				<div
					className="absolute top-[48px] right-[16.6%] left-[16.6%] hidden h-[2px] md:block"
					style={{
						background: "linear-gradient(90deg,#BCE25A,#7FB069,#BCE25A)",
						opacity: 0.55,
						zIndex: 0,
					}}
				/>
				{STEPS.map((s) => (
					<div className="relative z-[1] px-6 text-center" key={s.n}>
						<div
							className="mx-auto mb-[22px] flex h-[72px] w-[72px] items-center justify-center rounded-full"
							style={{ background: s.bg, boxShadow: s.shadow }}
						>
							<span
								className="m-serif font-bold text-[26px]"
								style={{ color: s.fg }}
							>
								{s.n}
							</span>
						</div>
						<div className="card-lift m-card p-6 text-left">
							<div className="m-serif mb-2 font-semibold text-[19px]">
								{s.title}
							</div>
							<p className="text-[13.5px] text-[var(--mmut)] leading-[1.65]">
								{s.body}
							</p>
						</div>
					</div>
				))}
			</div>
		</section>
	);
}
