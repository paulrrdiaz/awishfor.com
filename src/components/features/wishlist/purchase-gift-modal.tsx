"use client";

import { CheckCircle2, LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { useSuccessCheckMotion } from "@/lib/gsap/use-success-check-motion";
import { useSurfaceMotion } from "@/lib/gsap/use-surface-motion";
import { useUndoRing } from "@/lib/gsap/use-undo-ring";
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
	debugState?: {
		phase: Phase;
		guestName?: string;
		undoSecondsLeft?: number;
		purchaseErrorMessage?: string;
		undoError?: string;
	};
};

type FieldErrors = {
	guestName?: string;
	guestEmail?: string;
	guestPhone?: string;
	message?: string;
	submit?: string;
};

export type Phase =
	| "form"
	| "loading"
	| "success"
	| "undo-available"
	| "undo-expired"
	| "purchase-error";

export function PurchaseGiftModal({
	gift,
	open,
	onOpenChange,
	debugState,
}: Props) {
	const router = useRouter();
	const successStateRef = useRef<HTMLDivElement>(null);
	const successCheckRef = useRef<SVGPathElement>(null);
	const undoRingRef = useRef<SVGCircleElement>(null);
	const undoCountdownRef = useRef<number | null>(null);
	const undoPhaseTimeoutRef = useRef<number | null>(null);

	const [phase, setPhase] = useState<Phase>("form");
	const [purchaseId, setPurchaseId] = useState("");
	const [undoTokenStored, setUndoTokenStored] = useState("");
	const [undoError, setUndoError] = useState("");
	const [purchaseErrorMessage, setPurchaseErrorMessage] = useState("");
	const [undoSecondsLeft, setUndoSecondsLeft] = useState(UNDO_WINDOW_SECONDS);

	const [guestName, setGuestName] = useState("");
	const [guestEmail, setGuestEmail] = useState("");
	const [guestPhone, setGuestPhone] = useState("");
	const [message, setMessage] = useState("");
	const [quantity, setQuantity] = useState(1);
	const [errors, setErrors] = useState<FieldErrors>({});

	const showQuantitySelector = gift.remainingQuantity > 1;
	const isDebug = debugState != null;
	const renderedPhase = debugState?.phase ?? phase;
	const renderedGuestName = debugState?.guestName ?? guestName;
	const renderedUndoSecondsLeft =
		debugState?.undoSecondsLeft ?? undoSecondsLeft;
	const renderedUndoError = debugState?.undoError ?? undoError;
	const renderedPurchaseError =
		debugState?.purchaseErrorMessage ?? purchaseErrorMessage;
	const isSuccessLike =
		renderedPhase === "success" ||
		renderedPhase === "undo-available" ||
		renderedPhase === "undo-expired";

	function clearUndoTimers() {
		if (undoCountdownRef.current != null) {
			window.clearInterval(undoCountdownRef.current);
			undoCountdownRef.current = null;
		}

		if (undoPhaseTimeoutRef.current != null) {
			window.clearTimeout(undoPhaseTimeoutRef.current);
			undoPhaseTimeoutRef.current = null;
		}
	}

	const purchaseMutation = api.purchase.markGiftPurchased.useMutation({
		onError: (error) => {
			setPurchaseErrorMessage(error.message);
			setErrors((prev) => ({ ...prev, submit: error.message }));
			setPhase("purchase-error");
		},
		onSuccess: (data) => {
			setPurchaseId(data.purchase.id);
			setUndoTokenStored(data.undoToken);
			setErrors({});
			setPurchaseErrorMessage("");
			setUndoError("");
			setPhase("success");
			setUndoSecondsLeft(UNDO_WINDOW_SECONDS);
			clearUndoTimers();
			undoPhaseTimeoutRef.current = window.setTimeout(() => {
				setPhase("undo-available");
			}, 650);
			undoCountdownRef.current = window.setInterval(() => {
				setUndoSecondsLeft((previousSeconds) => {
					if (previousSeconds <= 1) {
						clearUndoTimers();
						setPhase("undo-expired");
						return 0;
					}

					return previousSeconds - 1;
				});
			}, 1000);
			router.refresh();
			toast.success("Regalo confirmado", {
				description: `Puedes deshacerlo durante ${UNDO_WINDOW_SECONDS} segundos.`,
				action: {
					label: "Deshacer",
					onClick: () =>
						undoMutation.mutate({
							purchaseId: data.purchase.id,
							undoToken: data.undoToken,
						}),
				},
			});
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

	useEffect(
		() => () => {
			if (undoCountdownRef.current != null) {
				window.clearInterval(undoCountdownRef.current);
			}
			if (undoPhaseTimeoutRef.current != null) {
				window.clearTimeout(undoPhaseTimeoutRef.current);
			}
		},
		[],
	);

	useSurfaceMotion(successStateRef, "modal", isSuccessLike);
	useSuccessCheckMotion(successCheckRef, isSuccessLike);
	useUndoRing(
		undoRingRef,
		renderedUndoSecondsLeft,
		UNDO_WINDOW_SECONDS,
		renderedPhase === "success" || renderedPhase === "undo-available",
	);

	function resetForm() {
		setGuestName("");
		setGuestEmail("");
		setGuestPhone("");
		setMessage("");
		setQuantity(1);
		setErrors({});
	}

	function resetAll() {
		clearUndoTimers();
		setUndoSecondsLeft(UNDO_WINDOW_SECONDS);
		setPhase("form");
		setPurchaseId("");
		setUndoTokenStored("");
		setUndoError("");
		setPurchaseErrorMessage("");
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
		setPurchaseErrorMessage("");
		setUndoError("");
		setPhase("loading");

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
				{isSuccessLike ? (
					<div className="flex max-h-[92svh] flex-col" ref={successStateRef}>
						<DialogHeader className="p-6 pb-2">
							<div className="mb-2 flex justify-center">
								<svg
									aria-hidden="true"
									className="size-16 text-primary"
									fill="none"
									viewBox="0 0 48 48"
								>
									<circle
										className="stroke-border"
										cx="24"
										cy="24"
										r="18"
										stroke="currentColor"
										strokeOpacity="0.18"
										strokeWidth="2"
									/>
									<path
										className="stroke-current"
										d="M16 24.5l5.5 5.5L32 19.5"
										ref={successCheckRef}
										stroke="currentColor"
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="3"
									/>
								</svg>
							</div>
							<DialogTitle>¡Regalo confirmado!</DialogTitle>
							<DialogDescription>
								{renderedGuestName.trim()
									? `¡Gracias, ${renderedGuestName.trim()}! Tu regalo fue marcado como comprado. Gracias por tu cariño y por ser parte de este momento.`
									: "¡Gracias! Tu regalo fue marcado como comprado. Gracias por tu cariño y por ser parte de este momento."}
							</DialogDescription>
						</DialogHeader>

						{renderedUndoError && (
							<p className="px-6 text-destructive text-sm">
								{renderedUndoError}
							</p>
						)}

						<DialogFooter className="sticky bottom-0 mt-4 min-h-12 bg-popover p-6 pt-2">
							{renderedPhase === "undo-expired" ? (
								<p className="text-muted-foreground text-sm">
									El tiempo para deshacer expiró
								</p>
							) : (
								<div className="flex items-center gap-3">
									<div className="relative size-10">
										<svg
											aria-hidden="true"
											className="size-10 -rotate-90"
											viewBox="0 0 40 40"
										>
											<circle
												className="stroke-border"
												cx="20"
												cy="20"
												fill="none"
												r="16"
												stroke="currentColor"
												strokeOpacity="0.2"
												strokeWidth="3"
											/>
											<circle
												className="stroke-primary"
												cx="20"
												cy="20"
												fill="none"
												r="16"
												ref={undoRingRef}
												stroke="currentColor"
												strokeLinecap="round"
												strokeWidth="3"
											/>
										</svg>
										<span className="absolute inset-0 flex items-center justify-center font-medium text-xs">
											{renderedUndoSecondsLeft}
										</span>
									</div>
									<Button
										className="public-btn"
										disabled={undoMutation.isPending || isDebug}
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
											: `Deshacer (${renderedUndoSecondsLeft} s)`}
									</Button>
								</div>
							)}
							<Button
								className="public-btn"
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
								{renderedPhase === "loading"
									? "Confirmando tu regalo…"
									: renderedPhase === "purchase-error"
										? "No pudimos confirmar tu regalo. Revisa los datos y vuelve a intentarlo."
										: "Comparte tu nombre para que el festejado sepa quién lo regaló."}
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
										disabled={renderedPhase === "loading"}
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
										disabled={renderedPhase === "loading"}
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
										disabled={renderedPhase === "loading"}
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
									<Textarea
										className="min-h-[80px]"
										disabled={renderedPhase === "loading"}
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
											disabled={renderedPhase === "loading"}
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
								{renderedPurchaseError && (
									<div className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-destructive text-sm">
										<CheckCircle2 className="mt-0.5 size-4 rotate-45" />
										<p>{renderedPurchaseError}</p>
									</div>
								)}
							</div>

							<DialogFooter className="sticky bottom-0 min-h-12 bg-popover p-6 pt-2">
								<Button
									className="public-btn"
									disabled={
										purchaseMutation.isPending || renderedPhase === "loading"
									}
									size="sm"
									type="submit"
								>
									{renderedPhase === "loading" ? (
										<>
											<LoaderCircle className="size-4 animate-spin" />
											Confirmando tu regalo…
										</>
									) : renderedPhase === "purchase-error" ? (
										"Volver a intentar"
									) : (
										"Confirmar regalo"
									)}
								</Button>
							</DialogFooter>
						</form>
					</>
				)}
			</DialogContent>
		</Dialog>
	);
}
