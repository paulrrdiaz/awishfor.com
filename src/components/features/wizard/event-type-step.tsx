"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { EVENT_TYPE_PRESETS } from "@/config/event-type-presets";
import { resolveTheme } from "@/config/public-themes";
import { EventType } from "@/generated/prisma/enums";
import { cn } from "@/lib/utils";
import { useWizardStore } from "./wizard-provider";

const EVENT_TYPES = Object.values(EventType) as EventType[];

const EVENT_TYPE_ICONS: Record<EventType, string> = {
	baby_shower: "🍼",
	birthday: "🎂",
	wedding: "💍",
	housewarming: "🏠",
	general: "🎁",
};

export function EventTypeStep() {
	const selectedType = useWizardStore((s) => s.draft.eventType);
	const setEventType = useWizardStore((s) => s.setEventType);
	const heroTitle = useWizardStore((s) => s.draft.heroTitle);
	const heroTitleTouched = useWizardStore((s) => s.copyTouched.heroTitle);
	const setField = useWizardStore((s) => s.setField);
	const regenerateCopy = useWizardStore((s) => s.regenerateCopy);
	const searchParams = useSearchParams();

	useEffect(() => {
		const typeParam = searchParams.get("type");
		if (
			!selectedType &&
			typeParam &&
			EVENT_TYPES.includes(typeParam as EventType)
		) {
			setEventType(typeParam as EventType);
		}
	}, [searchParams, selectedType, setEventType]);

	return (
		<div className="mx-auto w-full max-w-2xl lg:flex lg:h-full lg:max-w-none">
			<div className="lg:w-[540px] lg:shrink-0 lg:border-border lg:border-r lg:px-10 lg:py-9">
				<p className="mb-2 font-medium text-muted-foreground text-xs uppercase tracking-wide">
					Paso 1 de 5
				</p>
				<h1 className="mb-2 text-center font-semibold text-2xl text-foreground lg:text-left lg:font-serif lg:text-3xl">
					¿Qué vas a celebrar?
				</h1>
				<p className="mb-8 text-center text-muted-foreground text-sm lg:text-left">
					Elige el tipo de evento para tu wishlist
				</p>

				<div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
					{EVENT_TYPES.map((type) => {
						const preset = EVENT_TYPE_PRESETS[type];
						const theme = resolveTheme(preset.defaultThemeId);
						const isSelected = selectedType === type;

						return (
							<Button
								className={cn(
									"flex h-auto min-h-28 flex-col items-center justify-center gap-2 whitespace-normal rounded-xl border-2 bg-card px-4 py-5 text-center text-card-foreground transition-all hover:border-primary/50 hover:bg-accent",
									isSelected &&
										"border-primary bg-card text-card-foreground shadow-[0_0_0_2px_var(--primary)] hover:border-primary hover:bg-card",
								)}
								key={type}
								onClick={() => setEventType(type)}
								type="button"
								variant="outline"
							>
								<span aria-hidden className="text-2xl">
									{EVENT_TYPE_ICONS[type]}
								</span>
								<span className="font-medium text-sm">{preset.label}</span>
								<span className="hidden text-[11px] text-muted-foreground leading-tight lg:block">
									{theme.label}
								</span>
							</Button>
						);
					})}
				</div>

				{selectedType && (
					<Field className="mt-6">
						<div className="flex items-center justify-between gap-2">
							<FieldLabel htmlFor="heroTitle">Título de la wishlist</FieldLabel>
							{heroTitleTouched && (
								<Button
									className="h-auto p-0 text-xs"
									onClick={regenerateCopy}
									type="button"
									variant="link"
								>
									Restablecer sugerencia
								</Button>
							)}
						</div>
						<Input
							className="min-h-11"
							id="heroTitle"
							onChange={(e) => setField("heroTitle", e.target.value)}
							placeholder="Ej. Baby shower de María"
							type="text"
							value={heroTitle}
						/>
						<FieldDescription className="text-xs">
							Encabezado principal de tu página pública. Se sugiere
							automáticamente según la ocasión.
						</FieldDescription>
					</Field>
				)}
			</div>

			<div className="hidden flex-1 flex-col justify-center bg-background px-10 py-9 lg:flex">
				<p className="mb-4 font-medium text-muted-foreground text-xs uppercase tracking-wide">
					Diseño inicial sugerido
				</p>
				<div className="rounded-[18px] border border-border bg-card p-5 shadow-sm">
					<div className="rounded-xl bg-muted/50 p-5">
						<p className="text-muted-foreground text-xs uppercase tracking-wide">
							{selectedType
								? EVENT_TYPE_PRESETS[selectedType].label
								: "Tu ocasión"}
						</p>
						<h2 className="mt-2 font-serif text-2xl text-foreground">
							{heroTitle || "Tu wishlist especial"}
						</h2>
						<p className="mt-3 text-muted-foreground text-sm">
							Un encabezado cálido y listo para personalizar.
						</p>
					</div>
					<div className="mt-4 rounded-xl border border-border p-4">
						<div className="flex items-center justify-between gap-4">
							<div>
								<p className="font-medium text-foreground text-sm">
									Regalo sugerido
								</p>
								<p className="text-muted-foreground text-xs">Tienda · S/ 120</p>
							</div>
							<span className="rounded-full bg-primary px-3 py-1 font-medium text-primary-foreground text-xs">
								Reservar
							</span>
						</div>
					</div>
				</div>
				<p className="mt-4 text-muted-foreground text-sm">
					Podrás ajustar colores, tipografía y portada en el paso 3.
				</p>
			</div>
		</div>
	);
}
