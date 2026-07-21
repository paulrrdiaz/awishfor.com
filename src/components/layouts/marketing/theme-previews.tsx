import { getAllThemes } from "@/config/public-themes";

export function ThemePreviews() {
	const themes = getAllThemes();

	return (
		<section
			className="border-[var(--mline)] border-t bg-[#E8F5DC] px-11 py-16"
			id="temas"
		>
			<div className="mb-9 text-center" data-reveal>
				<div className="m-eyebrow mb-2">Temas</div>
				<h2 className="m-serif font-semibold text-[38px]">
					{themes.length} estilos, infinitas ocasiones
				</h2>
			</div>
			<div
				className="mx-auto grid max-w-[1152px] grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6"
				data-reveal-stagger
			>
				{themes.map((t) => (
					<div
						className="card-lift cursor-pointer pb-[6px] text-center"
						key={t.id}
					>
						<div
							className="h-[68px] rounded-[14px]"
							style={{
								background: `linear-gradient(135deg,${t.preview.background},${t.preview.primary})`,
							}}
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
