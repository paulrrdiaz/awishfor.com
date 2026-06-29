"use client";

import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
	draftToSaveDraftInput,
	serverDraftToLocalDraft,
} from "@/lib/wishlist/save-draft";
import type {
	SaveDraftServerDraft,
	SaveDraftWishlistInput,
} from "@/server/validators/wishlist-save-draft.schema";
import { api } from "@/trpc/react";
import { WizardModal } from "./wizard-modal";
import { useWizardStore } from "./wizard-provider";

const SIGN_IN_HREF = "/sign-in?redirect_url=%2Fcreate";

const isNotFoundError = (error: unknown) =>
	typeof error === "object" &&
	error !== null &&
	"data" in error &&
	typeof error.data === "object" &&
	error.data !== null &&
	"code" in error.data &&
	error.data.code === "NOT_FOUND";

const getErrorMessage = (error: unknown) =>
	error instanceof Error && error.message
		? error.message
		: "No se pudo guardar el borrador";

export function SaveDraftControls() {
	const draft = useWizardStore((state) => state.draft);
	const savedWishlistId = useWizardStore((state) => state.savedWishlistId);
	const lastSavedAt = useWizardStore((state) => state.lastSavedAt);
	const replaceDraft = useWizardStore((state) => state.replaceDraft);
	const setSavedDraftMetadata = useWizardStore(
		(state) => state.setSavedDraftMetadata,
	);
	const clearSavedDraftMetadata = useWizardStore(
		(state) => state.clearSavedDraftMetadata,
	);
	const { isSignedIn } = useUser();
	const saveDraftMutation = api.wishlist.saveDraft.useMutation();

	const [isSubmitting, setIsSubmitting] = useState(false);
	const [showAuthPrompt, setShowAuthPrompt] = useState(false);
	const [conflictDraft, setConflictDraft] = useState<{
		localInput: SaveDraftWishlistInput;
		serverDraft: SaveDraftServerDraft;
	} | null>(null);
	const [saveAsNewInput, setSaveAsNewInput] =
		useState<SaveDraftWishlistInput | null>(null);

	const saveMetadata = useMemo(
		() => ({
			savedWishlistId,
			lastSavedAt,
		}),
		[savedWishlistId, lastSavedAt],
	);

	const persistSave = async (input: SaveDraftWishlistInput) => {
		setIsSubmitting(true);

		try {
			const result = await saveDraftMutation.mutateAsync(input);

			if (result.status === "conflict") {
				setConflictDraft({
					localInput: input,
					serverDraft: result.serverDraft,
				});
				return;
			}

			setSavedDraftMetadata(result.wishlistId, result.lastSavedAt, input.slug);
			setConflictDraft(null);
			setSaveAsNewInput(null);
			toast.success("Borrador guardado");
		} catch (error) {
			if (isNotFoundError(error)) {
				clearSavedDraftMetadata();
				setSaveAsNewInput({
					...input,
					savedWishlistId: null,
					lastSavedAt: null,
					force: false,
				});
				return;
			}

			toast.error(getErrorMessage(error));
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleSaveClick = async () => {
		if (isSubmitting) return;

		if (!isSignedIn) {
			setShowAuthPrompt(true);
			return;
		}

		await persistSave(draftToSaveDraftInput(draft, saveMetadata));
	};

	const handleUseServerVersion = () => {
		if (!conflictDraft) return;

		const mapped = serverDraftToLocalDraft(conflictDraft.serverDraft);
		replaceDraft(mapped.draft, {
			savedWishlistId: mapped.savedWishlistId,
			savedSlug: mapped.draft.slug,
			lastSavedAt: mapped.lastSavedAt,
		});
		setConflictDraft(null);
	};

	const handleOverwrite = async () => {
		if (!conflictDraft || isSubmitting) return;

		await persistSave({
			...conflictDraft.localInput,
			force: true,
		});
	};

	const handleSaveAsNew = async () => {
		if (!saveAsNewInput || isSubmitting) return;

		await persistSave(saveAsNewInput);
	};

	return (
		<>
			<div className="flex items-center gap-3">
				<Button
					disabled={isSubmitting}
					onClick={handleSaveClick}
					type="button"
					variant="outline"
				>
					{isSubmitting ? "Guardando…" : "Guardar borrador"}
				</Button>

				{savedWishlistId && (
					<Link
						className="text-muted-foreground text-sm underline underline-offset-4 hover:text-foreground"
						href="/dashboard"
					>
						Ver en dashboard
					</Link>
				)}
			</div>

			{showAuthPrompt && (
				<WizardModal
					description="Inicia sesión para guardar este borrador en tu cuenta sin perder lo que ya avanzaste aquí."
					title="Guarda tu borrador en tu cuenta"
				>
					<Link
						className={cn(buttonVariants(), "text-center")}
						href={SIGN_IN_HREF}
					>
						Iniciar sesión
					</Link>
					<Button
						onClick={() => setShowAuthPrompt(false)}
						type="button"
						variant="outline"
					>
						Seguir editando
					</Button>
				</WizardModal>
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

			{saveAsNewInput && (
				<WizardModal
					description="El ID guardado en este navegador ya no existe para tu cuenta actual. Puedes guardar este contenido como un borrador nuevo."
					title="Guarda este borrador como nuevo"
				>
					<Button
						disabled={isSubmitting}
						onClick={handleSaveAsNew}
						type="button"
					>
						Guardar como nuevo
					</Button>
					<Button
						onClick={() => setSaveAsNewInput(null)}
						type="button"
						variant="outline"
					>
						Cancelar
					</Button>
				</WizardModal>
			)}
		</>
	);
}
