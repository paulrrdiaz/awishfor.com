"use client";

import { MoreHorizontalIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { RestoreWishlistDialogContent } from "@/components/features/dashboard/settings/wishlist-settings-form";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toCanonicalWishlistUrl } from "@/lib/wishlist/share";
import { api } from "@/trpc/react";

type Props = {
	wishlistId: string;
	status: string;
	publicUrlPath: string;
};

export function WishlistActionsMenu({
	wishlistId,
	status,
	publicUrlPath,
}: Props) {
	const router = useRouter();
	const [archiveOpen, setArchiveOpen] = useState(false);
	const [restoreOpen, setRestoreOpen] = useState(false);
	const isArchived = status.toLowerCase() === "archived";

	const archive = api.wishlist.archive.useMutation({
		onSuccess: () => {
			setArchiveOpen(false);
			router.refresh();
		},
		onError: () => {
			toast.error("No pudimos archivar la wishlist.");
		},
	});

	const restore = api.wishlist.restore.useMutation({
		onSuccess: () => {
			setRestoreOpen(false);
			router.refresh();
		},
		onError: () => {
			toast.error("No pudimos restaurar la wishlist.");
		},
	});

	const handleCopyLink = async () => {
		try {
			await navigator.clipboard.writeText(
				toCanonicalWishlistUrl(publicUrlPath),
			);
			toast.success("Enlace copiado");
		} catch {
			toast.error("No pudimos copiar el enlace.");
		}
	};

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						aria-label="Más acciones"
						className="size-9 rounded-full"
						size="icon"
						type="button"
						variant="outline"
					>
						<MoreHorizontalIcon />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DropdownMenuItem onSelect={() => void handleCopyLink()}>
						Copiar enlace
					</DropdownMenuItem>
					{isArchived ? (
						<DropdownMenuItem onSelect={() => setRestoreOpen(true)}>
							Restaurar
						</DropdownMenuItem>
					) : (
						<DropdownMenuItem
							onSelect={() => setArchiveOpen(true)}
							variant="destructive"
						>
							Archivar
						</DropdownMenuItem>
					)}
				</DropdownMenuContent>
			</DropdownMenu>

			<AlertDialog onOpenChange={setArchiveOpen} open={archiveOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>¿Archivar esta wishlist?</AlertDialogTitle>
						<AlertDialogDescription>
							La wishlist dejará de ser accesible en su enlace público hasta que
							la restaures.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancelar</AlertDialogCancel>
						<AlertDialogAction
							disabled={archive.isPending}
							onClick={() => archive.mutate({ id: wishlistId })}
						>
							Archivar
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			<Dialog onOpenChange={setRestoreOpen} open={restoreOpen}>
				<DialogContent>
					<RestoreWishlistDialogContent
						disabled={restore.isPending}
						onRestoreDraft={() =>
							restore.mutate({ id: wishlistId, targetStatus: "draft" })
						}
						onRestorePublished={() =>
							restore.mutate({ id: wishlistId, targetStatus: "published" })
						}
					/>
				</DialogContent>
			</Dialog>
		</>
	);
}
