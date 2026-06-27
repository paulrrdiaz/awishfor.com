"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { DashboardGiftRowViewModel } from "@/server/mappers/view-models";
import { api } from "@/trpc/react";

type Props = {
	gift: DashboardGiftRowViewModel;
	open: boolean;
	onClose: () => void;
	wishlistId: string;
};

export function EditGiftDialog({ gift, open, onClose, wishlistId }: Props) {
	const router = useRouter();
	const [name, setName] = useState(gift.name);
	const [productUrl, setProductUrl] = useState(gift.productUrl ?? "");
	const [priceAmount, setPriceAmount] = useState(gift.priceAmount ?? "");
	const [quantityNeeded, setQuantityNeeded] = useState(gift.quantityNeeded);
	const [priority, setPriority] = useState(gift.priority);
	const [publicNote, setPublicNote] = useState(gift.publicNote ?? "");
	const [categoryId, setCategoryId] = useState(gift.categoryId ?? "");
	const categoriesQuery = api.category.list.useQuery(
		{ wishlistId },
		{ enabled: open },
	);

	const updateMutation = api.gift.update.useMutation({
		onSuccess: () => {
			onClose();
			router.refresh();
		},
	});

	if (!open) return null;

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (!name.trim()) return;
		updateMutation.mutate({
			giftId: gift.id,
			name: name.trim(),
			productUrl: productUrl.trim() || undefined,
			priceAmount: priceAmount ? Number(priceAmount) : undefined,
			quantityNeeded,
			priority,
			publicNote: publicNote.trim() || undefined,
			categoryId: categoryId || null,
		});
	}

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
			<div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
				<h2 className="mb-4 font-semibold text-gray-900 text-lg">
					Editar regalo
				</h2>
				<form className="space-y-4" onSubmit={handleSubmit}>
					<div>
						<label
							className="mb-1 block font-medium text-gray-700 text-sm"
							htmlFor="edit-name"
						>
							Nombre <span className="text-red-500">*</span>
						</label>
						<input
							className="w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-900 text-sm focus:border-gray-400 focus:outline-none"
							id="edit-name"
							onChange={(e) => setName(e.target.value)}
							required
							type="text"
							value={name}
						/>
					</div>
					<div>
						<label
							className="mb-1 block font-medium text-gray-700 text-sm"
							htmlFor="edit-url"
						>
							Enlace
						</label>
						<input
							className="w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-900 text-sm focus:border-gray-400 focus:outline-none"
							id="edit-url"
							onChange={(e) => setProductUrl(e.target.value)}
							placeholder="https://..."
							type="url"
							value={productUrl}
						/>
					</div>
					<div className="grid grid-cols-2 gap-4">
						<div>
							<label
								className="mb-1 block font-medium text-gray-700 text-sm"
								htmlFor="edit-price"
							>
								Precio
							</label>
							<input
								className="w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-900 text-sm focus:border-gray-400 focus:outline-none"
								id="edit-price"
								min="0"
								onChange={(e) => setPriceAmount(e.target.value)}
								placeholder="0.00"
								step="0.01"
								type="number"
								value={priceAmount}
							/>
						</div>
						<div>
							<label
								className="mb-1 block font-medium text-gray-700 text-sm"
								htmlFor="edit-qty"
							>
								Cantidad
							</label>
							<input
								className="w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-900 text-sm focus:border-gray-400 focus:outline-none"
								id="edit-qty"
								min="1"
								onChange={(e) =>
									setQuantityNeeded(Math.max(1, Number(e.target.value)))
								}
								type="number"
								value={quantityNeeded}
							/>
						</div>
					</div>
					<div>
						<label
							className="mb-1 block font-medium text-gray-700 text-sm"
							htmlFor="edit-category"
						>
							Categoría
						</label>
						<select
							className="w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-900 text-sm focus:border-gray-400 focus:outline-none"
							disabled={categoriesQuery.isLoading}
							id="edit-category"
							onChange={(e) => setCategoryId(e.target.value)}
							value={categoryId}
						>
							<option value="">Sin categoría</option>
							{categoriesQuery.data?.map((category) => (
								<option key={category.id} value={category.id}>
									{category.name}
								</option>
							))}
						</select>
					</div>
					<div>
						<p className="mb-1 block font-medium text-gray-700 text-sm">
							Prioridad
						</p>
						<div className="flex gap-2">
							{(["high", "medium", "low"] as const).map((p) => (
								<button
									className={[
										"flex-1 rounded-lg border-2 py-2 text-sm transition-all",
										priority === p
											? "border-gray-900 bg-gray-900 text-white"
											: "border-gray-200 bg-white text-gray-700 hover:border-gray-400",
									].join(" ")}
									key={p}
									onClick={() => setPriority(p)}
									type="button"
								>
									{p === "high" ? "Alta" : p === "medium" ? "Media" : "Baja"}
								</button>
							))}
						</div>
					</div>
					<div>
						<label
							className="mb-1 block font-medium text-gray-700 text-sm"
							htmlFor="edit-note"
						>
							Nota pública
						</label>
						<textarea
							className="w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-900 text-sm focus:border-gray-400 focus:outline-none"
							id="edit-note"
							onChange={(e) => setPublicNote(e.target.value)}
							rows={2}
							value={publicNote}
						/>
					</div>
					<div className="flex justify-end gap-3 pt-2">
						<Button onClick={onClose} type="button" variant="outline">
							Cancelar
						</Button>
						<Button
							disabled={!name.trim() || updateMutation.isPending}
							type="submit"
						>
							{updateMutation.isPending ? "Guardando…" : "Guardar cambios"}
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
}
