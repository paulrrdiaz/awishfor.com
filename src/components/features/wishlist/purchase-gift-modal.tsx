"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
const UNDO_WINDOW_SECONDS = 8;

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

type Phase = "form" | "success";

export function PurchaseGiftModal({ gift, open, onOpenChange }: Props) {
	const router = useRouter();

	const [phase, setPhase] = useState<Phase>("form");
	const [purchaseId, setPurchaseId] = useState("");
	const [undoTokenStored, setUndoTokenStored] = useState("");
	const [undoError, setUndoError] = useState("");
	const [undoSecondsLeft, setUndoSecondsLeft] = useState(UNDO_WINDOW_SECONDS);
	const [undoExpired, setUndoExpired] = useState(false);

	const [guestName, setGuestName] = useState("");
	const [guestEmail, setGuestEmail] = useState("");
	const [guestPhone, setGuestPhone] = useState("");
	const [message, setMessage] = useState("");
	const [quantity, setQuantity] = useState(1);
	const [errors, setErrors] = useState<FieldErrors>({});

	const showQuantitySelector = gift.remainingQuantity > 1;

	const purchaseMutation = api.purchase.markGiftPurchased.useMutation({
		onError: (error) => {
			setErrors((prev) => ({ ...prev, submit: error.message }));
		},
		onSuccess: (data) => {
			setPurchaseId(data.purchase.id);
			setUndoTokenStored(data.undoToken);
			setPhase("success");
			router.refresh();
		},
	});

	const undoMutation = api.purchase.undoRecentPurchase.useMutation({
		onError: (error) => {
			setUndoError(error.message);
		},
		onSuccess: () => {
			router.refresh();
			resetAll();
			onOpenChange(false);
		},
	});

	useEffect(() => {
		if (phase !== "success") return;
		let secondsLeft = UNDO_WINDOW_SECONDS;
		setUndoSecondsLeft(secondsLeft);
		setUndoExpired(false);
		const interval = setInterval(() => {
			secondsLeft -= 1;
			if (secondsLeft <= 0) {
				clearInterval(interval);
				setUndoSecondsLeft(0);
				setUndoExpired(true);
			} else {
				setUndoSecondsLeft(secondsLeft);
			}
		}, 1000);
		return () => clearInterval(interval);
	}, [phase]);

	function resetForm() {
		setGuestName("");
		setGuestEmail("");
		setGuestPhone("");
		setMessage("");
		setQuantity(1);
		setErrors({});
	}

	function resetAll() {
		setUndoSecondsLeft(UNDO_WINDOW_SECONDS);
		setUndoExpired(false);
		setPhase("form");
		setPurchaseId("");
		setUndoTokenStored("");
		setUndoError("");
		resetForm();
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

		purchaseMutation.mutate({
			giftId: gift.id,
			guestName: guestName.trim(),
			guestEmail: guestEmail.trim() || undefined,
			guestPhone: guestPhone.trim() || undefined,
			message: message.trim() || undefined,
			quantity: showQuantitySelector ? quantity : 1,
		});
	}

	function handleOpenChange(next: boolean) {
		if (!next) resetAll();
		onOpenChange(next);
	}

	return (
		<Dialog onOpenChange={handleOpenChange} open={open}>
			<DialogContent
				className="top-auto bottom-0 left-0 max-h-[92svh] max-w-none translate-x-0 translate-y-0 overflow-y-auto rounded-t-xl rounded-b-none p-0 md:top-1/2 md:bottom-auto md:left-1/2 md:max-w-md md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-xl"
				showCloseButton
			>
				{phase === "success" ? (
					<div className="flex max-h-[92svh] flex-col">
						<DialogHeader className="p-6 pb-2">
							<DialogTitle>¡Regalo confirmado!</DialogTitle>
							<DialogDescription>
								{guestName.trim()
									? `¡Gracias, ${guestName.trim()}! Tu regalo fue marcado como comprado. Gracias por tu cariño y por ser parte de este momento.`
									: "¡Gracias! Tu regalo fue marcado como comprado. Gracias por tu cariño y por ser parte de este momento."}
							</DialogDescription>
						</DialogHeader>

						{undoError && (
							<p className="px-6 text-destructive text-sm">{undoError}</p>
						)}

						<DialogFooter className="sticky bottom-0 mt-4 min-h-12 bg-popover p-6 pt-2">
							{undoExpired ? (
								<p className="text-muted-foreground text-sm">
									el tiempo para deshacer expiró
								</p>
							) : (
								<Button
									disabled={undoMutation.isPending}
									onClick={() =>
										undoMutation.mutate({
											purchaseId,
											undoToken: undoTokenStored,
										})
									}
									size="sm"
									type="button"
									variant="outline"
								>
									{undoMutation.isPending
										? "Deshaciendo…"
										: `Deshacer (${undoSecondsLeft} s)`}
								</Button>
							)}
							<Button
								onClick={() => {
									resetAll();
									onOpenChange(false);
								}}
								size="sm"
								type="button"
							>
								Cerrar
							</Button>
						</DialogFooter>
					</div>
				) : (
					<>
						<DialogHeader className="p-6 pb-2">
							<DialogTitle>Regalar: {gift.name}</DialogTitle>
							<DialogDescription>
								Comparte tu nombre para que el festejado sepa quién lo regaló.
							</DialogDescription>
						</DialogHeader>

						<form
							className="flex max-h-[calc(92svh-5rem)] flex-col overflow-y-auto"
							noValidate
							onSubmit={handleSubmit}
						>
							<div className="flex flex-col gap-4 px-6 py-4">
								{/* Name */}
								<div className="flex flex-col gap-1">
									<label
										className="font-medium text-sm"
										htmlFor="pg-guest-name"
									>
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
										<p className="text-destructive text-xs">
											{errors.guestName}
										</p>
									)}
								</div>

								{/* Email */}
								<div className="flex flex-col gap-1">
									<label
										className="font-medium text-sm"
										htmlFor="pg-guest-email"
									>
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
										<p className="text-destructive text-xs">
											{errors.guestEmail}
										</p>
									)}
								</div>

								{/* Phone */}
								<div className="flex flex-col gap-1">
									<label
										className="font-medium text-sm"
										htmlFor="pg-guest-phone"
									>
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
										<p className="text-destructive text-xs">
											{errors.guestPhone}
										</p>
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
										<label
											className="font-medium text-sm"
											htmlFor="pg-quantity"
										>
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
														Math.min(
															gift.remainingQuantity,
															Number(e.target.value),
														),
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
									Al marcar este regalo como comprado, compartiremos tu nombre y
									los datos opcionales que ingreses con el creador de la lista.
								</p>

								{/* Submit error */}
								{errors.submit && (
									<p className="text-destructive text-sm">{errors.submit}</p>
								)}
							</div>

							<DialogFooter className="sticky bottom-0 min-h-12 bg-popover p-6 pt-2">
								<Button
									disabled={purchaseMutation.isPending}
									size="sm"
									type="submit"
								>
									{purchaseMutation.isPending
										? "Confirmando…"
										: "Confirmar regalo"}
								</Button>
							</DialogFooter>
						</form>
					</>
				)}
			</DialogContent>
		</Dialog>
	);
}
