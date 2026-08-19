"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/trpc/react";

type Props = {
	wishlistId: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onShared: () => void;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ShareByEmailDialog({
	wishlistId,
	open,
	onOpenChange,
	onShared,
}: Props) {
	const utils = api.useUtils();
	const [step, setStep] = useState<"email" | "confirm">("email");
	const [email, setEmail] = useState("");
	const [recipientName, setRecipientName] = useState<string | null>(null);
	const [isLookingUp, setIsLookingUp] = useState(false);

	const shareMutation = api.collaboration.share.useMutation({
		onSuccess: () => {
			toast.success("Invitación enviada");
			resetAndClose();
			onShared();
		},
		onError: (error) => {
			toast.error(error.message || "No pudimos compartir la lista.");
		},
	});

	function resetAndClose() {
		setStep("email");
		setEmail("");
		setRecipientName(null);
		onOpenChange(false);
	}

	async function handleContinue(e: React.FormEvent) {
		e.preventDefault();
		if (!EMAIL_PATTERN.test(email)) return;

		setIsLookingUp(true);
		try {
			const result = await utils.collaboration.lookupRecipient.fetch({
				wishlistId,
				email,
			});
			setRecipientName(result.name);
			setStep("confirm");
		} catch {
			toast.error("No pudimos buscar esa dirección. Intenta de nuevo.");
		} finally {
			setIsLookingUp(false);
		}
	}

	function handleConfirm() {
		shareMutation.mutate({ wishlistId, email });
	}

	return (
		<Dialog
			onOpenChange={(next) => {
				if (!next) resetAndClose();
				else onOpenChange(next);
			}}
			open={open}
		>
			<DialogContent>
				{step === "email" ? (
					<form onSubmit={handleContinue}>
						<DialogHeader>
							<DialogTitle>Compartir esta wishlist</DialogTitle>
							<DialogDescription>
								Escribe el correo de la persona con la que quieres colaborar.
								Tendrá los mismos permisos que tú, excepto archivar, eliminar o
								gestionar colaboradores.
							</DialogDescription>
						</DialogHeader>
						<div className="space-y-1.5 py-4">
							<Label htmlFor="collaborator-email">Correo electrónico</Label>
							<Input
								autoFocus
								id="collaborator-email"
								onChange={(e) => setEmail(e.target.value.trim())}
								placeholder="ana@example.com"
								type="email"
								value={email}
							/>
						</div>
						<DialogFooter>
							<Button
								onClick={() => resetAndClose()}
								type="button"
								variant="outline"
							>
								Cancelar
							</Button>
							<Button
								disabled={!EMAIL_PATTERN.test(email) || isLookingUp}
								type="submit"
							>
								{isLookingUp ? "Buscando…" : "Continuar"}
							</Button>
						</DialogFooter>
					</form>
				) : (
					<>
						<DialogHeader>
							<DialogTitle>¿Compartir con esta persona?</DialogTitle>
							<DialogDescription>
								{recipientName ? (
									<>
										Se le dará acceso a <strong>{recipientName}</strong> (
										{email}) de inmediato, sin necesidad de aceptar nada.
									</>
								) : (
									<>
										<strong>{email}</strong> aún no tiene una cuenta. Le
										enviaremos un correo para invitarla a crear una y unirse a
										esta lista.
									</>
								)}
							</DialogDescription>
						</DialogHeader>
						<DialogFooter>
							<Button
								onClick={() => setStep("email")}
								type="button"
								variant="outline"
							>
								Atrás
							</Button>
							<Button
								disabled={shareMutation.isPending}
								onClick={handleConfirm}
								type="button"
							>
								{shareMutation.isPending ? "Compartiendo…" : "Confirmar"}
							</Button>
						</DialogFooter>
					</>
				)}
			</DialogContent>
		</Dialog>
	);
}
