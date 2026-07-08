"use client";

import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useDebouncedCallback } from "use-debounce";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Currency, Locale } from "@/generated/prisma/enums";
import { isValidSlug } from "@/lib/slug";
import { api, type RouterOutputs } from "@/trpc/react";

type WishlistDetail = RouterOutputs["wishlist"]["getById"];

type Props = {
	wishlist: WishlistDetail;
};

type SlugStatus = "idle" | "checking" | "available" | "taken" | "invalid";

function statusLabel(status: string) {
	if (status === "published") return "Publicada";
	if (status === "archived") return "Archivada";
	return "Borrador";
}

function SlugStatusIndicator({ status }: { status: SlugStatus }) {
	if (status === "idle") return null;
	const map = {
		checking: { text: "◌ Verificando…", className: "text-muted-foreground" },
		available: { text: "✓ Disponible", className: "text-emerald-600" },
		taken: { text: "✕ Ya está en uso", className: "text-destructive" },
		invalid: {
			text: "✕ Solo letras minúsculas, números y guiones (3-60 car.)",
			className: "text-destructive",
		},
	} as const;
	const cfg = map[status];
	return <p className={`text-xs ${cfg.className}`}>{cfg.text}</p>;
}

export function PublishedSlugWarning({
	acknowledged,
	onAcknowledgedChange,
}: {
	acknowledged: boolean;
	onAcknowledgedChange: (next: boolean) => void;
}) {
	const inputId = "published-slug-warning-ack";

	return (
		<div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-800 text-sm dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
			<p className="font-medium">Atención: tu lista está publicada</p>
			<p className="mt-1">
				Cambiar el enlace público hará que el enlace anterior y los QR ya
				compartidos dejen de funcionar. También deberás descargar y compartir un
				nuevo QR.
			</p>
			<div className="mt-2 flex items-start gap-2">
				<Checkbox
					checked={acknowledged}
					id={inputId}
					onCheckedChange={(next) => onAcknowledgedChange(Boolean(next))}
				/>
				<Label className="cursor-pointer leading-snug" htmlFor={inputId}>
					Entiendo que los enlaces existentes dejarán de funcionar
				</Label>
			</div>
		</div>
	);
}

export function RestoreWishlistDialogContent({
	disabled = false,
	onRestoreDraft,
	onRestorePublished,
}: {
	disabled?: boolean;
	onRestoreDraft: () => void;
	onRestorePublished: () => void;
}) {
	return (
		<>
			<DialogHeader>
				<DialogTitle>¿Restaurar esta wishlist?</DialogTitle>
				<DialogDescription>
					Puedes restaurarla como borrador para editarla antes de compartirla, o
					publicarla nuevamente con el mismo enlace.
				</DialogDescription>
			</DialogHeader>
			<DialogFooter className="flex-col gap-2 sm:flex-row">
				<Button
					disabled={disabled}
					onClick={onRestoreDraft}
					type="button"
					variant="outline"
				>
					Restaurar como borrador
				</Button>
				<Button disabled={disabled} onClick={onRestorePublished} type="button">
					Restaurar publicada
				</Button>
			</DialogFooter>
		</>
	);
}

