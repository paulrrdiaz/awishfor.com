"use client";

import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useDebouncedCallback } from "use-debounce";
import { MessageVariantPicker } from "@/components/features/wishlist/message-variant-picker";
import { MotifPicker } from "@/components/features/wishlist/motif-picker";
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
import { DatePicker } from "@/components/ui/date-picker";
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
import { isMotifGatedEventType } from "@/config/motifs";
import {
	getAllCountdownVariants,
	getAllThankYouVariants,
	getAllWelcomeVariants,
	resolveCountdownVariant,
	resolveThankYouVariant,
	resolveWelcomeVariant,
} from "@/config/public-message-variants";
import { Currency, Locale } from "@/generated/prisma/enums";
import { isValidSlug } from "@/lib/slug";
import { WISHLIST_SUBTITLE_MAX_LENGTH } from "@/lib/wishlist/subtitle";
import { api, type RouterOutputs } from "@/trpc/react";

const COUNTDOWN_VARIANTS = getAllCountdownVariants();
const WELCOME_VARIANTS = getAllWelcomeVariants();
const THANK_YOU_VARIANTS = getAllThankYouVariants();

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
	const [subtitle, setSubtitle] = useState(wishlist.subtitle ?? "");
	const [slug, setSlug] = useState(wishlist.slug);
	const [savedSlug, setSavedSlug] = useState(wishlist.slug);
	const [eventDate, setEventDate] = useState(
		wishlist.eventDate ? wishlist.eventDate.split("T")[0] : "",
	);
	const [eventTime, setEventTime] = useState(wishlist.eventTime ?? "");
	const [endTime, setEndTime] = useState(wishlist.endTime ?? "");
	const [rsvpDeadline, setRsvpDeadline] = useState(
		wishlist.rsvpDeadline ? wishlist.rsvpDeadline.split("T")[0] : "",
	);
	const [rsvpDeadlineError, setRsvpDeadlineError] = useState(false);
	const [eventLocation, setEventLocation] = useState(
		wishlist.eventLocation ?? "",
	);
	const [dressCode, setDressCode] = useState(wishlist.dressCode ?? "");
	const [welcomeMessage, setWelcomeMessage] = useState(
		wishlist.welcomeMessage ?? "",
	);
	const [welcomeMessageAttribution, setWelcomeMessageAttribution] = useState(
		wishlist.welcomeMessageAttribution ?? "",
	);
	const [deliveryRecipientName, setDeliveryRecipientName] = useState(
		wishlist.deliveryRecipientName ?? "",
	);
	const [deliveryDocumentId, setDeliveryDocumentId] = useState(
		wishlist.deliveryDocumentId ?? "",
	);
	const [deliveryAddress, setDeliveryAddress] = useState(
		wishlist.deliveryAddress ?? "",
	);
	const [deliveryPhone, setDeliveryPhone] = useState(
		wishlist.deliveryPhone ?? "",
	);
	const [thankYouMessage, setThankYouMessage] = useState(
		wishlist.thankYouMessage ?? "",
	);
	const [giftListMessage, setGiftListMessage] = useState(
		wishlist.giftListMessage ?? "",
	);
	const [countdownVariant, setCountdownVariant] = useState(
		resolveCountdownVariant(wishlist.countdownVariant).id,
	);
	const [welcomeMessageVariant, setWelcomeMessageVariant] = useState(
		resolveWelcomeVariant(wishlist.welcomeMessageVariant).id,
	);
	const [thankYouMessageVariant, setThankYouMessageVariant] = useState(
		resolveThankYouVariant(wishlist.thankYouMessageVariant).id,
	);
	const [motifId, setMotifId] = useState(wishlist.motifId);
	const [motifTreatment, setMotifTreatment] = useState(wishlist.motifTreatment);
	const [motifPalette, setMotifPalette] = useState(wishlist.motifPalette);
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

	const welcomeMessageError = welcomeMessage.trim().length === 0;
	const subtitleLength = subtitle.trim().length;
	const subtitleError = subtitleLength > WISHLIST_SUBTITLE_MAX_LENGTH;
	const eventTimeRangeError = Boolean(
		eventTime && endTime && endTime <= eventTime,
	);

	const canSave =
		title.trim().length > 0 &&
		!subtitleError &&
		!welcomeMessageError &&
		!eventTimeRangeError &&
		slugStatus !== "taken" &&
		slugStatus !== "invalid" &&
		!rsvpDeadlineError &&
		(!showPublishedSlugWarning || slugWarningAck);

	function handleRsvpDeadlineChange(date: Date | null) {
		const next = date ? format(date, "yyyy-MM-dd") : "";
		setRsvpDeadline(next);
		setRsvpDeadlineError(Boolean(next && eventDate && next > eventDate));
	}

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (!canSave) return;
		updateSettings.mutate({
			id: wishlist.id,
			title: title.trim(),
			subtitle: subtitle.trim() || null,
			slug,
			eventDate: (eventDate || null) as unknown as Date | null,
			eventTime: eventTime || null,
			endTime: endTime || null,
			rsvpDeadline: (rsvpDeadline || null) as unknown as Date | null,
			eventLocation: eventLocation || null,
			dressCode: dressCode || null,
			welcomeMessage: welcomeMessage || null,
			welcomeMessageAttribution: welcomeMessageAttribution || null,
			deliveryRecipientName: deliveryRecipientName || null,
			deliveryDocumentId: deliveryDocumentId || null,
			deliveryAddress: deliveryAddress || null,
			deliveryPhone: deliveryPhone || null,
			thankYouMessage: thankYouMessage || null,
			giftListMessage: giftListMessage || null,
			countdownVariant,
			welcomeMessageVariant,
			thankYouMessageVariant,
			motifId,
			motifPalette,
			motifTreatment,
			language: language as Locale,
			currency: currency as Currency,
			showHowItWorks,
		});
	}

	return (
		<div className="mx-auto w-full max-w-3xl p-7">
			<div className="mb-8">
				<div className="mb-2 flex flex-wrap items-center gap-2">
					<p className="text-muted-foreground text-sm">
						Configuración de wishlist
					</p>
					<Badge variant="secondary">{statusLabel(wishlist.status)}</Badge>
				</div>
				<h2 className="font-heading font-semibold text-3xl">
					{wishlist.title}
				</h2>
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
							Nombre de tu wishlist <span className="text-destructive">*</span>
						</Label>
						<Input
							id="title"
							onChange={(e) => setTitle(e.target.value)}
							placeholder="Ej. Baby shower de María"
							required
							value={title}
						/>
						<p className="text-muted-foreground text-xs">
							Así la identificas en tu panel y así la verán tus invitados — un
							solo nombre para ambos.
						</p>
					</div>

					<div className="space-y-1.5">
						<div className="flex items-center justify-between gap-3">
							<Label htmlFor="subtitle">
								Subtítulo{" "}
								<span className="font-normal text-muted-foreground text-xs">
									(opcional)
								</span>
							</Label>
							<span
								className={
									subtitleError
										? "text-destructive text-xs"
										: "text-muted-foreground text-xs"
								}
							>
								{subtitleLength}/{WISHLIST_SUBTITLE_MAX_LENGTH}
							</span>
						</div>
						<Input
							aria-describedby="settings-subtitle-help"
							aria-invalid={subtitleError}
							id="subtitle"
							onChange={(e) => setSubtitle(e.target.value)}
							placeholder="Una frase breve para tus invitados"
							value={subtitle}
						/>
						<p
							className="text-muted-foreground text-xs"
							id="settings-subtitle-help"
						>
							Aparece debajo del nombre en tu lista pública. Puedes cambiarlo o
							quitarlo cuando quieras.
						</p>
						{subtitleError && (
							<p className="text-destructive text-xs">
								El subtítulo debe tener como máximo 160 caracteres.
							</p>
						)}
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
						<Label htmlFor="eventDate">Fecha del evento</Label>
						<DatePicker
							date={eventDate ? new Date(`${eventDate}T00:00:00`) : null}
							id="eventDate"
							onDateChange={(date) =>
								setEventDate(date ? format(date, "yyyy-MM-dd") : "")
							}
						/>
					</div>

					<div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
						<div className="space-y-1.5">
							<Label htmlFor="eventTime">Hora de inicio</Label>
							<Input
								id="eventTime"
								onChange={(e) => setEventTime(e.target.value)}
								type="time"
								value={eventTime}
							/>
						</div>
						<div className="space-y-1.5">
							<Label htmlFor="endTime">Hora de fin</Label>
							<Input
								id="endTime"
								onChange={(e) => setEndTime(e.target.value)}
								type="time"
								value={endTime}
							/>
							{eventTimeRangeError && (
								<p className="text-destructive text-xs">
									La hora de fin debe ser posterior a la hora de inicio.
								</p>
							)}
						</div>
					</div>

					<div className="space-y-1.5">
						<Label htmlFor="rsvpDeadline">Fecha límite de confirmación</Label>
						<DatePicker
							date={rsvpDeadline ? new Date(`${rsvpDeadline}T00:00:00`) : null}
							id="rsvpDeadline"
							onDateChange={handleRsvpDeadlineChange}
						/>
						{rsvpDeadlineError && (
							<p className="text-destructive text-xs">
								La fecha límite no puede ser posterior a la fecha del evento.
							</p>
						)}
					</div>

					<div className="space-y-1.5">
						<Label>Estilo de la cuenta regresiva</Label>
						<MessageVariantPicker
							onSelect={setCountdownVariant}
							options={COUNTDOWN_VARIANTS}
							selected={countdownVariant}
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
						<Label htmlFor="welcomeMessage">
							Mensaje de bienvenida <span className="text-destructive">*</span>
						</Label>
						<textarea
							aria-invalid={welcomeMessageError}
							className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
							id="welcomeMessage"
							onChange={(e) => setWelcomeMessage(e.target.value)}
							placeholder="Escribe un mensaje de bienvenida para tus invitados…"
							rows={4}
							value={welcomeMessage}
						/>
						{welcomeMessageError && (
							<p className="text-destructive text-xs">
								El mensaje de bienvenida es obligatorio.
							</p>
						)}
					</div>

					<div className="space-y-1.5">
						<Label>Estilo del mensaje de bienvenida</Label>
						<MessageVariantPicker
							onSelect={setWelcomeMessageVariant}
							options={WELCOME_VARIANTS}
							selected={welcomeMessageVariant}
						/>
					</div>

					<div className="space-y-1.5">
						<Label htmlFor="welcomeMessageAttribution">Firma del mensaje</Label>
						<Input
							id="welcomeMessageAttribution"
							maxLength={120}
							onChange={(e) => setWelcomeMessageAttribution(e.target.value)}
							placeholder="Ej. Lucía y Marco"
							value={welcomeMessageAttribution}
						/>
						<p className="text-muted-foreground text-xs">
							Aparecerá debajo del mensaje de bienvenida y del mensaje de
							agradecimiento en tu lista pública.
						</p>
					</div>

					<div className="space-y-1.5">
						<Label htmlFor="deliveryRecipientName">
							Nombre del destinatario{" "}
							<span className="font-normal text-muted-foreground text-xs">
								(opcional)
							</span>
						</Label>
						<Input
							id="deliveryRecipientName"
							maxLength={120}
							onChange={(e) => setDeliveryRecipientName(e.target.value)}
							placeholder="Ej. Ana Beltrán"
							value={deliveryRecipientName}
						/>
					</div>

					<div className="space-y-1.5">
						<Label htmlFor="deliveryDocumentId">
							DNI o documento de identidad{" "}
							<span className="font-normal text-muted-foreground text-xs">
								(opcional)
							</span>
						</Label>
						<Input
							id="deliveryDocumentId"
							maxLength={40}
							onChange={(e) => setDeliveryDocumentId(e.target.value)}
							placeholder="Ej. 46737335"
							value={deliveryDocumentId}
						/>
					</div>

					<div className="space-y-1.5">
						<Label htmlFor="deliveryAddress">
							Dirección de envío{" "}
							<span className="font-normal text-muted-foreground text-xs">
								(opcional)
							</span>
						</Label>
						<Input
							id="deliveryAddress"
							maxLength={240}
							onChange={(e) => setDeliveryAddress(e.target.value)}
							placeholder="Ej. Av. Universidad 1500, Col. Narvarte, CDMX"
							value={deliveryAddress}
						/>
						<p className="text-muted-foreground text-xs">
							Si la dejas vacía, no se mostrará ninguna opción de envío a
							domicilio en tu lista pública.
						</p>
					</div>

					<div className="space-y-1.5">
						<Label htmlFor="deliveryPhone">
							Teléfono de envío{" "}
							<span className="font-normal text-muted-foreground text-xs">
								(opcional)
							</span>
						</Label>
						<Input
							id="deliveryPhone"
							maxLength={40}
							onChange={(e) => setDeliveryPhone(e.target.value)}
							placeholder="Ej. +52 55 1122 3344"
							value={deliveryPhone}
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

					<div className="space-y-1.5">
						<Label>Estilo del mensaje de agradecimiento</Label>
						<MessageVariantPicker
							onSelect={setThankYouMessageVariant}
							options={THANK_YOU_VARIANTS}
							selected={thankYouMessageVariant}
						/>
					</div>

					<div className="space-y-1.5">
						<Label htmlFor="giftListMessage">
							Mensaje de la lista de regalos{" "}
							<span className="font-normal text-muted-foreground text-xs">
								(opcional)
							</span>
						</Label>
						<textarea
							className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
							id="giftListMessage"
							onChange={(e) => setGiftListMessage(e.target.value)}
							placeholder="Escribe una breve introducción a tu lista de regalos…"
							rows={4}
							value={giftListMessage}
						/>
					</div>

					{isMotifGatedEventType(wishlist.eventType) && (
						<div className="space-y-1.5">
							<Label>Motivo</Label>
							<MotifPicker
								eventType={wishlist.eventType}
								motifId={motifId}
								motifPalette={motifPalette}
								motifTreatment={motifTreatment}
								onSelectMotif={setMotifId}
								onSelectPalette={setMotifPalette}
								onSelectTreatment={setMotifTreatment}
								themeId={wishlist.themeId}
							/>
						</div>
					)}
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
			{wishlist.isOwner && (
				<div className="mt-10 rounded-2xl border border-destructive/30 bg-card p-5 shadow-sm">
					<h2 className="mb-1 font-medium text-base text-destructive">
						Zona peligrosa
					</h2>
					<p className="mb-4 text-muted-foreground text-sm">
						Estas acciones modifican el estado de tu lista y no se pueden
						deshacer fácilmente.
					</p>

					{wishlist.status === "archived" ? (
						<div className="space-y-3">
							<p className="text-sm">
								Tu lista está archivada. Puedes restaurarla como publicada o
								como borrador.
							</p>
							<Dialog>
								<DialogTrigger asChild>
									<Button
										disabled={restoreMutation.isPending}
										variant="outline"
									>
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
											onClick={() =>
												archiveMutation.mutate({ id: wishlist.id })
											}
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
			)}
		</div>
	);
}
