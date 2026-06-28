const THEMES = [
	{ label: "Dulce Rosa", grad: "linear-gradient(135deg,#FBF0F2,#E2A0B3)" },
	{ label: "Cielo Suave", grad: "linear-gradient(135deg,#EEF5FB,#8FBEE0)" },
	{ label: "Cielo Rosa", grad: "linear-gradient(135deg,#FBF1F4,#E6A6BC)" },
	{ label: "Jardín Verde", grad: "linear-gradient(135deg,#EEF4EC,#9CC4A0)" },
	{ label: "Crema Elegante", grad: "linear-gradient(135deg,#F7F2EA,#BFA06B)" },
	{ label: "Lavanda Fiesta", grad: "linear-gradient(135deg,#F3EFFA,#B79CE0)" },
	{ label: "Clásico Minimal", grad: "linear-gradient(135deg,#FAFAF8,#2A2A28)" },
];

export function ThemePreviews() {
	return (
		<section
			className="border-[var(--mline)] border-t bg-[#E8F5DC] px-11 py-16"
			id="temas"
		>
			<div className="mb-9 text-center" data-reveal>
				<div className="m-eyebrow mb-2">Temas</div>
				<h2 className="m-serif font-semibold text-[38px]">
					Siete estilos, infinitas ocasiones
				</h2>
			</div>
			<div
				className="mx-auto grid max-w-[1152px] grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7"
				data-reveal-stagger
			>
				{THEMES.map((t) => (
					<div
						className="card-lift cursor-pointer pb-[6px] text-center"
						key={t.label}
					>
						<div
							className="h-[68px] rounded-[14px]"
							style={{ background: t.grad }}
						/>
						<div className="mt-2 font-semibold text-[11px] text-[var(--mink)]">
							{t.label}
						</div>
					</div>
				))}
			</div>
		</section>
	);
}
