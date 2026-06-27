"use client";

import type { OwnerPurchaseRecordViewModel } from "@/server/mappers/view-models";
import { DeletePurchaseDialog } from "./delete-purchase-dialog";

type Props = {
	purchases: OwnerPurchaseRecordViewModel[];
	isLoading: boolean;
	onDeleteSuccess: () => void;
};

export function PurchaseRecordList({
	purchases,
	isLoading,
	onDeleteSuccess,
}: Props) {
	if (isLoading) {
		return <p className="text-muted-foreground text-sm">Cargando compras…</p>;
	}

	if (purchases.length === 0) {
		return (
			<p className="text-muted-foreground text-sm">
				No hay compras registradas para este regalo.
			</p>
		);
	}

	return (
		<div className="space-y-2">
			<h3 className="font-medium text-sm">Compras registradas</h3>
			<ul className="divide-y">
				{purchases.map((purchase) => (
					<li
						className="flex items-start justify-between gap-2 py-3"
						key={purchase.id}
					>
						<div className="min-w-0 flex-1 space-y-0.5">
							<p className="truncate font-medium text-sm">
								{purchase.guestName}
							</p>
							<p className="text-muted-foreground text-xs">
								{purchase.quantity} unidad{purchase.quantity !== 1 ? "es" : ""}{" "}
								·{" "}
								{new Date(purchase.createdAt).toLocaleDateString("es", {
									day: "numeric",
									month: "short",
									year: "numeric",
								})}
							</p>
							{purchase.guestEmail && (
								<p className="text-muted-foreground text-xs">
									{purchase.guestEmail}
								</p>
							)}
							{purchase.guestPhone && (
								<p className="text-muted-foreground text-xs">
									{purchase.guestPhone}
								</p>
							)}
							{purchase.message && (
								<p className="text-muted-foreground text-xs italic">
									&ldquo;{purchase.message}&rdquo;
								</p>
							)}
						</div>
						<DeletePurchaseDialog
							guestName={purchase.guestName}
							onSuccess={onDeleteSuccess}
							purchaseId={purchase.id}
						/>
					</li>
				))}
			</ul>
		</div>
	);
}
