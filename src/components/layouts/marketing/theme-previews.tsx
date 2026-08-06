"use client";

import { useState } from "react";

import { DEFAULT_THEME_ID, getAllThemes } from "@/config/public-themes";

import { MarketingContainer } from "./marketing-container";

function mixWithWhite(hex: string, whiteAmount: number) {
	const channels = hex
		.match(/[a-f\d]{2}/gi)
		?.map((channel) => Number.parseInt(channel, 16));
	if (channels?.length !== 3) return hex;

	return `rgb(${channels
		.map((channel) => Math.round(channel + (255 - channel) * whiteAmount))
		.join(" ")})`;
}

export function ThemePreviews() {
	const themes = getAllThemes();
	const [selectedThemeId, setSelectedThemeId] = useState(DEFAULT_THEME_ID);
	const selectedTheme =
		themes.find((theme) => theme.id === selectedThemeId) ?? themes[0];
	if (!selectedTheme) return null;

	const previewPrimary = mixWithWhite(selectedTheme.preview.primary, 0.12);

	return (
		<section
			className="border-[var(--mline)] border-t bg-[#E8F5DC] px-6 py-16 sm:px-10 lg:px-11 lg:py-16"
			id="temas"
		>
			<MarketingContainer className="text-center">
				<div className="m-eyebrow mb-5">Temas</div>
				<h2 className="m-serif font-semibold text-[34px] leading-[1.1] sm:text-[40px]">
					{themes.length} estilos, infinitas ocasiones
				</h2>

				<fieldset className="mx-auto mt-8 flex max-w-[1050px] flex-wrap justify-center gap-2">
					<legend className="sr-only">Elegir un tema</legend>
					{themes.map((theme) => {
						const isSelected = theme.id === selectedTheme.id;

						return (
							<button
								aria-pressed={isSelected}
								className="rounded-full border px-[18px] py-[9px] font-semibold text-[12px] transition-colors focus-visible:outline-2 focus-visible:outline-[var(--mink)] focus-visible:outline-offset-2 motion-reduce:transition-none sm:text-[13px]"
								key={theme.id}
								onClick={() => setSelectedThemeId(theme.id)}
								style={
									isSelected
										? {
												background: theme.vars["--foreground"],
												borderColor: theme.vars["--foreground"],
												color: theme.vars["--background"],
											}
										: {
												background: "rgba(255,255,255,.84)",
												borderColor: "rgba(255,255,255,.84)",
												color: "var(--mmut)",
											}
								}
								type="button"
							>
								{theme.label}
							</button>
						);
					})}
				</fieldset>

				<article
					className="mx-auto mt-7 max-w-[520px] overflow-hidden rounded-[22px] border shadow-[0_20px_50px_rgba(20,40,20,0.10)]"
					style={{
						background: selectedTheme.vars["--background"],
						borderColor: selectedTheme.vars["--border"],
						color: selectedTheme.vars["--foreground"],
					}}
				>
					<div
						className="h-[150px]"
						style={{
							background: `linear-gradient(160deg,${previewPrimary},${selectedTheme.preview.background})`,
						}}
					/>
					<div className="px-7 pt-6 pb-6 text-left">
						<div
							className="m-eyebrow mb-2 text-[10px]"
							data-testid="theme-preview-name"
							style={{
								color: mixWithWhite(selectedTheme.vars["--foreground"], 0.36),
							}}
						>
							{selectedTheme.label}
						</div>
						<h3 className="m-serif font-semibold text-[22px] leading-none">
							Vista previa en vivo
						</h3>
						<div className="mt-4 grid grid-cols-3 gap-[10px]">
							{[0, 1, 2].map((index) => (
								<div
									className="h-16 rounded-[18px] border bg-white"
									key={index}
									style={{ borderColor: selectedTheme.vars["--border"] }}
								/>
							))}
						</div>
					</div>
				</article>
			</MarketingContainer>
		</section>
	);
}
