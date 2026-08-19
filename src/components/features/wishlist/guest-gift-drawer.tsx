"use client";

import {
	ArrowLeft,
	CheckCircle2,
	ExternalLink,
	LoaderCircle,
	XIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
	type ReactNode,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
import { CopyButton } from "@/components/shared/copy-button";
import { DeliveryItems } from "@/components/shared/delivery-items";
import { Button } from "@/components/ui/button";
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHandle,
	DrawerHeader,
	DrawerTitle,
} from "@/components/ui/drawer";
import { Textarea } from "@/components/ui/textarea";
import type { ComposedDelivery } from "@/lib/format/delivery";
import { useSuccessCheckMotion } from "@/lib/gsap/use-success-check-motion";
import type { PublicGiftViewModel } from "@/server/mappers/view-models";
import {
	PURCHASE_GUEST_NAME_MAX_LENGTH,
	PURCHASE_GUEST_NAME_MIN_LENGTH,
} from "@/server/validators/purchase.schema";
import { api } from "@/trpc/react";

const MESSAGE_MAX_LENGTH = 500;
const inputClassName =
	"w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30";

export type GuestGiftDrawerView = "product" | "purchase" | "success";

type FieldErrors = {
	guestName?: string;
	guestEmail?: string;
	message?: string;
	submit?: string;
};

type Props = {
	gift: PublicGiftViewModel;
	open: boolean;
	view: GuestGiftDrawerView;
	onOpenChange: (open: boolean) => void;
	onViewChange: (view: GuestGiftDrawerView) => void;
	productFromPurchase?: boolean;
	delivery?: ComposedDelivery | null;
	container?: HTMLElement | null;
	debugState?: {
		view: GuestGiftDrawerView;
		guestName?: string;
		undoExpiresAt?: string | null;
		isLoading?: boolean;
		purchaseError?: string;
		undoError?: string;
	};
};

