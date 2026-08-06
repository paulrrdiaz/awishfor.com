"use client";

import { useUser } from "@clerk/nextjs";
import {
	CheckCircle2,
	CircleAlert,
	Gift,
	LoaderCircle,
	ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { PublicWishlistPage } from "@/components/layouts/public-wishlist/public-wishlist-page";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EVENT_TYPE_PRESETS } from "@/config/event-type-presets";
import { resolveLayout } from "@/config/public-layouts";
import { resolveTheme } from "@/config/public-themes";
import { isValidSlug } from "@/lib/slug";
import { cn } from "@/lib/utils";
import { draftToPreview } from "@/lib/wishlist/draft-to-preview";
import {
	draftToSaveDraftInput,
	serverDraftToLocalDraft,
} from "@/lib/wishlist/save-draft";
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

const SIGN_IN_HREF = "/sign-in?redirect_url=%2Fcreate%3Fstep%3Dreview";

const EYEBROW = "font-mono text-[11px] font-medium uppercase tracking-[0.14em]";
const CARD = "rounded-[14px] border border-border bg-card p-[18px]";

export type SlugChecklistStatus =
	| "idle"
	| "checking"
	| "available"
	| "taken"
	| "invalid";

export type Readiness = {
	nameAndOccasion: boolean;
	coverImages: boolean;
	layoutAndTheme: boolean;
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
		<li className="flex items-start gap-2">
			<Icon
				className={cn(
					"mt-0.5 size-4 shrink-0",
					ready ? "text-status-published-foreground" : "text-[#C0554E]",
				)}
			/>
			<div>
				<p className="font-semibold text-[13px] text-foreground">{label}</p>
				<p className="text-[11.5px] text-muted-foreground">{description}</p>
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

function getNameAndOccasionDescription({
	draft,
	slugStatus,
}: {
	draft: WishlistDraft;
	slugStatus: SlugChecklistStatus;
}) {
	if (!draft.title.trim()) {
		return "Agrega un título visible para tu wishlist.";
	}
	if (!draft.eventType) {
		return "Selecciona la ocasión de la wishlist.";
	}
	if (!draft.slug.trim()) {
		return "Define la URL pública de tu wishlist.";
	}
	if (slugStatus === "checking") {
		return "Comprobando si el slug sigue disponible.";
	}
	if (slugStatus === "taken") {
		return "Otro usuario ya está usando este slug.";
	}
	if (slugStatus === "invalid") {
		return "Usa 3-60 caracteres en minúsculas, números o guiones.";
	}
	if (slugStatus !== "available") {
		return "El slug debe estar listo antes de publicar.";
	}

	return `${draft.title} · ${EVENT_TYPE_PRESETS[draft.eventType].label}`;
}

function getCoverImagesDescription(draft: WishlistDraft) {
	const layout = resolveLayout(draft.layoutId);
	const count = draft.images.length;

	if (count >= layout.heroImageSlots) {
		return `${count} de ${layout.heroImageSlots} fotos listas para "${layout.label}".`;
	}

	const missing = layout.heroImageSlots - count;
	return `Te faltan ${missing} ${missing === 1 ? "foto" : "fotos"} para "${layout.label}".`;
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
}: {
	readiness: Readiness;
	isReadyToPublish: boolean;
	draft: WishlistDraft;
	slugStatus: SlugChecklistStatus;
}) {
	const layout = resolveLayout(draft.layoutId);
	const theme = resolveTheme(draft.themeId);

	return (
		<div className={CARD}>
			<div className="mb-2 flex items-center justify-between gap-3">
				<span className="font-semibold text-[14px] text-foreground">
					Checklist de publicación
				</span>
				<Badge
					className={
						isReadyToPublish ? undefined : "bg-[#FBF1DC] text-[#8A6512]"
					}
					variant={isReadyToPublish ? "published" : "secondary"}
				>
					{isReadyToPublish ? "Lista" : "Pendiente"}
				</Badge>
			</div>
			<p className="mb-3.5 text-[11.5px] text-muted-foreground">
				La lista solo se publica cuando todo está listo.
			</p>

			<ul className="flex flex-col gap-[11px]">
				<ChecklistItem
					description={getNameAndOccasionDescription({ draft, slugStatus })}
					label="Nombre y ocasión"
					ready={readiness.nameAndOccasion}
				/>
				<ChecklistItem
					description={getCoverImagesDescription(draft)}
					label="Fotos de portada"
					ready={readiness.coverImages}
				/>
				<ChecklistItem
					description={`${layout.label} · ${theme.label}`}
					label="Disposición y tema"
					ready={readiness.layoutAndTheme}
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
		</div>
	);
}

