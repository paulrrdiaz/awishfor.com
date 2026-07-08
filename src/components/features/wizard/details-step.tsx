"use client";

import { format } from "date-fns";
import { useEffect, useRef, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { isValidSlug } from "@/lib/slug";
import { api } from "@/trpc/react";
import { useWizardStore } from "./wizard-provider";

function dateStrToDate(value: string | null): Date | null {
	return value ? new Date(`${value}T00:00:00`) : null;
}

function dateToDateStr(date: Date | null): string | null {
	return date ? format(date, "yyyy-MM-dd") : null;
}

type SlugStatus =
	| "idle"
	| "checking"
	| "available"
	| "taken"
	| "invalid"
	| "error";

function SlugStatusBadge({ status }: { status: SlugStatus }) {
	if (status === "idle" || status === "error") return null;
	const configs = {
		checking: { text: "◌ Verificando…", className: "text-muted-foreground" },
		available: { text: "✓ Disponible", className: "text-primary" },
		taken: { text: "✕ Ya está en uso", className: "text-destructive" },
		invalid: {
			text: "✕ Solo letras, números y guiones",
			className: "text-destructive",
		},
	} as const;
	const cfg = configs[status];
	return (
		<Badge className={cfg.className} variant="secondary">
			{cfg.text}
		</Badge>
	);
}

export function DetailsStep() {
	const draft = useWizardStore((s) => s.draft);
	const slugTouched = useWizardStore((s) => s.slugTouched);
	const copyTouched = useWizardStore((s) => s.copyTouched);
	const setField = useWizardStore((s) => s.setField);
	const regenerateCopy = useWizardStore((s) => s.regenerateCopy);
	const utils = api.useUtils();
	const hasCopyEdits =
		copyTouched.welcomeMessage || copyTouched.thankYouMessage;

	const [slugStatus, setSlugStatus] = useState<SlugStatus>("idle");

	const debouncedCheckSlug = useDebouncedCallback(async (slug: string) => {
		if (!isValidSlug(slug)) {
			setSlugStatus("invalid");
			return;
		}
		setSlugStatus("checking");
		try {
			const result = await utils.wishlist.checkSlugAvailability.fetch({ slug });
			setSlugStatus(result.available ? "available" : "taken");
		} catch (error) {
			console.error("checkSlugAvailability failed", error);
			setSlugStatus("error");
		}
	}, 400);

	useEffect(() => {
		if (!draft.slug) {
			setSlugStatus("idle");
			return;
		}
		debouncedCheckSlug(draft.slug);
	}, [draft.slug, debouncedCheckSlug]);

	const hasPrefilledTitle = useRef(false);
	useEffect(() => {
		if (hasPrefilledTitle.current) return;
		hasPrefilledTitle.current = true;
		if (!draft.title && draft.heroTitle) {
			setField("title", draft.heroTitle);
		}
	}, [draft.title, draft.heroTitle, setField]);

	const isPastDate = draft.eventDate
		? new Date(`${draft.eventDate}T00:00:00`) <
			new Date(new Date().toDateString())
		: false;

	return (
		<div className="mx-auto w-full max-w-2xl lg:flex lg:h-full lg:max-w-none">
			<div className="lg:w-[520px] lg:shrink-0 lg:overflow-y-auto lg:border-border lg:border-r lg:px-10 lg:py-9">
				<p className="mb-2 font-medium text-muted-foreground text-xs uppercase tracking-wide">
					Paso 2 de 5
				</p>
				<h1 className="mb-2 text-center font-semibold text-2xl text-foreground lg:text-left lg:font-serif lg:text-3xl">
					Cuéntanos del evento
				</h1>
				<p className="mb-8 text-center text-muted-foreground text-sm lg:text-left">
					Cuéntanos sobre tu ocasión
				</p>

				<FieldGroup>
					<Field>
						<FieldLabel htmlFor="title">
							Título <span className="text-destructive">*</span>
						</FieldLabel>
						<Input
							className="min-h-11"
							id="title"
							onChange={(e) => setField("title", e.target.value)}
							placeholder="Ej. Baby shower de María"
							type="text"
							value={draft.title}
						/>
						<FieldDescription className="text-xs">
							Uso interno: así identificas esta lista en tu panel. No se muestra
							a tus invitados.
						</FieldDescription>
					</Field>

					<Field>
						<FieldLabel htmlFor="displayName">Nombre para mostrar</FieldLabel>
						<Input
							className="min-h-11"
							id="displayName"
							onChange={(e) => setField("displayName", e.target.value)}
							placeholder="Ej. María García"
							type="text"
							value={draft.displayName}
						/>
						<FieldDescription className="text-xs">
							Nombre que aparecerá en tu lista pública
						</FieldDescription>
					</Field>

					<Field>
						<FieldLabel htmlFor="slug">URL de tu lista</FieldLabel>
						<div className="flex items-center gap-2 rounded-lg border border-input bg-background px-3 focus-within:ring-3 focus-within:ring-ring/50">
							<span className="shrink-0 text-muted-foreground text-sm">
								awishfor.com/w/
							</span>
							<Input
								className="min-h-11 min-w-0 flex-1 border-0 px-0 shadow-none focus-visible:ring-0"
								id="slug"
								onChange={(e) => setField("slug", e.target.value)}
								placeholder="mi-lista"
								type="text"
								value={draft.slug}
							/>
						</div>

						<div className="flex items-center gap-2">
							{!slugTouched && draft.title && (
								<FieldDescription className="!mt-0 text-xs">
									Generado automáticamente desde el título
								</FieldDescription>
							)}
							<SlugStatusBadge status={slugStatus} />
						</div>
						{slugStatus === "error" && (
							<FieldError>
								No pudimos verificar la disponibilidad del slug. Intenta de
								nuevo.
							</FieldError>
						)}
					</Field>

					<Field>
						<FieldLabel htmlFor="eventDateTime">
							Fecha y hora del evento{" "}
							<span className="font-normal text-muted-foreground">
								(opcional)
							</span>
						</FieldLabel>
						<DateTimePicker
							date={dateStrToDate(draft.eventDate)}
							id="eventDateTime"
							onDateChange={(date) =>
								setField("eventDate", dateToDateStr(date))
							}
							onTimeChange={(time) => setField("eventTime", time)}
							time={draft.eventTime}
						/>
						{isPastDate && (
							<p className="mt-2 rounded-lg border border-[#F0DBA8] bg-[#FBF1DC] px-3 py-2 text-[#8A6512] text-sm">
								Esta fecha ya pasó. Puedes continuar, pero el contador mostrará
								un mensaje de cierre.
							</p>
						)}
					</Field>

					<Field>
						<FieldLabel htmlFor="eventLocation">
							Lugar del evento{" "}
							<span className="font-normal text-muted-foreground">
								(opcional)
							</span>
						</FieldLabel>
						<Input
							className="min-h-11"
							id="eventLocation"
							onChange={(e) => setField("eventLocation", e.target.value)}
							placeholder="Ej. Salón Los Jardines, Lima"
							type="text"
							value={draft.eventLocation}
						/>
					</Field>

					<Field>
						<FieldLabel htmlFor="dressCode">
							Código de vestimenta{" "}
							<span className="font-normal text-muted-foreground">
								(opcional)
							</span>
						</FieldLabel>
						<Input
							className="min-h-11"
							id="dressCode"
							onChange={(e) => setField("dressCode", e.target.value)}
							placeholder="Ej. Formal, tonos pastel"
							type="text"
							value={draft.dressCode}
						/>
					</Field>

					<Field>
						<div className="flex items-center justify-between gap-2">
							<FieldLabel htmlFor="welcomeMessage">
								Mensaje de bienvenida
							</FieldLabel>
							{hasCopyEdits && (
								<Button
									className="h-auto p-0 text-xs"
									onClick={regenerateCopy}
									type="button"
									variant="link"
								>
									Restablecer sugerencias
								</Button>
							)}
						</div>
						<Textarea
							id="welcomeMessage"
							onChange={(e) => setField("welcomeMessage", e.target.value)}
							placeholder="Escribe un mensaje para tus invitados"
							value={draft.welcomeMessage}
						/>
					</Field>

					<Field>
						<FieldLabel htmlFor="thankYouMessage">
							Mensaje de agradecimiento
						</FieldLabel>
						<Textarea
							id="thankYouMessage"
							onChange={(e) => setField("thankYouMessage", e.target.value)}
							placeholder="Escribe un mensaje de agradecimiento"
							value={draft.thankYouMessage}
						/>
						<FieldDescription className="text-xs">
							Se muestra después de que un invitado reserva un regalo
						</FieldDescription>
					</Field>
				</FieldGroup>
			</div>

			<div className="hidden flex-1 flex-col justify-center bg-background px-10 py-9 lg:flex">
				<p className="mb-4 font-medium text-muted-foreground text-xs uppercase tracking-wide">
					Vista previa del encabezado
				</p>
				<div className="rounded-[22px] border border-border bg-card p-8 shadow-sm">
					<p className="text-muted-foreground text-xs uppercase tracking-wide">
						{draft.eventDate || "Fecha por definir"}
					</p>
					<h2 className="mt-3 font-serif text-4xl text-foreground">
						{draft.heroTitle || draft.title || "Tu wishlist especial"}
					</h2>
					<p className="mt-4 text-muted-foreground text-sm">
						{draft.displayName
							? `Anfitrión: ${draft.displayName}`
							: "Agrega el nombre que verán tus invitados"}
					</p>
					<div className="mt-6 inline-flex rounded-full bg-primary px-4 py-2 font-medium text-primary-foreground text-sm">
						{draft.eventDate ? "Cuenta regresiva activa" : "Sin fecha aún"}
					</div>
				</div>
			</div>
		</div>
	);
}
