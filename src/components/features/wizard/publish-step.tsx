"use client";

import { useUser } from "@clerk/nextjs";
import {
	CheckCircle2,
	CircleAlert,
	Copy,
	ExternalLink,
	LoaderCircle,
	MessageCircle,
	QrCode,
	ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { PublicWishlistPage } from "@/components/layouts/public-wishlist/public-wishlist-page";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

type SlugChecklistStatus =
	| "idle"
	| "checking"
	| "available"
	| "taken"
	| "invalid";

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

export function PublishAuthGate({ onDismiss }: { onDismiss?: () => void }) {
	return (
		<WizardModal
			description="Inicia sesión para publicar tu wishlist; tu progreso ya está guardado."
			title="Publica desde tu cuenta"
		>
			<Link className={cn(buttonVariants(), "text-center")} href={SIGN_IN_HREF}>
				Iniciar sesión
			</Link>
			<Button onClick={onDismiss} type="button" variant="outline">
				Seguir editando
			</Button>
		</WizardModal>
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

	if (publishSuccess && publishedUrl) {
		return (
			<div className="mx-auto w-full max-w-4xl">
				<Card className="border-primary/30 bg-primary/10">
					<CardContent className="p-6">
						<div className="flex items-start gap-3">
							<CheckCircle2 className="mt-0.5 size-6 text-primary" />
							<div>
								<h1 className="font-semibold text-2xl text-foreground">
									¡Tu wishlist está publicada!
								</h1>
								<p className="mt-2 text-muted-foreground text-sm">
									Comparte tu enlace con tus invitados desde aquí mismo.
								</p>
							</div>
						</div>

						<Card className="mt-6 border-primary/30">
							<CardContent className="p-4">
								<p className="text-muted-foreground text-xs uppercase tracking-wide">
									Enlace público
								</p>
								<p className="mt-2 break-all font-medium text-foreground text-sm">
									{publishedUrl}
								</p>
							</CardContent>
						</Card>

						<div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
							<Button
								className="min-h-11"
								onClick={handleCopyLink}
								type="button"
								variant="outline"
							>
								<Copy className="size-4" />
								Copiar enlace
							</Button>
							<a
								className={cn(
									buttonVariants({ variant: "outline" }),
									"min-h-11",
								)}
								href={toWhatsAppShareUrl(publishedUrl, draft.eventType)}
								rel="noreferrer"
								target="_blank"
							>
								<MessageCircle className="size-4" />
								Compartir por WhatsApp
							</a>
							<Button
								className="min-h-11"
								disabled={isDownloadingQr}
								onClick={handleDownloadQr}
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
							<a
								className={cn(buttonVariants(), "min-h-11")}
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
									"min-h-11",
								)}
								href={publishSuccess.dashboardUrlPath}
							>
								<ShieldCheck className="size-4" />
								Gestionar en dashboard
							</Link>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<>
			<div className="mx-auto w-full max-w-6xl">
				<div className="mb-8 text-center">
					<h1 className="font-semibold text-2xl text-foreground">
						Revisa y publica tu wishlist
					</h1>
					<p className="mt-2 text-muted-foreground text-sm">
						Valida lo importante, mira la vista final y publícala cuando esté
						lista.
					</p>
				</div>

				<div className="grid grid-cols-1 gap-8 lg:grid-cols-[320px_1fr]">
					<div className="space-y-6">
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
											Guarda un borrador si quieres abrir la vista completa en
											una pestaña aparte.
										</div>
									)}

									<Button
										className="min-h-11 w-full"
										disabled={isSubmitting}
										onClick={handlePublishClick}
										type="button"
										variant={
											isReadyToPublish && !isSubmitting
												? "default"
												: "secondary"
										}
									>
										{isSubmitting ? (
											<LoaderCircle className="size-4 animate-spin" />
										) : (
											<ShieldCheck className="size-4" />
										)}
										{isSignedIn
											? "Publicar wishlist"
											: "Inicia sesión para publicar"}
									</Button>
								</div>

								{!isSignedIn && (
									<p className="mt-3 text-muted-foreground text-sm">
										Te pediremos iniciar sesión antes de publicar; tu progreso
										ya está guardado.
									</p>
								)}

								{errorMessage && (
									<div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-destructive text-sm">
										{errorMessage}
									</div>
								)}
							</CardContent>
						</Card>
					</div>

					<Card className="overflow-hidden">
						<CardHeader className="border-border border-b bg-muted/40 px-4 py-3">
							<CardTitle className="text-sm">
								Vista previa de tu wishlist
							</CardTitle>
							<p className="text-muted-foreground text-xs">
								Así se verá tu lista antes de volverse pública.
							</p>
						</CardHeader>
						<CardContent className="max-h-[780px] overflow-y-auto p-0">
							<PublicWishlistPage mode="preview" wishlist={previewViewModel} />
						</CardContent>
					</Card>
				</div>
			</div>

			{showAuthPrompt && (
				<PublishAuthGate onDismiss={() => setShowAuthPrompt(false)} />
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
