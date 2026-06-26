"use client";

import { useState } from "react";
import { GiftForm } from "@/components/features/wishlist/gift-form";
import type { DraftGift } from "@/stores/wishlist-wizard.store";
import { useWizardStore } from "./wizard-provider";

type GiftFormValues = Omit<DraftGift, "id" | "sortOrder">;

type EditingState = { type: "adding" } | { type: "editing"; id: string } | null;

const PRIORITY_LABELS: Record<string, string> = {
	high: "Alta",
	medium: "Media",
	low: "Baja",
};

export function GiftsStep() {
	const draft = useWizardStore((s) => s.draft);
	const addGift = useWizardStore((s) => s.addGift);
	const updateGift = useWizardStore((s) => s.updateGift);
	const removeGift = useWizardStore((s) => s.removeGift);

	const [editing, setEditing] = useState<EditingState>(null);

	const visibleGifts = draft.gifts.filter((g) => !g.hidden);
	const hiddenCount = draft.gifts.length - visibleGifts.length;

	function handleAdd(values: GiftFormValues) {
		addGift(values);
		setEditing(null);
	}

	function handleUpdate(id: string, values: GiftFormValues) {
		updateGift(id, values);
		setEditing(null);
	}

	function getInitialValues(gift: DraftGift): GiftFormValues {
		const { id: _id, sortOrder: _sortOrder, ...rest } = gift;
		return rest;
	}

	return (
		<div className="mx-auto w-full max-w-2xl px-4 py-8">
			<h1 className="mb-2 text-center font-semibold text-2xl text-gray-900">
				Regalos
			</h1>
			<p className="mb-8 text-center text-gray-500 text-sm">
				Agrega los regalos que deseas recibir
			</p>

			{/* URL import placeholder */}
			<div className="mb-6 flex items-center justify-between rounded-lg border border-gray-200 border-dashed bg-gray-50 px-4 py-3">
				<div>
					<p className="font-medium text-gray-700 text-sm">
						Importar desde URL
					</p>
					<p className="text-gray-400 text-xs">Disponible próximamente</p>
				</div>
				<button
					className="cursor-not-allowed rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-gray-400 text-sm opacity-50"
					disabled
					type="button"
				>
					Importar
				</button>
			</div>

			{/* Gift list */}
			{draft.gifts.length > 0 && (
				<div className="mb-6 space-y-3">
					{draft.gifts.map((gift) => {
						if (editing?.type === "editing" && editing.id === gift.id) {
							return (
								<div
									className="rounded-2xl border border-gray-200 bg-white p-4"
									key={gift.id}
								>
									<p className="mb-4 font-medium text-gray-900 text-sm">
										Editar regalo
									</p>
									<GiftForm
										categories={draft.categories}
										initialValues={getInitialValues(gift)}
										onCancel={() => setEditing(null)}
										onSubmit={(values) => handleUpdate(gift.id, values)}
										submitLabel="Actualizar regalo"
									/>
								</div>
							);
						}

						return (
							<div
								className={[
									"flex items-start gap-3 rounded-2xl border p-4",
									gift.hidden
										? "border-gray-100 bg-gray-50 opacity-60"
										: "border-gray-200 bg-white",
								].join(" ")}
								key={gift.id}
							>
								<div className="min-w-0 flex-1">
									<div className="flex items-center gap-2">
										<p
											className={[
												"font-medium text-sm",
												gift.hidden ? "text-gray-400" : "text-gray-900",
											].join(" ")}
										>
											{gift.name}
										</p>
										{gift.hidden && (
											<span className="rounded-full bg-gray-100 px-2 py-0.5 text-gray-500 text-xs">
												Oculto
											</span>
										)}
									</div>
									<div className="mt-1 flex flex-wrap gap-2 text-gray-400 text-xs">
										{gift.category && <span>{gift.category}</span>}
										{gift.priceAmount != null && (
											<span>S/ {gift.priceAmount}</span>
										)}
										{gift.quantityNeeded > 1 && (
											<span>×{gift.quantityNeeded}</span>
										)}
										<span>
											{PRIORITY_LABELS[gift.priority] ?? gift.priority}
										</span>
									</div>
								</div>
								<div className="flex shrink-0 gap-2">
									<button
										className="text-gray-400 text-xs hover:text-gray-700"
										onClick={() => setEditing({ type: "editing", id: gift.id })}
										type="button"
									>
										Editar
									</button>
									<button
										className="text-red-400 text-xs hover:text-red-600"
										onClick={() => removeGift(gift.id)}
										type="button"
									>
										Eliminar
									</button>
								</div>
							</div>
						);
					})}
				</div>
			)}

			{hiddenCount > 0 && (
				<p className="mb-4 text-center text-gray-400 text-xs">
					{hiddenCount}{" "}
					{hiddenCount === 1 ? "regalo oculto" : "regalos ocultos"} (no aparecen
					en la vista pública)
				</p>
			)}

			{/* Add gift form or button */}
			{editing?.type === "adding" ? (
				<div className="rounded-2xl border border-gray-200 bg-white p-4">
					<p className="mb-4 font-medium text-gray-900 text-sm">Nuevo regalo</p>
					<GiftForm
						categories={draft.categories}
						onCancel={() => setEditing(null)}
						onSubmit={handleAdd}
					/>
				</div>
			) : (
				<button
					className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-gray-200 border-dashed py-4 text-gray-500 text-sm transition-colors hover:border-gray-400 hover:text-gray-700"
					onClick={() => setEditing({ type: "adding" })}
					type="button"
				>
					<span aria-hidden>+</span> Agregar regalo
				</button>
			)}

			{visibleGifts.length === 0 && draft.gifts.length === 0 && (
				<p className="mt-6 text-center text-gray-400 text-sm">
					Todavía no tienes regalos. La vista previa mostrará ejemplos hasta que
					agregues el primero.
				</p>
			)}
		</div>
	);
}
