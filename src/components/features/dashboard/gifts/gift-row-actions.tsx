"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { DashboardGiftRowViewModel } from "@/server/mappers/view-models";
import { api } from "@/trpc/react";
import { DeleteGiftDialog } from "./delete-gift-dialog";
import { EditGiftDialog } from "./edit-gift-dialog";

type Props = {
	gift: DashboardGiftRowViewModel;
};

export function GiftRowActions({ gift }: Props) {
	const router = useRouter();
	const [editOpen, setEditOpen] = useState(false);
	const isHidden = gift.visibilityStatus === "hidden";

	const setVisibilityMutation = api.gift.setVisibility.useMutation({
		onSuccess: () => router.refresh(),
	});

	return (
		<>
			<div className="flex shrink-0 items-center gap-1">
				<Button
					onClick={() => setEditOpen(true)}
					size="sm"
					type="button"
					variant="ghost"
				>
					Editar
				</Button>
				<Button
					disabled={setVisibilityMutation.isPending}
					onClick={() =>
						setVisibilityMutation.mutate({
							giftId: gift.id,
							visibilityStatus: isHidden ? "available" : "hidden",
						})
					}
					size="sm"
					type="button"
					variant="ghost"
				>
					{isHidden ? "Mostrar" : "Ocultar"}
				</Button>
				<DeleteGiftDialog
					giftId={gift.id}
					giftName={gift.name}
					purchasedQuantity={gift.purchasedQuantity}
				/>
			</div>
			<EditGiftDialog
				gift={gift}
				onClose={() => setEditOpen(false)}
				open={editOpen}
			/>
		</>
	);
}
