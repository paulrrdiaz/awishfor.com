"use client";

import { useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { isValidSlug } from "@/lib/slug";
import { api } from "@/trpc/react";
import { useWizardStore } from "./wizard-provider";

type SlugStatus = "idle" | "checking" | "available" | "taken" | "invalid";

function SlugStatusBadge({ status }: { status: SlugStatus }) {
	if (status === "idle") return null;
	const configs = {
		checking: { text: "◌ Verificando…", className: "text-gray-500" },
		available: { text: "✓ Disponible", className: "text-green-600" },
		taken: { text: "✕ Ya está en uso", className: "text-red-600" },
		invalid: {
			text: "✕ Solo letras, números y guiones",
			className: "text-red-600",
		},
	} as const;
	const cfg = configs[status];
	return (
		<p
			className={`mt-1 rounded-md text-sm ${
				status === "available" ? "ring-1 ring-green-500" : ""
			} ${cfg.className}`}
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
		<div className="mx-auto w-full max-w-2xl px-4 py-8">
			<h1 className="mb-2 text-center font-semibold text-2xl text-gray-900">
				Detalles del evento
			</h1>
			<p className="mb-8 text-center text-gray-500 text-sm">
				Cuéntanos sobre tu ocasión
			</p>

			<div className="space-y-6">
				{/* Title */}
				<div>
					<label
						className="mb-1 block font-medium text-gray-700 text-sm"
						htmlFor="title"
					>
						Título <span className="text-red-500">*</span>
					</label>
					<input
						className="w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-900 text-sm focus:border-gray-400 focus:outline-none"
						id="title"
						onChange={(e) => setField("title", e.target.value)}
						placeholder="Ej. Baby shower de María"
						type="text"
						value={draft.title}
					/>
				</div>

				{/* Display Name */}
				<div>
					<label
						className="mb-1 block font-medium text-gray-700 text-sm"
						htmlFor="displayName"
					>
						Nombre para mostrar
					</label>
					<input
						className="w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-900 text-sm focus:border-gray-400 focus:outline-none"
						id="displayName"
						onChange={(e) => setField("displayName", e.target.value)}
						placeholder="Ej. María García"
						type="text"
						value={draft.displayName}
					/>
					<p className="mt-1 text-gray-400 text-xs">
						Nombre que aparecerá en tu lista pública
					</p>
				</div>

				{/* Slug */}
				<div>
					<label
						className="mb-1 block font-medium text-gray-700 text-sm"
						htmlFor="slug"
					>
						URL de tu lista
					</label>
					<div className="flex items-center gap-2">
						<span className="shrink-0 text-gray-400 text-sm">
							awishfor.com/
						</span>
						<input
							className="min-w-0 flex-1 rounded-lg border border-gray-200 px-3 py-2 text-gray-900 text-sm focus:border-gray-400 focus:outline-none"
							id="slug"
							onChange={(e) => setField("slug", e.target.value)}
							placeholder="mi-lista"
							type="text"
							value={draft.slug}
						/>
					</div>
					{!slugTouched && draft.title && (
						<p className="mt-1 text-gray-400 text-xs">
							Generado automáticamente desde el título
						</p>
					)}
					<SlugStatusBadge status={slugStatus} />
				</div>

				{/* Event Date */}
				<div>
					<label
						className="mb-1 block font-medium text-gray-700 text-sm"
						htmlFor="eventDate"
					>
						Fecha del evento{" "}
						<span className="font-normal text-gray-400">(opcional)</span>
					</label>
					<input
						className="w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-900 text-sm focus:border-gray-400 focus:outline-none"
						id="eventDate"
						onChange={(e) => setField("eventDate", e.target.value || null)}
						type="date"
						value={draft.eventDate ?? ""}
					/>
					{isPastDate && (
						<p className="mt-1 text-amber-600 text-sm">
							Esta fecha ya pasó. Puedes continuar, pero el contador mostrará un
							mensaje de cierre.
						</p>
					)}
				</div>

				{/* Event Time */}
				<div>
					<label
						className="mb-1 block font-medium text-gray-700 text-sm"
						htmlFor="eventTime"
					>
						Hora del evento{" "}
						<span className="font-normal text-gray-400">(opcional)</span>
					</label>
					<input
						className="w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-900 text-sm focus:border-gray-400 focus:outline-none"
						id="eventTime"
						onChange={(e) => setField("eventTime", e.target.value || null)}
						type="time"
						value={draft.eventTime ?? ""}
					/>
				</div>

				{/* Event Location */}
				<div>
					<label
						className="mb-1 block font-medium text-gray-700 text-sm"
						htmlFor="eventLocation"
					>
						Lugar del evento{" "}
						<span className="font-normal text-gray-400">(opcional)</span>
					</label>
					<input
						className="w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-900 text-sm focus:border-gray-400 focus:outline-none"
						id="eventLocation"
						onChange={(e) => setField("eventLocation", e.target.value)}
						placeholder="Ej. Salón Los Jardines, Lima"
						type="text"
						value={draft.eventLocation}
					/>
				</div>

				{/* Dress Code */}
				<div>
					<label
						className="mb-1 block font-medium text-gray-700 text-sm"
						htmlFor="dressCode"
					>
						Código de vestimenta{" "}
						<span className="font-normal text-gray-400">(opcional)</span>
					</label>
					<input
						className="w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-900 text-sm focus:border-gray-400 focus:outline-none"
						id="dressCode"
						onChange={(e) => setField("dressCode", e.target.value)}
						placeholder="Ej. Formal, tonos pastel"
						type="text"
						value={draft.dressCode}
					/>
				</div>
			</div>
		</div>
	);
}
