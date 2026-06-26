"use client";

import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { type ReactNode, useMemo, useState } from "react";
import { toast } from "sonner";
import {
	draftToSaveDraftInput,
	serverDraftToLocalDraft,
} from "@/lib/wishlist/save-draft";
import type {
	SaveDraftServerDraft,
	SaveDraftWishlistInput,
} from "@/server/validators/wishlist-save-draft.schema";
import { api } from "@/trpc/react";
import { useWizardStore } from "./wizard-provider";

const SIGN_IN_HREF = "/sign-in?redirect_url=%2Fcreate";

function Modal({
	title,
	description,
	children,
}: {
	title: string;
	description: string;
	children: ReactNode;
}) {
	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/40 px-4">
			<div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
				<h2 className="font-semibold text-gray-900 text-lg">{title}</h2>
				<p className="mt-2 text-gray-600 text-sm">{description}</p>
				<div className="mt-6 flex flex-col gap-3">{children}</div>
			</div>
		</div>
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

			setSavedDraftMetadata(result.wishlistId, result.lastSavedAt);
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

			toast.error("No se pudo guardar el borrador");
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
				<button
					className={[
						"rounded-lg border px-4 py-2 text-sm transition-colors",
						isSubmitting
							? "cursor-wait border-gray-200 bg-gray-100 text-gray-400"
							: "border-gray-200 text-gray-700 hover:bg-gray-50",
					].join(" ")}
					disabled={isSubmitting}
					onClick={handleSaveClick}
					type="button"
				>
					{isSubmitting ? "Guardando…" : "Guardar borrador"}
				</button>

				{savedWishlistId && (
					<Link
						className="text-gray-600 text-sm underline underline-offset-4 hover:text-gray-900"
						href="/dashboard"
					>
						Ver en dashboard
					</Link>
				)}
			</div>

			{showAuthPrompt && (
				<Modal
					description="Inicia sesión para guardar este borrador en tu cuenta sin perder lo que ya avanzaste aquí."
					title="Guarda tu borrador en tu cuenta"
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
				</Modal>
			)}

			{conflictDraft && (
				<Modal
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
				</Modal>
			)}

			{saveAsNewInput && (
				<Modal
					description="El ID guardado en este navegador ya no existe para tu cuenta actual. Puedes guardar este contenido como un borrador nuevo."
					title="Guarda este borrador como nuevo"
				>
					<button
						className="rounded-lg bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-800"
						disabled={isSubmitting}
						onClick={handleSaveAsNew}
						type="button"
					>
						Guardar como nuevo
					</button>
					<button
						className="rounded-lg border border-gray-200 px-4 py-2 text-gray-700 text-sm hover:bg-gray-50"
						onClick={() => setSaveAsNewInput(null)}
						type="button"
					>
						Cancelar
					</button>
				</Modal>
			)}
		</>
	);
}
