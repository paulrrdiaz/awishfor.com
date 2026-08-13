"use client";

import { MotifShape } from "@/components/shared/motif/motif-shape";
import {
	getMotifsForEventType,
	isMotifGatedEventType,
	type MotifPalette,
	type MotifPreset,
	type MotifTreatment,
	resolveMotif,
	resolveMotifPalette,
	resolveMotifTreatment,
} from "@/config/motifs";
import { resolveTheme } from "@/config/public-themes";
import type { EventType } from "@/generated/prisma/enums";
import { cn } from "@/lib/utils";

type Props = {
	eventType: EventType;
	themeId: string | null;
	motifId: string | null;
	motifTreatment: string | null;
	motifPalette: string | null;
	onSelectMotif: (id: string | null) => void;
	onSelectTreatment: (treatment: MotifTreatment) => void;
	onSelectPalette: (palette: MotifPalette) => void;
};

const TREATMENT_OPTIONS: { id: MotifTreatment; label: string }[] = [
	{ id: "scene", label: "Escena" },
	{ id: "band", label: "Banda" },
];

const PALETTE_OPTIONS: { id: MotifPalette; label: string }[] = [
	{ id: "fixed", label: "Colores del motivo" },
	{ id: "themed", label: "Colores del tema" },
];

function previewColors(
	motif: MotifPreset,
	palette: MotifPalette,
	themeId: string | null,
) {
	if (palette === "fixed") {
		return motif.colors;
	}
	const theme = resolveTheme(themeId);
	return {
		m1: theme.vars["--primary"],
		m2: theme.vars["--accent"],
		m3: theme.vars["--foreground"],
	};
}

function MotifThumb({
	motif,
	treatment,
	palette,
	themeId,
}: {
	motif: MotifPreset;
	treatment: MotifTreatment;
	palette: MotifPalette;
	themeId: string | null;
}) {
	const theme = resolveTheme(themeId);
	const colors = previewColors(motif, palette, themeId);
	const isBand = treatment === "band";

	return (
		<div
			className="flex h-16 w-full items-center justify-center overflow-hidden rounded-md"
			style={{
				background: isBand ? theme.vars["--primary"] : theme.vars["--card"],
			}}
		>
			<MotifShape
				colors={colors}
				scale={0.9}
				shape={motif.shapes[0]}
				style={isBand ? { "--motif-m3-inverted": motif.m3Inverted } : undefined}
				surface={isBand ? "primary" : "base"}
			/>
		</div>
	);
}

function NoMotifThumb() {
	return (
		<div className="flex h-16 w-full items-center justify-center rounded-md bg-muted">
			<span className="text-muted-foreground text-xs">Sin motivo</span>
		</div>
	);
}

/**
 * Gated to `baby_shower`/`birthday`, mirrors `MessageVariantPicker`'s inline
 * grid pattern. Renders nothing outside the gate. "Sin motivo" is always the
 * first option and is selected whenever `motifId` is null or unknown.
 */
export function MotifPicker({
	eventType,
	themeId,
	motifId,
	motifTreatment,
	motifPalette,
	onSelectMotif,
	onSelectTreatment,
	onSelectPalette,
}: Props) {
	if (!isMotifGatedEventType(eventType)) {
		return null;
	}

	const options = getMotifsForEventType(eventType);
	const selectedMotif = resolveMotif(motifId);
	const treatment = resolveMotifTreatment(motifTreatment);
	const palette = resolveMotifPalette(motifPalette);
	const showSuggestion =
		selectedMotif !== null &&
		themeId !== null &&
		selectedMotif.suggestedThemeId !== themeId;
	const suggestedTheme = selectedMotif
		? resolveTheme(selectedMotif.suggestedThemeId)
		: null;

	return (
		<div className="space-y-3">
			<div className="grid grid-cols-3 gap-2">
				<button
					aria-pressed={selectedMotif === null}
					className={cn(
						"rounded-xl border-2 bg-card p-2 text-left transition-all hover:-translate-y-0.5 hover:shadow-sm",
						selectedMotif === null
							? "border-primary shadow-sm ring-1 ring-primary/20"
							: "border-border",
					)}
					onClick={() => onSelectMotif(null)}
					type="button"
				>
					<NoMotifThumb />
					<span className="mt-1.5 block font-medium text-foreground text-xs">
						Sin motivo
					</span>
				</button>
				{options.map((motif) => {
					const isSelected = selectedMotif?.id === motif.id;
					return (
						<button
							aria-pressed={isSelected}
							className={cn(
								"rounded-xl border-2 bg-card p-2 text-left transition-all hover:-translate-y-0.5 hover:shadow-sm",
								isSelected
									? "border-primary shadow-sm ring-1 ring-primary/20"
									: "border-border",
							)}
							key={motif.id}
							onClick={() => onSelectMotif(motif.id)}
							type="button"
						>
							<MotifThumb
								motif={motif}
								palette={palette}
								themeId={themeId}
								treatment={treatment}
							/>
							<span className="mt-1.5 block font-medium text-foreground text-xs">
								{motif.label}
							</span>
						</button>
					);
				})}
			</div>

			{selectedMotif && (
				<div className="space-y-3">
					<div>
						<p className="mb-1.5 font-medium text-foreground text-xs">
							Tratamiento
						</p>
						<div className="grid grid-cols-2 gap-2">
							{TREATMENT_OPTIONS.map((option) => (
								<button
									aria-pressed={treatment === option.id}
									className={cn(
										"rounded-lg border-2 px-3 py-1.5 font-medium text-xs transition-colors",
										treatment === option.id
											? "border-primary bg-primary/5 text-foreground"
											: "border-border text-muted-foreground",
									)}
									key={option.id}
									onClick={() => onSelectTreatment(option.id)}
									type="button"
								>
									{option.label}
								</button>
							))}
						</div>
					</div>

					<div>
						<p className="mb-1.5 font-medium text-foreground text-xs">Paleta</p>
						<div className="grid grid-cols-2 gap-2">
							{PALETTE_OPTIONS.map((option) => (
								<button
									aria-pressed={palette === option.id}
									className={cn(
										"rounded-lg border-2 px-3 py-1.5 font-medium text-xs transition-colors",
										palette === option.id
											? "border-primary bg-primary/5 text-foreground"
											: "border-border text-muted-foreground",
									)}
									key={option.id}
									onClick={() => onSelectPalette(option.id)}
									type="button"
								>
									{option.label}
								</button>
							))}
						</div>
					</div>

					{showSuggestion && suggestedTheme && (
						<p className="text-muted-foreground text-xs">
							Este motivo combina mejor con el tema{" "}
							<span className="font-medium text-foreground">
								{suggestedTheme.label}
							</span>
							. Si prefieres mantener tu tema actual, prueba la paleta "Colores
							del tema".
						</p>
					)}
				</div>
			)}
		</div>
	);
}
