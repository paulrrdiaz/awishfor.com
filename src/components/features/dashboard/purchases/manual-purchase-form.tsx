"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";

type Props = {
	giftId: string;
	remainingQuantity: number;
	onSuccess: () => void;
};

export function ManualPurchaseForm({
	giftId,
	remainingQuantity,
	onSuccess,
}: Props) {
	const [guestName, setGuestName] = useState("");
	const [quantity, setQuantity] = useState(1);

	const deleteMutation = api.purchase.delete.useMutation({
		onSuccess: onSuccess,
	});

	const createMutation = api.purchase.createManual.useMutation({
		onSuccess: (purchase) => {
			setGuestName("");
			setQuantity(1);
			onSuccess();
			toast.success("Compra agregada", {
				action: {
					label: "Deshacer",
					onClick: () => {
						deleteMutation.mutate({ purchaseId: purchase.id });
					},
				},
			});
		},
	});

	const isDisabled =
		createMutation.isPending ||
		deleteMutation.isPending ||
		remainingQuantity < 1;

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (quantity < 1 || quantity > remainingQuantity) return;
		createMutation.mutate({
			giftId,
			guestName: guestName.trim() || undefined,
			quantity,
		});
	}

	return (
		<form className="space-y-3" onSubmit={handleSubmit}>
			<h3 className="font-medium text-sm">Agregar compra manual</h3>
			{remainingQuantity < 1 && (
				<p className="text-muted-foreground text-xs">
					Este regalo ya fue completamente comprado.
				</p>
			)}
			<div>
				<label
					className="mb-1 block font-medium text-gray-700 text-xs"
					htmlFor="manual-guest-name"
				>
					Nombre del comprador
				</label>
				<input
					className="w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-900 text-sm placeholder:text-gray-400 focus:border-gray-400 focus:outline-none"
					disabled={isDisabled}
					id="manual-guest-name"
					onChange={(e) => setGuestName(e.target.value)}
					placeholder="Registrado por el creador"
					type="text"
					value={guestName}
				/>
			</div>
			<div>
				<label
					className="mb-1 block font-medium text-gray-700 text-xs"
					htmlFor="manual-quantity"
				>
					Cantidad
				</label>
				<input
					className="w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-900 text-sm focus:border-gray-400 focus:outline-none"
					disabled={isDisabled}
					id="manual-quantity"
					max={remainingQuantity}
					min={1}
					onChange={(e) =>
						setQuantity(
							Math.max(1, Math.min(remainingQuantity, Number(e.target.value))),
						)
					}
					type="number"
					value={quantity}
				/>
			</div>
			<Button disabled={isDisabled} size="sm" type="submit">
				{createMutation.isPending ? "Agregando…" : "Agregar compra"}
			</Button>
		</form>
	);
}
