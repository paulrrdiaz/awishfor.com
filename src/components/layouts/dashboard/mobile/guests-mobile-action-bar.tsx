"use client";

import { BellIcon, PlusIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { GuestSheet } from "@/components/features/dashboard/guests/guest-sheet";
import { Button } from "@/components/ui/button";
import { hrefFor } from "../wishlist-sections";
import { MobileActionBar } from "./mobile-action-bar";

type Props = {
	wishlistId: string;
	pendingInvitations: number;
};

export function GuestsMobileActionBar({
	wishlistId,
	pendingInvitations,
}: Props) {
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
						<PlusIcon /> Agregar invitado
					</Button>
				}
				secondary={
					pendingInvitations > 0 ? (
						<Button asChild className="w-full" type="button" variant="outline">
							<Link href={`${hrefFor(wishlistId, "guests")}?status=pending`}>
								<BellIcon />
								Recordar a los {pendingInvitations} pendientes
							</Link>
						</Button>
					) : undefined
				}
			/>
			<GuestSheet
				invite={null}
				onOpenChange={setOpen}
				open={open}
				wishlistId={wishlistId}
			/>
		</>
	);
}