export function PublishPreviewPane({
	preview,
}: {
	preview: PublicWishlistViewModel;
}) {
	return (
		<div className="mt-8 lg:mt-0 lg:flex lg:flex-1 lg:flex-col lg:px-8 lg:py-8">
			<p
				className={cn(EYEBROW, "mb-3.5 hidden text-muted-foreground lg:block")}
			>
				Así lo verán tus invitados
			</p>
			<div className="flex flex-col overflow-hidden rounded-[18px] border border-border bg-card lg:min-h-0 lg:flex-1">
				<div className="max-h-[600px] overflow-y-auto lg:h-full lg:max-h-none">
					<PublicWishlistPage mode="preview" wishlist={preview} />
				</div>
			</div>
		</div>
	);
}

export function ReviewStep() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const draft = useWizardStore((state) => state.draft);
	const savedWishlistId = useWizardStore((state) => state.savedWishlistId);
	const lastSavedAt = useWizardStore((state) => state.lastSavedAt);
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
	}, [draft.slug, savedWishlistId, utils.wishlist.checkSlugAvailability]);

	const readiness = useMemo<Readiness>(() => {
		const visibleGiftCount = draft.gifts.filter((gift) => !gift.hidden).length;
		const layout = resolveLayout(draft.layoutId);

		return {
			nameAndOccasion:
				draft.title.trim().length > 0 &&
				draft.eventType !== null &&
				slugStatus === "available",
			coverImages: draft.images.length >= layout.heroImageSlots,
			layoutAndTheme: true,
			visibleGift: visibleGiftCount > 0,
			visibleGiftCount,
		};
	}, [draft, slugStatus]);

	const isReadyToPublish =
		readiness.nameAndOccasion &&
		readiness.coverImages &&
		readiness.layoutAndTheme &&
		readiness.visibleGift;

	const previewViewModel = useMemo(() => draftToPreview(draft), [draft]);

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

			const params = new URLSearchParams(searchParams.toString());
			params.set("step", "published");
			router.push(`?${params.toString()}`);
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

	const publishButtonNode = (
		<Button
			className={cn(
				"min-h-11 rounded-full px-8 py-[13px]",
				isReadyToPublish &&
					!isSubmitting &&
					"bg-foreground text-white hover:bg-foreground/90",
			)}
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

	return (
		<>
			<div className="mx-auto w-full max-w-5xl lg:flex lg:h-full lg:max-w-none">
				<div className="lg:w-[420px] lg:shrink-0 lg:overflow-y-auto lg:border-border lg:border-r lg:px-8 lg:py-8">
					<h1 className="mb-2 text-center font-semibold text-2xl text-foreground lg:mb-1.5 lg:text-left lg:font-serif lg:text-[24px]">
						Revisa y publica tu wishlist
					</h1>
					<p className="mb-8 text-center text-muted-foreground text-sm lg:mb-[18px] lg:text-left lg:text-[12.5px]">
						Valida lo importante, mira la vista final y publícala cuando esté
						lista.
					</p>

					<div className="flex flex-col gap-3.5">
						<PublishReadinessCard
							draft={draft}
							isReadyToPublish={isReadyToPublish}
							readiness={readiness}
							slugStatus={slugStatus}
						/>

						{errorMessage && (
							<div className="rounded-[10px] border border-destructive/30 bg-destructive/10 px-3.5 py-3 text-[12.5px] text-destructive">
								{errorMessage}
							</div>
						)}
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