export function WishlistSettingsForm({ wishlist }: Props) {
	const router = useRouter();
	const utils = api.useUtils();

	const [title, setTitle] = useState(wishlist.title);
	const [slug, setSlug] = useState(wishlist.slug);
	const [savedSlug, setSavedSlug] = useState(wishlist.slug);
	const [displayName, setDisplayName] = useState(wishlist.displayName ?? "");
	const [eventDate, setEventDate] = useState(
		wishlist.eventDate ? wishlist.eventDate.split("T")[0] : "",
	);
	const [eventTime, setEventTime] = useState(wishlist.eventTime ?? "");
	const [eventLocation, setEventLocation] = useState(
		wishlist.eventLocation ?? "",
	);
	const [dressCode, setDressCode] = useState(wishlist.dressCode ?? "");
	const [heroTitle, setHeroTitle] = useState(wishlist.heroTitle ?? "");
	const [welcomeMessage, setWelcomeMessage] = useState(
		wishlist.welcomeMessage ?? "",
	);
	const [thankYouMessage, setThankYouMessage] = useState(
		wishlist.thankYouMessage ?? "",
	);
	const [language, setLanguage] = useState<string>(wishlist.language);
	const [currency, setCurrency] = useState<string>(wishlist.currency);
	const [showHowItWorks, setShowHowItWorks] = useState(wishlist.showHowItWorks);

	const [slugStatus, setSlugStatus] = useState<SlugStatus>("idle");
	const [slugWarningAck, setSlugWarningAck] = useState(false);

	const slugChanged = slug !== savedSlug;
	const showPublishedSlugWarning =
		wishlist.status === "published" && slugChanged;

	const debouncedCheckSlug = useDebouncedCallback(async (value: string) => {
		if (!isValidSlug(value)) {
			setSlugStatus("invalid");
			return;
		}
		setSlugStatus("checking");
		try {
			const result = await utils.wishlist.checkSlugAvailability.fetch({
				slug: value,
				excludeWishlistId: wishlist.id,
			});
			setSlugStatus(result.available ? "available" : "taken");
		} catch {
			setSlugStatus("idle");
		}
	}, 400);

	useEffect(() => {
		if (!slug) {
			setSlugStatus("idle");
			return;
		}
		debouncedCheckSlug(slug);
	}, [slug, debouncedCheckSlug]);

	const updateSettings = api.wishlist.updateSettings.useMutation({
		onSuccess: (data) => {
			toast.success("Configuración guardada");
			setSavedSlug(data.slug);
			setSlugWarningAck(false);
		},
		onError: (error) => {
			if (error.data?.code === "CONFLICT") {
				toast.error("Ese slug ya está en uso por otra lista");
			} else {
				toast.error("No se pudo guardar la configuración");
			}
		},
	});

	const archiveMutation = api.wishlist.archive.useMutation({
		onSuccess: () => {
			toast.success("Lista archivada");
			router.refresh();
		},
		onError: () => toast.error("No se pudo archivar la lista"),
	});

	const restoreMutation = api.wishlist.restore.useMutation({
		onSuccess: () => {
			toast.success("Lista restaurada");
			router.refresh();
		},
		onError: () => toast.error("No se pudo restaurar la lista"),
	});

	const canSave =
		title.trim().length > 0 &&
		slugStatus !== "taken" &&
		slugStatus !== "invalid" &&
		(!showPublishedSlugWarning || slugWarningAck);

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (!canSave) return;
		updateSettings.mutate({
			id: wishlist.id,
			title: title.trim(),
			slug,
			displayName: displayName || null,
			eventDate: (eventDate || null) as unknown as Date | null,
			eventTime: eventTime || null,
			eventLocation: eventLocation || null,
			dressCode: dressCode || null,
			heroTitle: heroTitle || null,
			welcomeMessage: welcomeMessage || null,
			thankYouMessage: thankYouMessage || null,
			language: language as Locale,
			currency: currency as Currency,
			showHowItWorks,
		});
	}

	return (
		<div className="mx-auto w-full max-w-3xl px-4 py-8">
			<div className="mb-8">
				<div className="mb-2 flex flex-wrap items-center gap-2">
					<p className="text-muted-foreground text-sm">
						Configuración de wishlist
					</p>
					<Badge variant="secondary">{statusLabel(wishlist.status)}</Badge>
				</div>
				<h1 className="font-heading font-semibold text-3xl">
					{wishlist.title}
				</h1>
				<p className="mt-2 text-muted-foreground text-sm">
					Edita el contenido, la URL y las opciones de tu lista.
				</p>
			</div>

			<form className="space-y-6" onSubmit={handleSubmit}>
				{/* Información básica */}
				<section className="space-y-5 rounded-2xl border bg-card p-5 shadow-sm">
					<h2 className="font-medium text-base">Información básica</h2>

					<div className="space-y-1.5">
						<Label htmlFor="title">
							Título <span className="text-destructive">*</span>
						</Label>
						<Input
							id="title"
							onChange={(e) => setTitle(e.target.value)}
							placeholder="Ej. Baby shower de María"
							required
							value={title}
						/>
					</div>

					<div className="space-y-1.5">
						<Label htmlFor="displayName">Nombre para mostrar</Label>
						<Input
							id="displayName"
							onChange={(e) => setDisplayName(e.target.value)}
							placeholder="Ej. María García"
							value={displayName}
						/>
						<p className="text-muted-foreground text-xs">
							Nombre que aparecerá en tu lista pública
						</p>
					</div>

					<div className="space-y-1.5">
						<Label htmlFor="slug">URL de tu lista</Label>
						<div className="flex items-center gap-2">
							<span className="shrink-0 text-muted-foreground text-sm">
								awishfor.com/w/
							</span>
							<Input
								className="min-w-0 flex-1"
								id="slug"
								onChange={(e) => {
									setSlug(e.target.value.toLowerCase());
									setSlugWarningAck(false);
								}}
								placeholder="mi-lista"
								value={slug}
							/>
						</div>
						<SlugStatusIndicator status={slugStatus} />

						{showPublishedSlugWarning && (
							<PublishedSlugWarning
								acknowledged={slugWarningAck}
								onAcknowledgedChange={setSlugWarningAck}
							/>
						)}
					</div>
				</section>

				{/* Detalles del evento */}
				<section className="space-y-5 rounded-2xl border bg-card p-5 shadow-sm">
					<h2 className="font-medium text-base">Detalles del evento</h2>

					<div className="space-y-1.5">
						<Label htmlFor="eventDateTime">Fecha y hora del evento</Label>
						<DateTimePicker
							date={eventDate ? new Date(`${eventDate}T00:00:00`) : null}
							id="eventDateTime"
							onDateChange={(date) =>
								setEventDate(date ? format(date, "yyyy-MM-dd") : "")
							}
							onTimeChange={(time) => setEventTime(time ?? "")}
							time={eventTime || null}
						/>
					</div>

					<div className="space-y-1.5">
						<Label htmlFor="eventLocation">Lugar del evento</Label>
						<Input
							id="eventLocation"
							onChange={(e) => setEventLocation(e.target.value)}
							placeholder="Ej. Salón Los Jardines, Lima"
							value={eventLocation}
						/>
					</div>

					<div className="space-y-1.5">
						<Label htmlFor="dressCode">Código de vestimenta</Label>
						<Input
							id="dressCode"
							onChange={(e) => setDressCode(e.target.value)}
							placeholder="Ej. Formal, tonos pastel"
							value={dressCode}
						/>
					</div>
				</section>

				{/* Contenido */}
				<section className="space-y-5 rounded-2xl border bg-card p-5 shadow-sm">
					<h2 className="font-medium text-base">Contenido</h2>

					<div className="space-y-1.5">
						<Label htmlFor="heroTitle">Título principal</Label>
						<Input
							id="heroTitle"
							onChange={(e) => setHeroTitle(e.target.value)}
							placeholder="Ej. ¡Bienvenidos a mi baby shower!"
							value={heroTitle}
						/>
					</div>

					<div className="space-y-1.5">
						<Label htmlFor="welcomeMessage">Mensaje de bienvenida</Label>
						<textarea
							className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
							id="welcomeMessage"
							onChange={(e) => setWelcomeMessage(e.target.value)}
							placeholder="Escribe un mensaje de bienvenida para tus invitados…"
							rows={4}
							value={welcomeMessage}
						/>
					</div>

					<div className="space-y-1.5">
						<Label htmlFor="thankYouMessage">Mensaje de agradecimiento</Label>
						<textarea
							className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
							id="thankYouMessage"
							onChange={(e) => setThankYouMessage(e.target.value)}
							placeholder="Escribe un mensaje de agradecimiento…"
							rows={4}
							value={thankYouMessage}
						/>
					</div>
				</section>

				{/* Configuración */}
				<section className="space-y-5 rounded-2xl border bg-card p-5 shadow-sm">
					<h2 className="font-medium text-base">Configuración</h2>

					<div className="grid gap-5 sm:grid-cols-2">
						<div className="space-y-1.5">
							<Label htmlFor="language">Idioma</Label>
							<select
								className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
								id="language"
								onChange={(e) => setLanguage(e.target.value)}
								value={language}
							>
								<option value={Locale.es}>Español</option>
								<option value={Locale.en}>English</option>
							</select>
						</div>

						<div className="space-y-1.5">
							<Label htmlFor="currency">Moneda</Label>
							<select
								className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
								id="currency"
								onChange={(e) => setCurrency(e.target.value)}
								value={currency}
							>
								<option value={Currency.PEN}>PEN – Sol peruano</option>
								<option value={Currency.USD}>USD – Dólar estadounidense</option>
								<option value={Currency.EUR}>EUR – Euro</option>
								<option value={Currency.MXN}>MXN – Peso mexicano</option>
								<option value={Currency.COP}>COP – Peso colombiano</option>
								<option value={Currency.CLP}>CLP – Peso chileno</option>
								<option value={Currency.ARS}>ARS – Peso argentino</option>
							</select>
						</div>
					</div>

					<div className="flex items-center gap-3">
						<Switch
							checked={showHowItWorks}
							id="showHowItWorks"
							onCheckedChange={(next) => setShowHowItWorks(Boolean(next))}
						/>
						<div>
							<Label className="cursor-pointer" htmlFor="showHowItWorks">
								Mostrar sección "¿Cómo funciona?"
							</Label>
							<p className="text-muted-foreground text-xs">
								Muestra una guía breve a tus invitados sobre cómo regalar
							</p>
						</div>
					</div>
				</section>

				<div className="flex justify-end">
					<Button disabled={!canSave || updateSettings.isPending} type="submit">
						{updateSettings.isPending ? "Guardando…" : "Guardar cambios"}
					</Button>
				</div>
			</form>

			{/* Zona peligrosa */}
			<div className="mt-10 rounded-2xl border border-destructive/30 bg-card p-5 shadow-sm">
				<h2 className="mb-1 font-medium text-base text-destructive">
					Zona peligrosa
				</h2>
				<p className="mb-4 text-muted-foreground text-sm">
					Estas acciones modifican el estado de tu lista y no se pueden deshacer
					fácilmente.
				</p>

				{wishlist.status === "archived" ? (
					<div className="space-y-3">
						<p className="text-sm">
							Tu lista está archivada. Puedes restaurarla como publicada o como
							borrador.
						</p>
						<Dialog>
							<DialogTrigger asChild>
								<Button disabled={restoreMutation.isPending} variant="outline">
									Restaurar lista
								</Button>
							</DialogTrigger>
							<DialogContent>
								<RestoreWishlistDialogContent
									disabled={restoreMutation.isPending}
									onRestoreDraft={() =>
										restoreMutation.mutate({
											id: wishlist.id,
											targetStatus: "draft",
										})
									}
									onRestorePublished={() =>
										restoreMutation.mutate({
											id: wishlist.id,
											targetStatus: "published",
										})
									}
								/>
							</DialogContent>
						</Dialog>
					</div>
				) : (
					<div className="space-y-3">
						<p className="text-sm">
							Archivar ocultará tu lista del público. Podrás restaurarla en
							cualquier momento.
						</p>
						<AlertDialog>
							<AlertDialogTrigger asChild>
								<Button
									className="border-destructive/50 text-destructive hover:bg-destructive/10"
									disabled={archiveMutation.isPending}
									variant="outline"
								>
									Archivar lista
								</Button>
							</AlertDialogTrigger>
							<AlertDialogContent>
								<AlertDialogHeader>
									<AlertDialogTitle>¿Archivar esta lista?</AlertDialogTitle>
									<AlertDialogDescription>
										La lista dejará de ser pública. Podrás restaurarla desde
										esta misma página cuando quieras.
									</AlertDialogDescription>
								</AlertDialogHeader>
								<AlertDialogFooter>
									<AlertDialogCancel>Cancelar</AlertDialogCancel>
									<AlertDialogAction
										disabled={archiveMutation.isPending}
										onClick={() => archiveMutation.mutate({ id: wishlist.id })}
										variant="destructive"
									>
										{archiveMutation.isPending ? "Archivando…" : "Archivar"}
									</AlertDialogAction>
								</AlertDialogFooter>
							</AlertDialogContent>
						</AlertDialog>
					</div>
				)}
			</div>
		</div>
	);
}