export function GuestGiftDrawer({
	gift,
	open,
	view,
	onOpenChange,
	onViewChange,
	productFromPurchase = false,
	delivery,
	container,
	debugState,
}: Props) {
	const router = useRouter();
	const successCheckRef = useRef<SVGPathElement>(null);
	const expiryTimeoutRef = useRef<number | null>(null);
	const [guestName, setGuestName] = useState("");
	const [guestEmail, setGuestEmail] = useState("");
	const [message, setMessage] = useState("");
	const [quantity, setQuantity] = useState(1);
	const [errors, setErrors] = useState<FieldErrors>({});
	const [purchaseId, setPurchaseId] = useState("");
	const [undoToken, setUndoToken] = useState("");
	const [undoExpiresAt, setUndoExpiresAt] = useState<string | null>(null);
	const [undoAvailable, setUndoAvailable] = useState(false);
	const [undoError, setUndoError] = useState("");
	const [purchaseError, setPurchaseError] = useState("");

	const renderedView = debugState?.view ?? view;
	const renderedName = debugState?.guestName ?? guestName;
	const renderedUndoError = debugState?.undoError ?? undoError;
	const renderedPurchaseError = debugState?.purchaseError ?? purchaseError;
	const renderedExpiresAt = debugState?.undoExpiresAt ?? undoExpiresAt;
	const showQuantitySelector = gift.quantityNeeded > 1;
	const hasDelivery = Boolean(delivery?.address);

	useSuccessCheckMotion(successCheckRef, renderedView === "success");

	const clearExpiryTimer = useCallback(() => {
		if (expiryTimeoutRef.current != null) {
			window.clearTimeout(expiryTimeoutRef.current);
			expiryTimeoutRef.current = null;
		}
	}, []);

	useEffect(() => () => clearExpiryTimer(), [clearExpiryTimer]);

	useEffect(() => {
		clearExpiryTimer();
		if (!renderedExpiresAt || renderedView !== "success") {
			setUndoAvailable(false);
			return;
		}

		const remaining = new Date(renderedExpiresAt).getTime() - Date.now();
		if (remaining <= 0) {
			setUndoAvailable(false);
			return;
		}
		setUndoAvailable(true);
		expiryTimeoutRef.current = window.setTimeout(
			() => {
				setUndoAvailable(false);
			},
			Math.min(remaining, 2_147_483_647),
		);
	}, [clearExpiryTimer, renderedExpiresAt, renderedView]);

	function reset() {
		clearExpiryTimer();
		setGuestName("");
		setGuestEmail("");
		setMessage("");
		setQuantity(1);
		setErrors({});
		setPurchaseId("");
		setUndoToken("");
		setUndoExpiresAt(null);
		setUndoAvailable(false);
		setUndoError("");
		setPurchaseError("");
	}

	function handleOpenChange(nextOpen: boolean) {
		if (!nextOpen) reset();
		onOpenChange(nextOpen);
	}

	function validate(): boolean {
		const nextErrors: FieldErrors = {};
		const name = guestName.trim();
		if (
			name.length < PURCHASE_GUEST_NAME_MIN_LENGTH ||
			name.length > PURCHASE_GUEST_NAME_MAX_LENGTH
		) {
			nextErrors.guestName = `El nombre debe tener entre ${PURCHASE_GUEST_NAME_MIN_LENGTH} y ${PURCHASE_GUEST_NAME_MAX_LENGTH} caracteres`;
		}
		if (guestEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail)) {
			nextErrors.guestEmail = "Ingresa un correo electrónico válido";
		}
		if (message.trim().length > MESSAGE_MAX_LENGTH) {
			nextErrors.message = `El mensaje debe tener como máximo ${MESSAGE_MAX_LENGTH} caracteres`;
		}
		setErrors(nextErrors);
		return Object.keys(nextErrors).length === 0;
	}

	const purchaseMutation = api.purchase.markGiftPurchased.useMutation({
		onError: (error) => {
			setPurchaseError(error.message);
			setErrors((current) => ({ ...current, submit: error.message }));
		},
		onSuccess: (data) => {
			setPurchaseId(data.purchase.id);
			setUndoToken(data.undoToken);
			setUndoExpiresAt(data.undoExpiresAt);
			setUndoError("");
			setPurchaseError("");
			setErrors({});
			onViewChange("success");
			router.refresh();
		},
	});

	const undoMutation = api.purchase.undoRecentPurchase.useMutation({
		onError: (error) => setUndoError(error.message),
		onSuccess: () => {
			router.refresh();
			reset();
			onOpenChange(false);
		},
	});
	const purchasePending = debugState?.isLoading ?? purchaseMutation.isPending;

	function submit(event: React.FormEvent) {
		event.preventDefault();
		if (!validate()) return;
		setPurchaseError("");
		setUndoError("");
		purchaseMutation.mutate({
			giftId: gift.id,
			guestName: guestName.trim(),
			guestEmail: guestEmail.trim() || undefined,
			message: message.trim() || undefined,
			quantity: showQuantitySelector ? quantity : 1,
		});
	}

	return (
		<Drawer container={container} onOpenChange={handleOpenChange} open={open}>
			<DrawerContent
				className="mx-auto max-w-[560px] rounded-t-[24px] border-border bg-popover pb-[env(safe-area-inset-bottom)]"
				overlayClassName="bg-foreground/35 supports-backdrop-filter:backdrop-blur-sm"
				showCloseButton={false}
			>
				<DrawerHandle />
				<DrawerHeader className="relative px-6 pt-4 pb-3">
					<DrawerTitle>
						{renderedView === "product"
							? "Vas a salir de A Wish For"
							: renderedView === "success"
								? "¡Regalo confirmado!"
								: `Regalar: ${gift.name}`}
					</DrawerTitle>
					<DrawerDescription>
						{renderedView === "product"
							? "Abrirás la tienda en una pestaña nueva."
							: renderedView === "success"
								? "Tu regalo quedó marcado en esta lista."
								: "Comparte tu nombre para que quienes organizan la lista sepan quién lo regaló."}
					</DrawerDescription>
					<DrawerClose asChild>
						<Button
							aria-label="Cerrar"
							className="public-btn absolute top-2 right-3"
							size="icon-sm"
							type="button"
							variant="ghost"
						>
							<XIcon />
						</Button>
					</DrawerClose>
				</DrawerHeader>

				{renderedView === "product" && (
					<>
						<div className="space-y-5 px-6 py-3 text-sm leading-relaxed">
							{hasDelivery && delivery && (
								<div className="rounded-xl border border-border bg-muted/50 p-4">
									<p className="font-mono text-[9px] text-muted-foreground uppercase tracking-[0.16em]">
										Envío a domicilio
									</p>
									<p className="mt-1 font-heading font-semibold">
										Envíalo a esta dirección
									</p>
									<DeliveryItems
										className="mt-3 border-border/70 border-t pt-3 text-muted-foreground"
										delivery={delivery}
									/>
									<div className="mt-4">
										<CopyButton
											className="public-btn w-full justify-center"
											value={delivery.line}
										/>
									</div>
								</div>
							)}
							<p className="text-muted-foreground">
								Vuelve después y márcalo como comprado — así nadie más lo
								repite.
							</p>
						</div>
						<DrawerFooter className="px-6 pt-3 pb-5">
							<a
								className="public-btn inline-flex h-10 items-center justify-center gap-2 bg-primary px-4 text-primary-foreground text-sm hover:bg-primary/90"
								href={gift.productUrl ?? undefined}
								onClick={() => {
									if (productFromPurchase) onViewChange("purchase");
								}}
								rel="noopener noreferrer"
								target="_blank"
							>
								<ExternalLink className="size-4" /> Ir a la tienda
							</a>
							{productFromPurchase ? (
								<Button
									className="public-btn"
									onClick={() => onViewChange("purchase")}
									type="button"
									variant="outline"
								>
									<ArrowLeft /> Volver al formulario
								</Button>
							) : (
								<DrawerClose asChild>
									<Button
										className="public-btn"
										type="button"
										variant="outline"
									>
										Cerrar
									</Button>
								</DrawerClose>
							)}
						</DrawerFooter>
					</>
				)}

				{renderedView === "purchase" && (
					<form
						className="flex max-h-[calc(92svh-7rem)] flex-col"
						noValidate
						onSubmit={submit}
					>
						<div className="space-y-4 overflow-y-auto px-6 py-3">
							{gift.productUrl && (
								<button
									className="text-primary text-sm underline underline-offset-4"
									onClick={() => onViewChange("product")}
									type="button"
								>
									Ver producto
								</button>
							)}
							<Field
								error={errors.guestName}
								htmlFor="guest-gift-name"
								label="Tu nombre *"
							>
								<input
									autoComplete="name"
									className={inputClassName}
									disabled={purchasePending}
									id="guest-gift-name"
									maxLength={PURCHASE_GUEST_NAME_MAX_LENGTH}
									onChange={(event) => setGuestName(event.target.value)}
									required
									value={guestName}
								/>
							</Field>
							<Field
								error={errors.guestEmail}
								htmlFor="guest-gift-email"
								label="Correo electrónico (opcional)"
							>
								<input
									autoComplete="email"
									className={inputClassName}
									disabled={purchasePending}
									id="guest-gift-email"
									onChange={(event) => setGuestEmail(event.target.value)}
									type="email"
									value={guestEmail}
								/>
							</Field>
							<Field
								error={errors.message}
								htmlFor="guest-gift-message"
								label="Mensaje (opcional)"
							>
								<Textarea
									disabled={purchasePending}
									id="guest-gift-message"
									maxLength={MESSAGE_MAX_LENGTH}
									onChange={(event) => setMessage(event.target.value)}
									value={message}
								/>
							</Field>
							{showQuantitySelector && (
								<Field htmlFor="guest-gift-quantity" label="Cantidad">
									<input
										className={inputClassName}
										disabled={purchasePending || gift.remainingQuantity === 1}
										id="guest-gift-quantity"
										max={gift.remainingQuantity}
										min="1"
										onChange={(event) =>
											setQuantity(
												Math.max(
													1,
													Math.min(
														gift.remainingQuantity,
														Number(event.target.value) || 1,
													),
												),
											)
										}
										type="number"
										value={quantity}
									/>
								</Field>
							)}
							{renderedPurchaseError && (
								<p className="text-destructive text-sm">
									{renderedPurchaseError}
								</p>
							)}
							<p className="text-muted-foreground text-xs leading-relaxed">
								Al marcar este regalo como comprado, compartiremos tu nombre y
								los datos opcionales que ingreses con quienes organizan la
								lista.
							</p>
						</div>
						<DrawerFooter className="border-border border-t bg-popover px-6 pt-3 pb-5">
							<Button
								className="public-btn w-full"
								disabled={purchasePending}
								type="submit"
							>
								{purchasePending ? (
									<LoaderCircle className="animate-spin" />
								) : null}
								{purchasePending ? "Confirmando…" : "Confirmar regalo"}
							</Button>
						</DrawerFooter>
					</form>
				)}

				{renderedView === "success" && (
					<>
						<div className="space-y-3 px-6 py-5 text-center">
							<CheckCircle2
								aria-hidden="true"
								className="mx-auto size-14 text-primary"
							/>
							<p className="font-medium text-primary text-xs tracking-[0.16em]">
								ÉXITO
							</p>
							<h3 className="font-heading font-semibold text-2xl">
								¡Gracias, {renderedName.trim() || "amiga"}! Tu regalo quedó
								marcado.
							</h3>
							<p className="text-muted-foreground">
								Gracias por ser parte de este momento
							</p>
							{renderedUndoError && (
								<p className="text-destructive text-sm">{renderedUndoError}</p>
							)}
						</div>
						<DrawerFooter className="px-6 pt-3 pb-5">
							{undoAvailable && (
								<Button
									className="public-btn"
									disabled={undoMutation.isPending || Boolean(debugState)}
									onClick={() => undoMutation.mutate({ purchaseId, undoToken })}
									type="button"
									variant="outline"
								>
									{undoMutation.isPending ? "Deshaciendo…" : "Deshacer"}
								</Button>
							)}
							<DrawerClose asChild>
								<Button className="public-btn" type="button">
									Cerrar
								</Button>
							</DrawerClose>
						</DrawerFooter>
					</>
				)}
			</DrawerContent>
		</Drawer>
	);
}

function Field({
	children,
	error,
	htmlFor,
	label,
}: {
	children: ReactNode;
	error?: string;
	htmlFor: string;
	label: string;
}) {
	return (
		<div className="flex flex-col gap-1">
			<label className="font-medium text-sm" htmlFor={htmlFor}>
				{label}
			</label>
			{children}
			{error && <p className="text-destructive text-xs">{error}</p>}
		</div>
	);
}
