"use client";

import { PublicThemeProvider } from "@/components/layouts/public-wishlist/public-theme-provider";
import { SAMPLE_SEATING_PASS } from "@/components/shared/seating-pass/sample";
import { SeatingPass } from "@/components/shared/seating-pass/seating-pass";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { resolveButtonStyle } from "@/config/public-button-styles";
import { resolveBodyFont, resolveHeadingFont } from "@/config/public-fonts";
import { resolveTheme } from "@/config/public-themes";
import { SEATING_PASS_WINDOW_DAYS } from "@/lib/seating/seating-pass";
import { cn } from "@/lib/utils";
import type { SeatingPassViewModel } from "@/server/mappers/view-models";

export type SeatingPassVariantChoice = "pass" | "ring";

const VARIANT_OPTIONS: {
	id: SeatingPassVariantChoice;
	label: string;
	hint: string;
}[] = [
	{ id: "pass", label: "Pase de mesa", hint: "Boleto con tu mesa en grande" },
	{
		id: "ring",
		label: "Anillo de asientos",
		hint: "Un anillo por mesa con los lugares del grupo",
	},
];

type Props = {
	variant: SeatingPassVariantChoice;
	onVariantChange: (variant: SeatingPassVariantChoice) => void;
	showMates: boolean;
	onShowMatesChange: (value: boolean) => void;
	showMap: boolean;
	onShowMapChange: (value: boolean) => void;
	/** `yyyy-MM-dd` or empty. */
	eventDate: string;
	eventTime: string;
	eventLocation: string;
	themeId: string | null;
	headingFont: string | null;
	bodyFont: string | null;
	buttonStyle: string | null;
};

export function buildPreviewPass({
	eventDate,
	eventTime,
	eventLocation,
	showMates,
	showMap,
}: Pick<
	Props,
	"eventDate" | "eventTime" | "eventLocation" | "showMates" | "showMap"
>): SeatingPassViewModel {
	const location = eventLocation.trim() || SAMPLE_SEATING_PASS.location;
	return {
		...SAMPLE_SEATING_PASS,
		eventDate: eventDate
			? `${eventDate}T00:00:00.000Z`
			: SAMPLE_SEATING_PASS.eventDate,
		eventTime: eventTime || (eventDate ? null : SAMPLE_SEATING_PASS.eventTime),
		location: showMap ? location : null,
		tables: SAMPLE_SEATING_PASS.tables.map((table) => ({
			...table,
			mates: showMates ? table.mates : [],
		})),
	};
}

export function SeatingPassSettings({
	variant,
	onVariantChange,
	showMates,
	onShowMatesChange,
	showMap,
	onShowMapChange,
	eventDate,
	eventTime,
	eventLocation,
	themeId,
	headingFont,
	bodyFont,
	buttonStyle,
}: Props) {
	const pass = buildPreviewPass({
		eventDate,
		eventTime,
		eventLocation,
		showMates,
		showMap,
	});

	return (
		<section className="space-y-5 rounded-2xl border bg-card p-5 shadow-sm">
			<div>
				<h2 className="font-medium text-base">Mesa asignada</h2>
				<p className="mt-1 text-muted-foreground text-xs">
					Tus invitados confirmados verán su mesa en su enlace personal desde{" "}
					{SEATING_PASS_WINDOW_DAYS} días antes del evento.
				</p>
			</div>

			<fieldset className="grid gap-3 sm:grid-cols-2">
				<legend className="sr-only">Estilo de la mesa asignada</legend>
				{VARIANT_OPTIONS.map((option) => (
					<label
						className={cn(
							"flex cursor-pointer flex-col gap-1 rounded-xl border p-3 text-sm",
							variant === option.id
								? "border-primary ring-1 ring-primary"
								: "border-border",
						)}
						key={option.id}
					>
						<span className="flex items-center gap-2 font-medium">
							<input
								checked={variant === option.id}
								name="seatingPassVariant"
								onChange={() => onVariantChange(option.id)}
								type="radio"
								value={option.id}
							/>
							{option.label}
						</span>
						<span className="text-muted-foreground text-xs">{option.hint}</span>
					</label>
				))}
			</fieldset>

			<div className="flex items-center gap-3">
				<Switch
					checked={showMates}
					id="seatingPassShowMates"
					onCheckedChange={(next) => onShowMatesChange(Boolean(next))}
				/>
				<div>
					<Label className="cursor-pointer" htmlFor="seatingPassShowMates">
						Mostrar compañeros de mesa
					</Label>
					<p className="text-muted-foreground text-xs">
						Nombre y la inicial del apellido de otros invitados confirmados en
						la misma mesa
					</p>
				</div>
			</div>

			<div className="flex items-center gap-3">
				<Switch
					checked={showMap}
					id="seatingPassShowMap"
					onCheckedChange={(next) => onShowMapChange(Boolean(next))}
				/>
				<div>
					<Label className="cursor-pointer" htmlFor="seatingPassShowMap">
						Mostrar cómo llegar
					</Label>
					<p className="text-muted-foreground text-xs">
						Enlaces a Google Maps y Waze con el lugar del evento
					</p>
				</div>
			</div>

			<div>
				<p className="mb-2 font-mono text-[10px] text-muted-foreground uppercase tracking-[0.16em]">
					Vista previa
				</p>
				<PublicThemeProvider
					bodyFont={resolveBodyFont(bodyFont)}
					buttonStyle={resolveButtonStyle(buttonStyle)}
					className="min-h-0 rounded-xl"
					headingFont={resolveHeadingFont(headingFont)}
					theme={resolveTheme(themeId)}
				>
					<SeatingPass className="py-6" pass={pass} variant={variant} />
				</PublicThemeProvider>
			</div>
		</section>
	);
}
