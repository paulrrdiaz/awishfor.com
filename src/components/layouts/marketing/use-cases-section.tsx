const USE_CASES = [
	{
		icon: "🍼",
		label: "Baby Shower",
		grad: "linear-gradient(145deg,#FBF1F4,#fff)",
	},
	{
		icon: "🎂",
		label: "Cumpleaños",
		grad: "linear-gradient(145deg,#F3EFFA,#fff)",
	},
	{ icon: "💍", label: "Boda", grad: "linear-gradient(145deg,#F7F2EA,#fff)" },
	{
		icon: "🏡",
		label: "Nuevo hogar",
		grad: "linear-gradient(145deg,#EEF4EC,#fff)",
	},
	{
		icon: "🎁",
		label: "Wishlist general",
		grad: "linear-gradient(145deg,#F0FAE8,#fff)",
	},
];

export function UseCasesSection() {
	return (
		<section className="border-[var(--mline)] border-t bg-white px-11 py-[76px] text-center">
			<div data-reveal>
				<div className="m-eyebrow mb-3">Para cada celebración</div>
				<h2 className="m-serif mb-11 font-semibold text-[40px]">
					Para cada momento que importa
				</h2>
			</div>
			<div
				className="flex flex-wrap justify-center gap-[14px]"
				data-reveal-stagger
			>
				{USE_CASES.map((u) => (
					<div
						className="card-lift m-card px-[30px] py-[26px] text-center"
						key={u.label}
						style={{ background: u.grad }}
					>
						<div className="mb-[10px] text-[32px]">{u.icon}</div>
						<div className="m-serif font-semibold text-[15px]">{u.label}</div>
					</div>
				))}
			</div>
		</section>
	);
}
