"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { api } from "@/trpc/react";
import { ManualPurchaseForm } from "./manual-purchase-form";
import { PurchaseRecordList } from "./purchase-record-list";

type Props = {
	giftId: string;
	giftName: string;
	remainingQuantity: number;
	open: boolean;
	onClose: () => void;
};

export function PurchaseDrawer({
	giftId,
	giftName,
	remainingQuantity,
	open,
	onClose,
}: Props) {
	const router = useRouter();
	const utils = api.useUtils();

	const purchasesQuery = api.purchase.listForGift.useQuery(
		{ giftId },
		{ enabled: open },
	);

	const refreshAll = useCallback(() => {
		void utils.purchase.listForGift.invalidate({ giftId });
		router.refresh();
	}, [utils, giftId, router]);

	return (
		<Sheet
			onOpenChange={(nextOpen) => {
				if (!nextOpen) onClose();
			}}
			open={open}
		>
			<SheetContent side="right">
				<SheetHeader>
					<SheetTitle>Compras — {giftName}</SheetTitle>
				</SheetHeader>
				<div className="flex flex-col gap-6 overflow-y-auto p-4">
					<ManualPurchaseForm
						giftId={giftId}
						onSuccess={refreshAll}
						remainingQuantity={remainingQuantity}
					/>
					<PurchaseRecordList
						isLoading={purchasesQuery.isLoading}
						onDeleteSuccess={refreshAll}
						purchases={purchasesQuery.data ?? []}
					/>
				</div>
			</SheetContent>
		</Sheet>
	);
}
