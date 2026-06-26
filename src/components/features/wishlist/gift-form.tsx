"use client";

import { useState } from "react";
import type { GiftPriority } from "@/generated/prisma/enums";
import type { DraftGift } from "@/stores/wishlist-wizard.store";

type GiftFormValues = Omit<DraftGift, "id" | "sortOrder">;

const PRIORITY_OPTIONS: { value: GiftPriority; label: string }[] = [
	{ value: "high", label: "Alta" },
	{ value: "medium", label: "Media" },
	{ value: "low", label: "Baja" },
];

const DEFAULT_VALUES: GiftFormValues = {
	name: "",
	productUrl: null,
	imageUrl: null,
	priceAmount: null,
	category: "",
	quantityNeeded: 1,
	priority: "medium",
	publicNote: "",
	internalNote: "",
	hidden: false,
};

type Props = {
	categories: string[];
	initialValues?: GiftFormValues;
	onSubmit: (values: GiftFormValues) => void;
	onCancel: () => void;
	submitLabel?: string;
};

export function GiftForm({
	categories,
	initialValues,
	onSubmit,
	onCancel,
	submitLabel = "Guardar regalo",
}: Props) {
	const [values, setValues] = useState<GiftFormValues>(
		initialValues ?? DEFAULT_VALUES,
	);

	function set<K extends keyof GiftFormValues>(
		key: K,
		value: GiftFormValues[K],
	) {
		setValues((prev) => ({ ...prev, [key]: value }));
	}

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (!values.name.trim()) return;
		onSubmit({
			...values,
			productUrl: values.productUrl?.trim() || null,
			imageUrl: values.imageUrl?.trim() || null,
			publicNote: values.publicNote.trim(),
			internalNote: values.internalNote.trim(),
		});
	}

	return (
		<form className="space-y-4" onSubmit={handleSubmit}>
			{/* Name */}
			<div>
				<label
					className="mb-1 block font-medium text-gray-700 text-sm"
					htmlFor="gift-name"
				>
					Nombre del regalo <span className="text-red-500">*</span>
				</label>
				<input
					className="w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-900 text-sm focus:border-gray-400 focus:outline-none"
					id="gift-name"
					onChange={(e) => set("name", e.target.value)}
					placeholder="Ej. Cuna de madera"
					required
					type="text"
					value={values.name}
				/>
			</div>

			{/* Product URL */}
			<div>
				<label
					className="mb-1 block font-medium text-gray-700 text-sm"
					htmlFor="gift-url"
				>
					Enlace del producto{" "}
					<span className="font-normal text-gray-400">(opcional)</span>
				</label>
				<input
					className="w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-900 text-sm focus:border-gray-400 focus:outline-none"
					id="gift-url"
					onChange={(e) => set("productUrl", e.target.value || null)}
					placeholder="https://..."
					type="url"
					value={values.productUrl ?? ""}
				/>
			</div>

			{/* Image URL */}
			<div>
				<label
					className="mb-1 block font-medium text-gray-700 text-sm"
					htmlFor="gift-image"
				>
					URL de imagen{" "}
					<span className="font-normal text-gray-400">(opcional)</span>
				</label>
				<input
					className="w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-900 text-sm focus:border-gray-400 focus:outline-none"
					id="gift-image"
					onChange={(e) => set("imageUrl", e.target.value || null)}
					placeholder="https://..."
					type="url"
					value={values.imageUrl ?? ""}
				/>
			</div>

			{/* Price & Quantity row */}
			<div className="grid grid-cols-2 gap-4">
				<div>
					<label
						className="mb-1 block font-medium text-gray-700 text-sm"
						htmlFor="gift-price"
					>
						Precio <span className="font-normal text-gray-400">(opcional)</span>
					</label>
					<input
						className="w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-900 text-sm focus:border-gray-400 focus:outline-none"
						id="gift-price"
						min="0"
						onChange={(e) =>
							set("priceAmount", e.target.value ? Number(e.target.value) : null)
						}
						placeholder="0.00"
						step="0.01"
						type="number"
						value={values.priceAmount ?? ""}
					/>
				</div>
				<div>
					<label
						className="mb-1 block font-medium text-gray-700 text-sm"
						htmlFor="gift-quantity"
					>
						Cantidad
					</label>
					<input
						className="w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-900 text-sm focus:border-gray-400 focus:outline-none"
						id="gift-quantity"
						min="1"
						onChange={(e) =>
							set("quantityNeeded", Math.max(1, Number(e.target.value)))
						}
						type="number"
						value={values.quantityNeeded}
					/>
				</div>
			</div>

			{/* Category */}
			<div>
				<label
					className="mb-1 block font-medium text-gray-700 text-sm"
					htmlFor="gift-category"
				>
					Categoría
				</label>
				<select
					className="w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-900 text-sm focus:border-gray-400 focus:outline-none"
					id="gift-category"
					onChange={(e) => set("category", e.target.value)}
					value={values.category}
				>
					<option value="">Sin categoría</option>
					{categories.map((cat) => (
						<option key={cat} value={cat}>
							{cat}
						</option>
					))}
				</select>
			</div>

			{/* Priority */}
			<div>
				<p className="mb-1 block font-medium text-gray-700 text-sm">
					Prioridad
				</p>
				<div className="flex gap-2">
					{PRIORITY_OPTIONS.map((opt) => (
						<button
							className={[
								"flex-1 rounded-lg border-2 py-2 text-sm transition-all",
								values.priority === opt.value
									? "border-gray-900 bg-gray-900 text-white"
									: "border-gray-200 bg-white text-gray-700 hover:border-gray-400",
							].join(" ")}
							key={opt.value}
							onClick={() => set("priority", opt.value)}
							type="button"
						>
							{opt.label}
						</button>
					))}
				</div>
			</div>

			{/* Public note */}
			<div>
				<label
					className="mb-1 block font-medium text-gray-700 text-sm"
					htmlFor="gift-public-note"
				>
					Nota pública{" "}
					<span className="font-normal text-gray-400">(opcional)</span>
				</label>
				<textarea
					className="w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-900 text-sm focus:border-gray-400 focus:outline-none"
					id="gift-public-note"
					onChange={(e) => set("publicNote", e.target.value)}
					placeholder="Visible para los invitados"
					rows={2}
					value={values.publicNote}
				/>
			</div>

			{/* Internal note */}
			<div>
				<label
					className="mb-1 block font-medium text-gray-700 text-sm"
					htmlFor="gift-internal-note"
				>
					Nota interna{" "}
					<span className="font-normal text-gray-400">(solo tú la ves)</span>
				</label>
				<textarea
					className="w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-900 text-sm focus:border-gray-400 focus:outline-none"
					id="gift-internal-note"
					onChange={(e) => set("internalNote", e.target.value)}
					placeholder="Solo visible para ti"
					rows={2}
					value={values.internalNote}
				/>
			</div>

			{/* Hidden toggle */}
			<div className="flex items-center gap-3">
				<input
					checked={values.hidden}
					className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
					id="gift-hidden"
					onChange={(e) => set("hidden", e.target.checked)}
					type="checkbox"
				/>
				<label className="text-gray-700 text-sm" htmlFor="gift-hidden">
					Ocultar este regalo (no aparecerá en la lista pública)
				</label>
			</div>

			{/* Actions */}
			<div className="flex justify-end gap-3 pt-2">
				<button
					className="rounded-lg border border-gray-200 px-4 py-2 text-gray-600 text-sm hover:bg-gray-50"
					onClick={onCancel}
					type="button"
				>
					Cancelar
				</button>
				<button
					className="rounded-lg bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-800 disabled:opacity-50"
					disabled={!values.name.trim()}
					type="submit"
				>
					{submitLabel}
				</button>
			</div>
		</form>
	);
}
