const DEFAULT_STEPS = [
	{
		number: "1",
		title: "Elige un regalo",
		description: "Explora la lista y elige el regalo que quieres dar.",
	},
	{
		number: "2",
		title: "Marca como regalado",
		description:
			"Haz clic en el botón y completa el proceso para confirmar tu regalo.",
	},
	{
		number: "3",
		title: "¡Listo!",
		description:
			"El regalo quedará marcado para que nadie más lo compre por duplicado.",
	},
];

type Props = {
	showHowItWorks: boolean;
};

export function HowItWorks({ showHowItWorks }: Props) {
	if (!showHowItWorks) return null;

	return (
		<section className="mx-auto max-w-3xl px-6 py-12">
			<h2
				className="mb-8 text-center font-semibold text-2xl"
				style={{ color: "var(--public-text)" }}
			>
				¿Cómo funciona?
			</h2>
			<div className="grid gap-8 sm:grid-cols-3">
				{DEFAULT_STEPS.map((step) => (
					<div className="text-center" key={step.number}>
						<div
							className="mx-auto mb-4 flex size-10 items-center justify-center rounded-full font-bold text-lg"
							style={{
								backgroundColor: "var(--public-accent)",
								color: "var(--public-bg)",
							}}
						>
							{step.number}
						</div>
						<h3
							className="mb-2 font-semibold"
							style={{ color: "var(--public-text)" }}
						>
							{step.title}
						</h3>
						<p
							className="text-sm"
							style={{ color: "var(--public-text-muted)" }}
						>
							{step.description}
						</p>
					</div>
				))}
			</div>
		</section>
	);
}
