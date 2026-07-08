"use client";

import { useUser } from "@clerk/nextjs";
import {
	CheckCircle2,
	CircleAlert,
	Copy,
	ExternalLink,
	Gift,
	LoaderCircle,
	MessageCircle,
	PartyPopper,
	QrCode,
	ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { PublicWishlistPage } from "@/components/layouts/public-wishlist/public-wishlist-page";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { resolveTheme } from "@/config/public-themes";
import { downloadQrCodePng } from "@/lib/qr";
import { isValidSlug } from "@/lib/slug";
import { cn } from "@/lib/utils";
import { draftToPreview } from "@/lib/wishlist/draft-to-preview";
import {
	draftToSaveDraftInput,
	serverDraftToLocalDraft,
} from "@/lib/wishlist/save-draft";
import {
	toCanonicalWishlistUrl,
	toWhatsAppShareUrl,
} from "@/lib/wishlist/share";
import type { PublicWishlistViewModel } from "@/server/mappers/view-models";
import type {
	SaveDraftServerDraft,
	SaveDraftWishlistInput,
} from "@/server/validators/wishlist-save-draft.schema";
import {
	clearPersistedWishlistWizardDraft,
	type WishlistDraft,
} from "@/stores/wishlist-wizard.store";
import { api } from "@/trpc/react";
import { WizardModal } from "./wizard-modal";
import { useWizardStore } from "./wizard-provider";

const SIGN_IN_HREF = "/sign-in?redirect_url=%2Fcreate%3Fstep%3Dpublish";

export type SlugChecklistStatus =
	| "idle"
	| "checking"
	| "available"
	| "taken"
	| "invalid";

export type Readiness = {
	title: boolean;
	eventType: boolean;
	slug: boolean;
	language: boolean;
	currency: boolean;
	visibleGift: boolean;
	visibleGiftCount: number;
};

function ChecklistItem({
	label,
	description,
	ready,
}: {
	label: string;
	description: string;
	ready: boolean;
}) {
	const Icon = ready ? CheckCircle2 : CircleAlert;

	return (
		<li className="flex items-start gap-3">
			<Icon
				className={
					ready
						? "mt-0.5 size-4 text-primary"
						: "mt-0.5 size-4 text-destructive"
				}
			/>
			<div>
				<p className="font-medium text-foreground text-sm">{label}</p>
				<p className="text-muted-foreground text-sm">{description}</p>
			</div>
		</li>
	);
}

const isNotFoundError = (error: unknown) =>
	typeof error === "object" &&
	error !== null &&
	"data" in error &&
	typeof error.data === "object" &&
	error.data !== null &&
	"code" in error.data &&
	error.data.code === "NOT_FOUND";

const isPreconditionError = (error: unknown) =>
	typeof error === "object" &&
	error !== null &&
	"data" in error &&
	typeof error.data === "object" &&
	error.data !== null &&
	"code" in error.data &&
	error.data.code === "PRECONDITION_FAILED";

const getErrorMessage = (error: unknown) =>
	error instanceof Error && error.message
		? error.message
		: "No se pudo publicar tu wishlist. Revisa los datos y vuelve a intentarlo.";

function getSlugDescription({
	status,
	draft,
	savedWishlistId,
	savedSlug,
}: {
	status: SlugChecklistStatus;
	draft: WishlistDraft;
	savedWishlistId: string | null;
	savedSlug: string | null;
}) {
	if (!draft.slug.trim()) {
		return "Define la URL publica de tu wishlist.";
	}

	if (status === "checking") {
		return "Comprobando si el slug sigue disponible.";
	}

	if (status === "available") {
		if (savedWishlistId && savedSlug === draft.slug) {
			return "Estas reutilizando el slug de tu borrador guardado.";
		}

		return "Slug listo para publicar.";
	}

	if (status === "taken") {
		return "Otro usuario ya esta usando este slug.";
	}

	if (status === "invalid") {
		return "Usa 3-60 caracteres en minusculas, numeros o guiones.";
	}

	return "El slug debe estar listo antes de publicar.";
}

export function PublishAuthGate({
	draft,
	onDismiss,
}: {
	draft?: WishlistDraft;
	onDismiss?: () => void;
}) {
	const visibleGiftCount =
		draft?.gifts.filter((gift) => !gift.hidden).length ?? 0;
	const themeLabel = resolveTheme(draft?.themeId).label;

	return (
		<WizardModal
			description="Crea una cuenta gratis para publicar tu lista, gestionarla y ver quién ha comprado; tu progreso ya está guardado."
			title={
				<>
					<span className="mb-1 block font-mono text-[11px] text-muted-foreground uppercase tracking-widest">
						Último paso
					</span>
					<span className="font-serif text-xl">
						Guarda y publica tu wishlist
					</span>
				</>
			}
		>
			{draft && (
				<Card>
					<CardContent className="flex items-center gap-3 p-3.5">
						<div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
							<Gift className="size-4" />
						</div>
						<div className="min-w-0">
							<p className="truncate font-medium text-foreground text-sm">
								{draft.title || "Tu wishlist"}
							</p>
							<p className="text-muted-foreground text-xs">
								{visibleGiftCount}{" "}
								{visibleGiftCount === 1 ? "regalo" : "regalos"} · {themeLabel}
							</p>
						</div>
					</CardContent>
				</Card>
			)}
			<Link className={cn(buttonVariants(), "text-center")} href={SIGN_IN_HREF}>
				Iniciar sesión
			</Link>
			<Button onClick={onDismiss} type="button" variant="outline">
				Seguir editando
			</Button>
		</WizardModal>
	);
}

export function PublishReadinessCard({
	readiness,
	isReadyToPublish,
	draft,
	slugStatus,
	savedWishlistId,
	savedSlug,
}: {
	readiness: Readiness;
	isReadyToPublish: boolean;
	draft: WishlistDraft;
	slugStatus: SlugChecklistStatus;
	savedWishlistId: string | null;
	savedSlug: string | null;
}) {
	return (
		<Card>
			<CardContent className="p-5">
				<div className="flex items-center justify-between gap-3">
					<div>
						<h2 className="font-semibold text-base text-foreground">
							Checklist de publicación
						</h2>
						<p className="mt-1 text-muted-foreground text-sm">
							La lista solo se publica cuando todo está listo.
						</p>
					</div>
					<Badge variant={isReadyToPublish ? "default" : "destructive"}>
						{isReadyToPublish ? "Lista" : "Pendiente"}
					</Badge>
				</div>

				<ul className="mt-5 space-y-4">
					<ChecklistItem
						description={
							readiness.title
								? draft.title
								: "Agrega un titulo visible para tu wishlist."
						}
						label="Título"
						ready={readiness.title}
					/>
					<ChecklistItem
						description={
							readiness.eventType
								? "Ya elegiste una ocasión para la wishlist."
								: "Selecciona la ocasión de la wishlist."
						}
						label="Tipo de evento"
						ready={readiness.eventType}
					/>
					<ChecklistItem
						description={getSlugDescription({
							status: slugStatus,
							draft,
							savedWishlistId,
							savedSlug,
						})}
						label="Slug y URL"
						ready={readiness.slug}
					/>
					<ChecklistItem
						description="La publicación usa Español por defecto."
						label="Idioma"
						ready={readiness.language}
					/>
					<ChecklistItem
						description="La publicación usa PEN por defecto."
						label="Moneda"
						ready={readiness.currency}
					/>
					<ChecklistItem
						description={
							readiness.visibleGift
								? `${readiness.visibleGiftCount} regalo(s) visible(s) listo(s) para invitados.`
								: "Necesitas al menos un regalo visible."
						}
						label="Regalos visibles"
						ready={readiness.visibleGift}
					/>
				</ul>
			</CardContent>
		</Card>
	);
}

export function PublishActionsCard({
	ownerPreviewHref,
	isSubmitting,
	isReadyToPublish,
	isSignedIn,
	onPublish,
	errorMessage,
}: {
	ownerPreviewHref: string | null;
	isSubmitting: boolean;
	isReadyToPublish: boolean;
	isSignedIn: boolean | undefined;
	onPublish: () => void;
	errorMessage: string | null;
}) {
	return (
		<Card>
			<CardContent className="p-5">
				<h2 className="font-semibold text-base text-foreground">
					Acciones finales
				</h2>
				<p className="mt-1 text-muted-foreground text-sm">
					Puedes abrir la vista completa del borrador guardado antes de
					publicar.
				</p>

				<div className="mt-5 space-y-3">
					{ownerPreviewHref ? (
						<a
							className={cn(
								buttonVariants({ variant: "outline" }),
								"min-h-11 w-full",
							)}
							href={ownerPreviewHref}
							rel="noreferrer"
							target="_blank"
						>
							<ExternalLink className="size-4" />
							Abrir vista completa
						</a>
					) : (
						<div className="rounded-lg border border-border border-dashed px-4 py-3 text-muted-foreground text-sm">
							Guarda un borrador si quieres abrir la vista completa en una
							pestaña aparte.
						</div>
					)}

					<Button
						className="min-h-11 w-full"
						disabled={isSubmitting}
						onClick={onPublish}
						type="button"
						variant={
							isReadyToPublish && !isSubmitting ? "default" : "secondary"
						}
					>
						{isSubmitting ? (
							<LoaderCircle className="size-4 animate-spin" />
						) : (
							<ShieldCheck className="size-4" />
						)}
						{isSignedIn ? "Publicar wishlist" : "Inicia sesión para publicar"}
					</Button>
				</div>

				{!isSignedIn && (
					<p className="mt-3 text-muted-foreground text-sm">
						Te pediremos iniciar sesión antes de publicar; tu progreso ya está
						guardado.
					</p>
				)}

				{errorMessage && (
					<div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-destructive text-sm">
						{errorMessage}
					</div>
				)}
			</CardContent>
		</Card>
	);
}

export function PublishPreviewPane({
	preview,
}: {
	preview: PublicWishlistViewModel;
}) {
	return (
		<div className="mt-8 lg:mt-0 lg:flex lg:flex-1 lg:flex-col lg:bg-background lg:px-7 lg:py-6">
			<p className="mb-4 hidden font-medium text-muted-foreground text-xs uppercase tracking-wide lg:block">
				Así lo verán tus invitados
			</p>
			<Card className="overflow-hidden lg:min-h-0 lg:flex-1">
				<CardHeader className="border-border border-b bg-muted/40 px-4 py-3">
					<CardTitle className="text-sm">Vista previa de tu wishlist</CardTitle>
					<p className="text-muted-foreground text-xs">
						Así se verá tu lista antes de volverse pública.
					</p>
				</CardHeader>
				<CardContent className="max-h-[600px] overflow-y-auto p-0 lg:h-full lg:max-h-none">
					<PublicWishlistPage mode="preview" wishlist={preview} />
				</CardContent>
			</Card>
		</div>
	);
}

export function PublishSuccessPanel({
	publishedUrl,
	dashboardUrlPath,
	whatsAppUrl,
	onCopyLink,
	onDownloadQr,
	isDownloadingQr,
}: {
	publishedUrl: string;
	dashboardUrlPath: string;
	whatsAppUrl: string;
	onCopyLink: () => void;
	onDownloadQr: () => void;
	isDownloadingQr: boolean;
}) {
	return (
		<div className="mx-auto w-full max-w-md text-center">
			<div className="mx-auto flex size-[60px] items-center justify-center rounded-full bg-accent text-accent-foreground">
				<PartyPopper className="size-[30px]" />
			</div>
			<h1 className="mt-4 font-semibold font-serif text-[26px] text-foreground">
				¡Tu wishlist está publicada!
			</h1>
			<p className="mt-1.5 text-[13.5px] text-muted-foreground">
				Comparte tu enlace con tus invitados:
			</p>

			<div className="mt-4 flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2.5 text-left">
				<span className="min-w-0 flex-1 truncate font-mono font-semibold text-[12.5px] text-foreground">
					{publishedUrl}
				</span>
			</div>

			<div className="mt-3.5 grid grid-cols-1 gap-[9px] sm:grid-cols-2">
				<Button
					className="min-h-11 whitespace-normal"
					onClick={onCopyLink}
					type="button"
					variant="outline"
				>
					<Copy className="size-4 shrink-0" />
					Copiar enlace
				</Button>
				<a
					className="inline-flex min-h-11 items-center justify-center gap-2 whitespace-normal rounded-md bg-[#25D366] px-4 py-2 text-center font-medium text-sm text-white transition-colors hover:bg-[#1ebe57]"
					href={whatsAppUrl}
					rel="noreferrer"
					target="_blank"
				>
					<MessageCircle className="size-4 shrink-0" />
					Compartir por WhatsApp
				</a>
			</div>

			<Card className="mt-3.5 text-left">
				<CardContent className="flex items-center gap-3.5 p-4">
					<div className="flex size-[78px] shrink-0 items-center justify-center rounded-[10px] bg-muted">
						<QrCode className="size-8 text-muted-foreground" />
					</div>
					<div className="min-w-0 flex-1">
						<p className="font-medium text-[13px] text-foreground">Código QR</p>
						<p className="mt-[3px] text-[11.5px] text-muted-foreground leading-relaxed">
							Imprímelo en invitaciones físicas.
						</p>
						<Button
							className="mt-2 min-h-9 w-full"
							disabled={isDownloadingQr}
							onClick={onDownloadQr}
							size="sm"
							type="button"
							variant="outline"
						>
							{isDownloadingQr ? (
								<LoaderCircle className="size-4 animate-spin" />
							) : (
								<QrCode className="size-4" />
							)}
							Descargar QR
						</Button>
					</div>
				</CardContent>
			</Card>

			<div className="mt-4 flex flex-col gap-2 sm:flex-row">
				<a
					className={cn(buttonVariants(), "min-h-11 flex-1")}
					href={publishedUrl}
					rel="noreferrer"
					target="_blank"
				>
					<ExternalLink className="size-4" />
					Ver lista pública
				</a>
				<Link
					className={cn(
						buttonVariants({ variant: "outline" }),
						"min-h-11 flex-1",
					)}
					href={dashboardUrlPath}
				>
					<ShieldCheck className="size-4" />
					Gestionar en dashboard
				</Link>
			</div>
		</div>
	);
}

export function PublishStep() {
	const draft = useWizardStore((state) => state.draft);
	const savedWishlistId = useWizardStore((state) => state.savedWishlistId);
	const savedSlug = useWizardStore((state) => state.savedSlug);
	const lastSavedAt = useWizardStore((state) => state.lastSavedAt);
	const publishSuccess = useWizardStore((state) => state.publishSuccess);
	const replaceDraft = useWizardStore((state) => state.replaceDraft);
	const clearSavedDraftMetadata = useWizardStore(
		(state) => state.clearSavedDraftMetadata,
	);
	const completePublish = useWizardStore((state) => state.completePublish);
	const { isSignedIn } = useUser();
	const utils = api.useUtils();
	const publishWizardMutation = api.wishlist.publishWizard.useMutation();

	const [slugStatus, setSlugStatus] = useState<SlugChecklistStatus>("idle");
	const [showAuthPrompt, setShowAuthPrompt] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isDownloadingQr, setIsDownloadingQr] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [conflictDraft, setConflictDraft] = useState<{
		localInput: SaveDraftWishlistInput;
		serverDraft: SaveDraftServerDraft;
	} | null>(null);
	const [mobileCtaSlot, setMobileCtaSlot] = useState<HTMLElement | null>(null);
	const [desktopCtaSlot, setDesktopCtaSlot] = useState<HTMLElement | null>(
		null,
	);

	useEffect(() => {
		setMobileCtaSlot(document.getElementById("publish-cta-slot-mobile"));
		setDesktopCtaSlot(document.getElementById("publish-cta-slot-desktop"));
	}, []);

	useEffect(() => {
		if (publishSuccess) {
			return;
		}

		if (!draft.slug.trim()) {
			setSlugStatus("idle");
			return;
		}

		if (!isValidSlug(draft.slug)) {
			setSlugStatus("invalid");
			return;
		}

		let cancelled = false;

		setSlugStatus("checking");

		void utils.wishlist.checkSlugAvailability
			.fetch({
				slug: draft.slug,
				excludeWishlistId: savedWishlistId ?? undefined,
			})
			.then((result) => {
				if (cancelled) {
					return;
				}

				if (result.available) {
					setSlugStatus("available");
					return;
				}

				setSlugStatus(result.reason === "invalid" ? "invalid" : "taken");
			})
			.catch(() => {
				if (!cancelled) {
					setSlugStatus("idle");
				}
			});

		return () => {
			cancelled = true;
		};
	}, [
		draft.slug,
		publishSuccess,
		savedWishlistId,
		utils.wishlist.checkSlugAvailability,
	]);

	const readiness = useMemo(() => {
		const visibleGiftCount = draft.gifts.filter((gift) => !gift.hidden).length;

		return {
			title: draft.title.trim().length > 0,
			eventType: draft.eventType !== null,
			slug: slugStatus === "available",
			language: true,
			currency: true,
			visibleGift: visibleGiftCount > 0,
			visibleGiftCount,
		};
	}, [draft, slugStatus]);

	const isReadyToPublish =
		readiness.title &&
		readiness.eventType &&
		readiness.slug &&
		readiness.language &&
		readiness.currency &&
		readiness.visibleGift;

	const previewViewModel = useMemo(() => draftToPreview(draft), [draft]);
	const ownerPreviewHref =
		savedWishlistId && savedSlug ? `/w/${savedSlug}` : null;
	const publishedUrl = publishSuccess
		? toCanonicalWishlistUrl(publishSuccess.publicUrlPath)
		: null;

	const persistPublish = async (input: SaveDraftWishlistInput) => {
		setIsSubmitting(true);
		setErrorMessage(null);

		try {
			const result = await publishWizardMutation.mutateAsync(input);

			if (result.status === "conflict") {
				setConflictDraft({
					localInput: input,
					serverDraft: result.serverDraft,
				});
				return;
			}

			completePublish({
				wishlistId: result.wishlistId,
				slug: result.slug,
				publicUrlPath: result.publicUrlPath,
				dashboardUrlPath: result.dashboardUrlPath,
			});
			clearPersistedWishlistWizardDraft();
			setConflictDraft(null);
			toast.success("Wishlist publicada");
		} catch (error) {
			if (isNotFoundError(error)) {
				clearSavedDraftMetadata();
				setErrorMessage(
					"El borrador guardado ya no existe en tu cuenta. Guarda uno nuevo o vuelve a publicar.",
				);
				return;
			}

			if (isPreconditionError(error)) {
				setErrorMessage(
					"Tu wishlist aun no cumple todos los requisitos para publicarse.",
				);
				return;
			}

			setErrorMessage(getErrorMessage(error));
		} finally {
			setIsSubmitting(false);
		}
	};

	const handlePublishClick = async () => {
		if (isSubmitting) {
			return;
		}

		if (!isReadyToPublish) {
			setErrorMessage("Completa la checklist antes de publicar.");
			return;
		}

		if (!isSignedIn) {
			setShowAuthPrompt(true);
			return;
		}

		await persistPublish(
			draftToSaveDraftInput(draft, {
				savedWishlistId,
				lastSavedAt,
			}),
		);
	};

	const handleUseServerVersion = () => {
		if (!conflictDraft) {
			return;
		}

		const mapped = serverDraftToLocalDraft(conflictDraft.serverDraft);
		replaceDraft(mapped.draft, {
			savedWishlistId: mapped.savedWishlistId,
			savedSlug: mapped.draft.slug,
			lastSavedAt: mapped.lastSavedAt,
		});
		setConflictDraft(null);
	};

	const handleOverwrite = async () => {
		if (!conflictDraft || isSubmitting) {
			return;
		}

		await persistPublish({
			...conflictDraft.localInput,
			force: true,
		});
	};

	const handleCopyLink = async () => {
		if (!publishedUrl) {
			return;
		}

		try {
			await navigator.clipboard.writeText(publishedUrl);
			toast.success("Enlace copiado");
		} catch {
			toast.error("No se pudo copiar el enlace");
		}
	};

	const handleDownloadQr = async () => {
		if (!publishedUrl || isDownloadingQr) {
			return;
		}

		setIsDownloadingQr(true);

		try {
			await downloadQrCodePng({
				text: publishedUrl,
				fileName: `${publishSuccess?.slug ?? "wishlist"}-qr.png`,
			});
			toast.success("QR descargado");
		} catch {
			toast.error("No se pudo generar el QR");
		} finally {
			setIsDownloadingQr(false);
		}
	};

	const publishButtonNode = (
		<Button
			className="min-h-11 px-8 py-[13px]"
			disabled={isSubmitting}
			onClick={handlePublishClick}
			type="button"
			variant={isReadyToPublish && !isSubmitting ? "default" : "secondary"}
		>
			{isSubmitting ? (
				<LoaderCircle className="size-4 animate-spin" />
			) : (
				<ShieldCheck className="size-4" />
			)}
			{isSignedIn ? "Publicar wishlist" : "Inicia sesión para publicar"}
		</Button>
	);

	if (publishSuccess && publishedUrl) {
		return (
			<div className="mx-auto flex w-full max-w-4xl items-center justify-center px-4 py-10 lg:h-full lg:bg-background lg:px-10">
				<PublishSuccessPanel
					dashboardUrlPath={publishSuccess.dashboardUrlPath}
					isDownloadingQr={isDownloadingQr}
					onCopyLink={handleCopyLink}
					onDownloadQr={handleDownloadQr}
					publishedUrl={publishedUrl}
					whatsAppUrl={toWhatsAppShareUrl(publishedUrl, draft.eventType)}
				/>
			</div>
		);
	}

	return (
		<>
			<div className="mx-auto w-full max-w-5xl lg:flex lg:h-full lg:max-w-none">
				<div className="lg:w-[480px] lg:shrink-0 lg:overflow-y-auto lg:border-border lg:border-r lg:px-8 lg:py-7">
					<p className="mb-2 font-medium text-muted-foreground text-xs uppercase tracking-wide">
						Paso 5 de 5
					</p>
					<h1 className="mb-2 text-center font-semibold text-2xl text-foreground lg:text-left lg:font-serif lg:text-3xl">
						Revisa y publica tu wishlist
					</h1>
					<p className="mb-8 text-center text-muted-foreground text-sm lg:text-left">
						Valida lo importante, mira la vista final y publícala cuando esté
						lista.
					</p>

					<div className="space-y-6">
						<PublishReadinessCard
							draft={draft}
							isReadyToPublish={isReadyToPublish}
							readiness={readiness}
							savedSlug={savedSlug}
							savedWishlistId={savedWishlistId}
							slugStatus={slugStatus}
						/>

						<PublishActionsCard
							errorMessage={errorMessage}
							isReadyToPublish={isReadyToPublish}
							isSignedIn={isSignedIn}
							isSubmitting={isSubmitting}
							onPublish={handlePublishClick}
							ownerPreviewHref={ownerPreviewHref}
						/>
					</div>
				</div>

				{mobileCtaSlot && createPortal(publishButtonNode, mobileCtaSlot)}
				{desktopCtaSlot && createPortal(publishButtonNode, desktopCtaSlot)}

				<PublishPreviewPane preview={previewViewModel} />
			</div>

			{showAuthPrompt && (
				<PublishAuthGate
					draft={draft}
					onDismiss={() => setShowAuthPrompt(false)}
				/>
			)}

			{conflictDraft && (
				<WizardModal
					description="Este borrador fue actualizado desde el dashboard después de tu último guardado."
					title="Hay una versión más reciente"
				>
					<Button onClick={handleUseServerVersion} type="button">
						Usar versión del dashboard
					</Button>
					<Button
						disabled={isSubmitting}
						onClick={handleOverwrite}
						type="button"
						variant="outline"
					>
						Continuar con este borrador local
					</Button>
				</WizardModal>
			)}
		</>
	);
}
