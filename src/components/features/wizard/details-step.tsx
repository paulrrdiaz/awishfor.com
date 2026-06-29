"use client";

import { useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import {
	Field,
	FieldDescription,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { isValidSlug } from "@/lib/slug";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import { useWizardStore } from "./wizard-provider";

type SlugStatus = "idle" | "checking" | "available" | "taken" | "invalid";

function SlugStatusBadge({ status }: { status: SlugStatus }) {
	if (status === "idle") return null;
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
		<p
			className={cn(
				"mt-1 w-fit rounded-md px-2 py-1 text-sm",
				status === "available" && "ring-1 ring-ring",
				cfg.className,
			)}
		>
			{cfg.text}
		</p>
	);
}

export function DetailsStep() {
	const draft = useWizardStore((s) => s.draft);
	const slugTouched = useWizardStore((s) => s.slugTouched);
	const setField = useWizardStore((s) => s.setField);
	const utils = api.useUtils();

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
		} catch {
			setSlugStatus("idle");
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
		<div className="mx-auto w-full max-w-2xl">
			<h1 className="mb-2 text-center font-semibold text-2xl text-foreground">
				Detalles del evento
			</h1>
			<p className="mb-8 text-center text-muted-foreground text-sm">
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
					<div className="flex items-center gap-2">
						<span className="shrink-0 text-muted-foreground text-sm">
							awishfor.com/
						</span>
						<Input
							className="min-h-11 min-w-0 flex-1"
							id="slug"
							onChange={(e) => setField("slug", e.target.value)}
							placeholder="mi-lista"
							type="text"
							value={draft.slug}
						/>
					</div>
					{!slugTouched && draft.title && (
						<FieldDescription className="text-xs">
							Generado automáticamente desde el título
						</FieldDescription>
					)}
					<SlugStatusBadge status={slugStatus} />
				</Field>

				<Field>
					<FieldLabel htmlFor="eventDate">
						Fecha del evento{" "}
						<span className="font-normal text-muted-foreground">
							(opcional)
						</span>
					</FieldLabel>
					<Input
						className="min-h-11"
						id="eventDate"
						onChange={(e) => setField("eventDate", e.target.value || null)}
						type="date"
						value={draft.eventDate ?? ""}
					/>
					{isPastDate && (
						<p className="mt-1 text-destructive text-sm">
							Esta fecha ya pasó. Puedes continuar, pero el contador mostrará un
							mensaje de cierre.
						</p>
					)}
				</Field>

				<Field>
					<FieldLabel htmlFor="eventTime">
						Hora del evento{" "}
						<span className="font-normal text-muted-foreground">
							(opcional)
						</span>
					</FieldLabel>
					<Input
						className="min-h-11"
						id="eventTime"
						onChange={(e) => setField("eventTime", e.target.value || null)}
						type="time"
						value={draft.eventTime ?? ""}
					/>
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
			</FieldGroup>
		</div>
	);
}
