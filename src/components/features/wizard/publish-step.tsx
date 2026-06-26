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
import { downloadQrCodePng } from "@/lib/qr";
import { isValidSlug } from "@/lib/slug";
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
						? "mt-0.5 size-4 text-green-600"
						: "mt-0.5 size-4 text-amber-600"
				}
			/>
			<div>
				<p className="font-medium text-gray-900 text-sm">{label}</p>
				<p className="text-gray-500 text-sm">{description}</p>
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

			setErrorMessage(
				"No se pudo publicar tu wishlist. Revisa los datos y vuelve a intentarlo.",
			);
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
			<div className="mx-auto w-full max-w-4xl px-4 py-8">
				<div className="rounded-2xl border border-green-200 bg-green-50 p-6">
					<div className="flex items-start gap-3">
						<CheckCircle2 className="mt-0.5 size-6 text-green-600" />
						<div>
							<h1 className="font-semibold text-2xl text-gray-900">
								¡Tu wishlist está publicada!
							</h1>
							<p className="mt-2 text-gray-600 text-sm">
								Comparte tu enlace con tus invitados desde aquí mismo.
							</p>
						</div>
					</div>

					<div className="mt-6 rounded-xl border border-green-200 bg-white p-4">
						<p className="text-gray-500 text-xs uppercase tracking-wide">
							Enlace público
						</p>
						<p className="mt-2 break-all font-medium text-gray-900 text-sm">
							{publishedUrl}
						</p>
					</div>

					<div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
						<button
							className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-3 text-gray-700 text-sm hover:bg-gray-50"
							onClick={handleCopyLink}
							type="button"
						>
							<Copy className="size-4" />
							Copiar enlace
						</button>
						<a
							className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-3 text-gray-700 text-sm hover:bg-gray-50"
							href={toWhatsAppShareUrl(publishedUrl)}
							rel="noreferrer"
							target="_blank"
						>
							<MessageCircle className="size-4" />
							Compartir por WhatsApp
						</a>
						<button
							className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-3 text-gray-700 text-sm hover:bg-gray-50"
							disabled={isDownloadingQr}
							onClick={handleDownloadQr}
							type="button"
						>
							{isDownloadingQr ? (
								<LoaderCircle className="size-4 animate-spin" />
							) : (
								<QrCode className="size-4" />
							)}
							Descargar QR
						</button>
						<a
							className="flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-3 text-sm text-white hover:bg-gray-800"
							href={publishedUrl}
							rel="noreferrer"
							target="_blank"
						>
							<ExternalLink className="size-4" />
							Ver lista pública
						</a>
						<Link
							className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-3 text-gray-700 text-sm hover:bg-gray-50"
							href={publishSuccess.dashboardUrlPath}
						>
							<ShieldCheck className="size-4" />
							Gestionar en dashboard
						</Link>
					</div>
				</div>
			</div>
		);
	}

	return (
		<>
			<div className="mx-auto w-full max-w-6xl px-4 py-8">
				<div className="mb-8 text-center">
					<h1 className="font-semibold text-2xl text-gray-900">
						Revisa y publica tu wishlist
					</h1>
					<p className="mt-2 text-gray-500 text-sm">
						Valida lo importante, mira la vista final y publícala cuando esté
						lista.
					</p>
				</div>

				<div className="grid grid-cols-1 gap-8 lg:grid-cols-[320px_1fr]">
					<div className="space-y-6">
						<section className="rounded-2xl border border-gray-200 bg-white p-5">
							<div className="flex items-center justify-between gap-3">
								<div>
									<h2 className="font-semibold text-base text-gray-900">
										Checklist de publicación
									</h2>
									<p className="mt-1 text-gray-500 text-sm">
										La lista solo se publica cuando todo está listo.
									</p>
								</div>
								<span
									className={[
										"rounded-full px-3 py-1 font-medium text-xs",
										isReadyToPublish
											? "bg-green-100 text-green-700"
											: "bg-amber-100 text-amber-700",
									].join(" ")}
								>
									{isReadyToPublish ? "Lista" : "Pendiente"}
								</span>
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
						</section>

						<section className="rounded-2xl border border-gray-200 bg-white p-5">
							<h2 className="font-semibold text-base text-gray-900">
								Acciones finales
							</h2>
							<p className="mt-1 text-gray-500 text-sm">
								Puedes abrir la vista completa del borrador guardado antes de
								publicar.
							</p>

							<div className="mt-5 space-y-3">
								{ownerPreviewHref ? (
									<a
										className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-3 text-gray-700 text-sm hover:bg-gray-50"
										href={ownerPreviewHref}
										rel="noreferrer"
										target="_blank"
									>
										<ExternalLink className="size-4" />
										Abrir vista completa
									</a>
								) : (
									<div className="rounded-lg border border-gray-200 border-dashed px-4 py-3 text-gray-500 text-sm">
										Guarda un borrador si quieres abrir la vista completa en una
										pestaña aparte.
									</div>
								)}

								<button
									className={[
										"flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm transition-colors",
										isReadyToPublish && !isSubmitting
											? "bg-gray-900 text-white hover:bg-gray-800"
											: "cursor-not-allowed bg-gray-100 text-gray-400",
									].join(" ")}
									disabled={isSubmitting}
									onClick={handlePublishClick}
									type="button"
								>
									{isSubmitting ? (
										<LoaderCircle className="size-4 animate-spin" />
									) : (
										<ShieldCheck className="size-4" />
									)}
									{isSignedIn
										? "Publicar wishlist"
										: "Inicia sesión para publicar"}
								</button>
							</div>

							{!isSignedIn && (
								<p className="mt-3 text-gray-500 text-sm">
									Te pediremos iniciar sesión antes de publicar, sin perder este
									borrador local.
								</p>
							)}

							{errorMessage && (
								<div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800 text-sm">
									{errorMessage}
								</div>
							)}
						</section>
					</div>

					<div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
						<div className="border-gray-100 border-b bg-gray-50 px-4 py-3">
							<p className="font-medium text-gray-900 text-sm">
								Vista final de tu wishlist
							</p>
							<p className="text-gray-500 text-xs">
								Así se verá tu lista antes de volverse pública.
							</p>
						</div>
						<div className="max-h-[780px] overflow-y-auto">
							<PublicWishlistPage mode="preview" wishlist={previewViewModel} />
						</div>
					</div>
				</div>
			</div>

			{showAuthPrompt && (
				<WizardModal
					description="Inicia sesión para publicar tu wishlist sin perder lo que ya avanzaste en este navegador."
					title="Publica desde tu cuenta"
				>
					<Link
						className="rounded-lg bg-gray-900 px-4 py-2 text-center text-sm text-white hover:bg-gray-800"
						href={SIGN_IN_HREF}
					>
						Iniciar sesión
					</Link>
					<button
						className="rounded-lg border border-gray-200 px-4 py-2 text-gray-700 text-sm hover:bg-gray-50"
						onClick={() => setShowAuthPrompt(false)}
						type="button"
					>
						Seguir editando
					</button>
				</WizardModal>
			)}

			{conflictDraft && (
				<WizardModal
					description="Este borrador fue actualizado desde el dashboard después de tu último guardado."
					title="Hay una versión más reciente"
				>
					<button
						className="rounded-lg bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-800"
						onClick={handleUseServerVersion}
						type="button"
					>
						Usar versión del dashboard
					</button>
					<button
						className="rounded-lg border border-gray-200 px-4 py-2 text-gray-700 text-sm hover:bg-gray-50"
						disabled={isSubmitting}
						onClick={handleOverwrite}
						type="button"
					>
						Continuar con este borrador local
					</button>
				</WizardModal>
			)}
		</>
	);
}
