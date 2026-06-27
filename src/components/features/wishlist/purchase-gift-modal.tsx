"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import type { PublicGiftViewModel } from "@/server/mappers/view-models";
import {
	PURCHASE_GUEST_NAME_MAX_LENGTH,
	PURCHASE_GUEST_NAME_MIN_LENGTH,
} from "@/server/validators/purchase.schema";
import { api } from "@/trpc/react";

const MESSAGE_MAX_LENGTH = 500;

type Props = {
	gift: PublicGiftViewModel;
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

type FieldErrors = {
	guestName?: string;
	guestEmail?: string;
	guestPhone?: string;
	message?: string;
	submit?: string;
};

export function PurchaseGiftModal({ gift, open, onOpenChange }: Props) {
	const [guestName, setGuestName] = useState("");
	const [guestEmail, setGuestEmail] = useState("");
	const [guestPhone, setGuestPhone] = useState("");
	const [message, setMessage] = useState("");
	const [quantity, setQuantity] = useState(1);
	const [errors, setErrors] = useState<FieldErrors>({});

	const showQuantitySelector = gift.remainingQuantity > 1;

	const mutation = api.purchase.markGiftPurchased.useMutation({
		onError: (error) => {
			setErrors((prev) => ({ ...prev, submit: error.message }));
		},
		onSuccess: () => {
			onOpenChange(false);
			resetForm();
		},
	});

	function resetForm() {
		setGuestName("");
		setGuestEmail("");
		setGuestPhone("");
		setMessage("");
		setQuantity(1);
		setErrors({});
	}

	function validate(): boolean {
		const next: FieldErrors = {};
		const name = guestName.trim();

		if (
			name.length < PURCHASE_GUEST_NAME_MIN_LENGTH ||
			name.length > PURCHASE_GUEST_NAME_MAX_LENGTH
		) {
			next.guestName = `El nombre debe tener entre ${PURCHASE_GUEST_NAME_MIN_LENGTH} y ${PURCHASE_GUEST_NAME_MAX_LENGTH} caracteres`;
		}

		if (guestEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail)) {
			next.guestEmail = "Ingresa un correo electrónico válido";
		}

		if (guestPhone && guestPhone.trim().length > 30) {
			next.guestPhone = "El teléfono debe tener como máximo 30 caracteres";
		}

		if (message.trim().length > MESSAGE_MAX_LENGTH) {
			next.message = `El mensaje debe tener como máximo ${MESSAGE_MAX_LENGTH} caracteres`;
		}

		setErrors(next);
		return Object.keys(next).length === 0;
	}

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (!validate()) return;

		mutation.mutate({
			giftId: gift.id,
			guestName: guestName.trim(),
			guestEmail: guestEmail.trim() || undefined,
			guestPhone: guestPhone.trim() || undefined,
			message: message.trim() || undefined,
			quantity: showQuantitySelector ? quantity : 1,
		});
	}

	function handleOpenChange(next: boolean) {
		if (!next) resetForm();
		onOpenChange(next);
	}

	return (
		<Dialog onOpenChange={handleOpenChange} open={open}>
			<DialogContent showCloseButton>
				<DialogHeader>
					<DialogTitle>Regalar: {gift.name}</DialogTitle>
					<DialogDescription>
						Comparte tu nombre para que el festejado sepa quién lo regaló.
					</DialogDescription>
				</DialogHeader>

				<form
					className="flex flex-col gap-4"
					noValidate
					onSubmit={handleSubmit}
				>
					{/* Name */}
					<div className="flex flex-col gap-1">
						<label className="font-medium text-sm" htmlFor="pg-guest-name">
							Tu nombre <span aria-hidden="true">*</span>
						</label>
						<input
							autoComplete="name"
							className="rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
							id="pg-guest-name"
							maxLength={PURCHASE_GUEST_NAME_MAX_LENGTH}
							onChange={(e) => setGuestName(e.target.value)}
							placeholder="Ana García"
							required
							type="text"
							value={guestName}
						/>
						{errors.guestName && (
							<p className="text-destructive text-xs">{errors.guestName}</p>
						)}
					</div>

					{/* Email */}
					<div className="flex flex-col gap-1">
						<label className="font-medium text-sm" htmlFor="pg-guest-email">
							Correo electrónico{" "}
							<span className="font-normal text-muted-foreground text-xs">
								(opcional)
							</span>
						</label>
						<input
							autoComplete="email"
							className="rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
							id="pg-guest-email"
							onChange={(e) => setGuestEmail(e.target.value)}
							placeholder="ana@ejemplo.com"
							type="email"
							value={guestEmail}
						/>
						{errors.guestEmail && (
							<p className="text-destructive text-xs">{errors.guestEmail}</p>
						)}
					</div>

					{/* Phone */}
					<div className="flex flex-col gap-1">
						<label className="font-medium text-sm" htmlFor="pg-guest-phone">
							Teléfono{" "}
							<span className="font-normal text-muted-foreground text-xs">
								(opcional)
							</span>
						</label>
						<input
							autoComplete="tel"
							className="rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
							id="pg-guest-phone"
							onChange={(e) => setGuestPhone(e.target.value)}
							placeholder="+51 999 999 999"
							type="tel"
							value={guestPhone}
						/>
						{errors.guestPhone && (
							<p className="text-destructive text-xs">{errors.guestPhone}</p>
						)}
					</div>

					{/* Message */}
					<div className="flex flex-col gap-1">
						<label className="font-medium text-sm" htmlFor="pg-message">
							Mensaje{" "}
							<span className="font-normal text-muted-foreground text-xs">
								(opcional)
							</span>
						</label>
						<textarea
							className="min-h-[80px] rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
							id="pg-message"
							onChange={(e) => setMessage(e.target.value)}
							placeholder="¡Muchas felicitaciones!"
							value={message}
						/>
						<p className="text-muted-foreground text-xs">
							{message.length}/{MESSAGE_MAX_LENGTH}
						</p>
						{errors.message && (
							<p className="text-destructive text-xs">{errors.message}</p>
						)}
					</div>

					{/* Quantity selector — only when remainingQuantity > 1 */}
					{showQuantitySelector && (
						<div className="flex flex-col gap-1">
							<label className="font-medium text-sm" htmlFor="pg-quantity">
								Cantidad
							</label>
							<input
								className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
								id="pg-quantity"
								max={gift.remainingQuantity}
								min={1}
								onChange={(e) =>
									setQuantity(
										Math.max(
											1,
											Math.min(gift.remainingQuantity, Number(e.target.value)),
										),
									)
								}
								type="number"
								value={quantity}
							/>
						</div>
					)}

					{/* Consent copy */}
					<p className="text-muted-foreground text-xs">
						Al confirmar, autorizas que tu nombre sea compartido con el dueño de
						esta lista para que sepa que regalaste este artículo.
					</p>

					{/* Submit error */}
					{errors.submit && (
						<p className="text-destructive text-sm">{errors.submit}</p>
					)}

					<DialogFooter>
						<Button disabled={mutation.isPending} size="sm" type="submit">
							{mutation.isPending ? "Confirmando…" : "Confirmar regalo"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
