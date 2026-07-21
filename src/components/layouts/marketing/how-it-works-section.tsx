const STEPS = [
	{
		n: "01",
		bg: "#BCE25A",
		fg: "#1B3A12",
		shadow: "0 8px 24px rgba(120,180,80,.4)",
		title: "Elige tu ocasión",
		body: "Baby shower, boda, cumpleaños, nuevo hogar o una lista general.",
	},
	{
		n: "02",
		bg: "#9ECD6E",
		fg: "#173E29",
		shadow: "0 8px 24px rgba(120,180,80,.4)",
		title: "Crea y personaliza",
		body: "Escoge un tema hermoso y ponle tu nombre, fecha y mensaje.",
	},
	{
		n: "03",
		bg: "#7FB069",
		fg: "#fff",
		shadow: "0 8px 24px rgba(120,180,80,.4)",
		title: "Agrega tus regalos",
		body: "Pega el enlace de cualquier tienda; traemos nombre, foto y precio.",
	},
	{
		n: "04",
		bg: "#56A86B",
		fg: "#fff",
		shadow: "0 8px 24px rgba(120,180,80,.4)",
		title: "Comparte tu enlace",
		body: "Por WhatsApp, redes o QR. Tus invitados marcan lo que compran.",
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
				<h2 className="m-serif font-semibold text-[32px] lg:hidden">
					Cuatro pasos
				</h2>
				<h2 className="m-serif hidden font-semibold text-[40px] lg:block">
					Cuatro pasos. Cero complicaciones.
				</h2>
			</div>
			<div
				className="relative mx-auto grid max-w-[1000px] grid-cols-1 md:grid-cols-4"
				data-reveal-stagger
			>
				<div className="absolute top-[48px] right-[12.5%] left-[12.5%] z-0 hidden h-[2px] bg-[linear-gradient(90deg,#BCE25A,#7FB069,#56A86B,#BCE25A)] opacity-50 md:block" />
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
