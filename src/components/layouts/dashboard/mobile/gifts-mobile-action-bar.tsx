"use client";

import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { GiftSheet } from "@/components/features/dashboard/gifts/gift-sheet";
import { Button } from "@/components/ui/button";
import { MobileActionBar } from "./mobile-action-bar";

type Props = {
	wishlistId: string;
};

export function GiftsMobileActionBar({ wishlistId }: Props) {
	const [open, setOpen] = useState(false);

	return (
		<>
			<MobileActionBar
				primary={
					<Button
						className="w-full"
						onClick={() => setOpen(true)}
						type="button"
					>
						<PlusIcon /> Agregar regalo
					</Button>
				}
			/>
			<GiftSheet
				gift={null}
				onOpenChange={setOpen}
				open={open}
				wishlistId={wishlistId}
			/>
		</>
	);
}
