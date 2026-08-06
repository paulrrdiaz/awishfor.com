"use client";

import { format } from "date-fns";
import { useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { PublicThemeProvider } from "@/components/layouts/public-wishlist/public-theme-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { resolveButtonStyle } from "@/config/public-button-styles";
import { resolveBodyFont, resolveHeadingFont } from "@/config/public-fonts";
import { resolveTheme } from "@/config/public-themes";
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

const EYEBROW = "font-mono text-[11px] font-medium uppercase tracking-[0.14em]";

function SlugStatusBadge({ status }: { status: SlugStatus }) {
	if (status === "idle" || status === "error") return null;
	const configs = {
		checking: { text: "Verificando…", variant: "secondary" as const },
		available: { text: "Disponible", variant: "published" as const },
		taken: { text: "No disponible", variant: "destructive" as const },
		invalid: { text: "Formato inválido", variant: "destructive" as const },
	};
	const cfg = configs[status];
	return <Badge variant={cfg.variant}>{cfg.text}</Badge>;
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

	const isPastDate = draft.eventDate
		? new Date(`${draft.eventDate}T00:00:00`) <
			new Date(new Date().toDateString())
		: false;

	return (
		<div className="mx-auto w-full max-w-2xl lg:flex lg:h-full lg:max-w-none">
			<div className="lg:flex lg:w-[460px] lg:shrink-0 lg:flex-col lg:gap-3.5 lg:overflow-y-auto lg:border-border lg:border-r lg:px-8 lg:py-8">
				<div className="mb-6 lg:mb-0">
					<h1 className="mb-2 text-center font-semibold text-2xl text-foreground lg:mb-1 lg:text-left lg:font-serif lg:text-[26px]">
						Cuéntanos del evento
					</h1>
					<p className="text-center text-muted-foreground text-sm lg:text-left lg:text-[13px]">
						Cuéntanos sobre tu ocasión
					</p>
				</div>

				<div className="mb-3.5 rounded-[14px] border border-border bg-card p-[18px] lg:mb-0">
					<div className="mb-3.5 flex items-center justify-between">
						<span className={EYEBROW}>① Identidad</span>
					</div>
					<Field className="gap-0">
						<FieldLabel
							className="mb-[7px] font-semibold text-[13px] text-foreground"
							htmlFor="title"
						>
							Nombre de tu wishlist <span className="text-destructive">*</span>
						</FieldLabel>
						<Input
							className="min-h-11 rounded-[10px] text-[13.5px]"
							id="title"
							onChange={(e) => setField("title", e.target.value)}
							placeholder="Ej. Baby shower de María"
							type="text"
							value={draft.title}
						/>
						<p className="mt-2.5 text-[11.5px] text-muted-foreground leading-relaxed">
							Así la identificas en tu panel y así la verán tus invitados — un
							solo nombre para ambos.
						</p>
					</Field>
				</div>

				<div className="mb-3.5 rounded-[14px] border border-border bg-card p-[18px] lg:mb-0">
					<div className="mb-3.5 flex items-center justify-between">
						<span className={EYEBROW}>② Fecha y lugar</span>
						<span className="text-[11px] text-muted-foreground">opcional</span>
					</div>
					<FieldGroup className="gap-3">
						<Field className="gap-0">
							<FieldLabel
								className="mb-[7px] font-semibold text-[13px] text-foreground"
								htmlFor="eventDateTime"
							>
								Fecha y hora
							</FieldLabel>
							<DateTimePicker
								className="rounded-[10px] text-[13.5px]"
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
									Esta fecha ya pasó. Puedes continuar, pero el contador
									mostrará un mensaje de cierre.
								</p>
							)}
						</Field>

						<Field className="gap-0">
							<FieldLabel
								className="mb-[7px] font-semibold text-[13px] text-foreground"
								htmlFor="eventLocation"
							>
								Lugar
							</FieldLabel>
							<Input
								className="min-h-11 rounded-[10px] text-[13.5px]"
								id="eventLocation"
								onChange={(e) => setField("eventLocation", e.target.value)}
								placeholder="Ej. Salón Los Jardines"
								type="text"
								value={draft.eventLocation}
							/>
						</Field>

						<Field className="gap-0">
							<FieldLabel
								className="mb-[7px] font-semibold text-[13px] text-foreground"
								htmlFor="dressCode"
							>
								Código de vestimenta
							</FieldLabel>
							<Input
								className="min-h-11 rounded-[10px] text-[13.5px]"
								id="dressCode"
								onChange={(e) => setField("dressCode", e.target.value)}
								placeholder="Ej. Elegante campestre"
								type="text"
								value={draft.dressCode}
							/>
						</Field>
					</FieldGroup>
				</div>

				<div className="mb-3.5 rounded-[14px] border border-border bg-card p-[18px] lg:mb-0">
					<div className="mb-3.5 flex items-center justify-between">
						<span className={EYEBROW}>③ Tu enlace</span>
						<SlugStatusBadge status={slugStatus} />
					</div>
					<div className="flex items-center overflow-hidden rounded-[10px] border border-border bg-[#F8F7F2] focus-within:ring-3 focus-within:ring-ring/50">
						<span className="shrink-0 py-[11px] pl-3 text-[12.5px] text-muted-foreground">
							awishfor.com/w/
						</span>
						<input
							className="min-w-0 flex-1 border-0 bg-transparent py-[11px] pr-3 pl-1 text-[12.5px] text-foreground outline-none"
							id="slug"
							onChange={(e) => setField("slug", e.target.value)}
							placeholder="mi-lista"
							type="text"
							value={draft.slug}
						/>
					</div>
					{!slugTouched && draft.title && (
						<p className="mt-2.5 text-[11.5px] text-muted-foreground">
							Generado automáticamente desde el título
						</p>
					)}
					{slugStatus === "taken" && (
						<FieldError className="mt-2.5 text-[11.5px]">
							Ese enlace ya está en uso. Prueba con otro.
						</FieldError>
					)}
					{slugStatus === "invalid" && (
						<FieldError className="mt-2.5 text-[11.5px]">
							Solo letras, números y guiones.
						</FieldError>
					)}
					{slugStatus === "error" && (
						<FieldError className="mt-2.5 text-[11.5px]">
							No pudimos verificar la disponibilidad del slug. Intenta de nuevo.
						</FieldError>
					)}
				</div>

				<div className="rounded-[14px] border border-border bg-card p-[18px]">
					<div className="mb-3.5 flex items-center justify-between">
						<span className={EYEBROW}>Mensajes</span>
						<span className="text-[11px] text-muted-foreground">opcional</span>
					</div>
					<FieldGroup className="gap-3">
						<Field className="gap-0">
							<div className="mb-[7px] flex items-center justify-between gap-2">
								<FieldLabel
									className="mb-0 font-semibold text-[13px] text-foreground"
									htmlFor="welcomeMessage"
								>
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
								className="rounded-[10px] text-[13.5px]"
								id="welcomeMessage"
								onChange={(e) => setField("welcomeMessage", e.target.value)}
								placeholder="Escribe un mensaje para tus invitados"
								value={draft.welcomeMessage}
							/>
						</Field>

						<Field className="gap-0">
							<FieldLabel
								className="mb-[7px] font-semibold text-[13px] text-foreground"
								htmlFor="thankYouMessage"
							>
								Mensaje de agradecimiento
							</FieldLabel>
							<Textarea
								className="rounded-[10px] text-[13.5px]"
								id="thankYouMessage"
								onChange={(e) => setField("thankYouMessage", e.target.value)}
								placeholder="Escribe un mensaje de agradecimiento"
								value={draft.thankYouMessage}
							/>
							<p className="mt-2.5 text-[11.5px] text-muted-foreground">
								Se muestra después de que un invitado reserva un regalo
							</p>
						</Field>
					</FieldGroup>
				</div>
			</div>

			<div className="mt-8 hidden flex-1 flex-col bg-background px-8 py-8 lg:mt-0 lg:flex">
				<p className={`mb-3.5 ${EYEBROW} text-muted-foreground`}>
					Vista previa del encabezado
				</p>
				<PublicThemeProvider
					bodyFont={resolveBodyFont(draft.bodyFont)}
					buttonStyle={resolveButtonStyle(draft.buttonStyle)}
					className="min-h-0 bg-transparent"
					headingFont={resolveHeadingFont(draft.headingFont)}
					theme={resolveTheme(draft.themeId)}
				>
					<div className="rounded-[18px] border border-border bg-card px-8 py-[30px] text-card-foreground">
						<p className={`mb-2 ${EYEBROW} text-muted-foreground`}>
							{draft.eventDate || "Fecha por definir"}
						</p>
						<p className="mb-2.5 font-heading font-semibold text-[32px] text-foreground">
							{draft.title || "Tu wishlist especial"}
						</p>
						<p className="mb-4 text-[13px] text-muted-foreground">
							Así verán tus invitados el encabezado de tu página.
						</p>
						<Badge variant="published">
							{draft.eventDate ? "Cuenta regresiva activa" : "Sin fecha aún"}
						</Badge>
					</div>
				</PublicThemeProvider>
			</div>
		</div>
	);
}
