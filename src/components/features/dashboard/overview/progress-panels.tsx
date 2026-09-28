import type { Currency, Locale } from "@/generated/prisma/enums";
import { formatMoney } from "@/lib/format/money";

type PurchaseProgressProps = {
	purchasedUnits: number;
	totalUnits: number;
};

export function PurchaseProgressPanel({
	purchasedUnits,
	totalUnits,
}: PurchaseProgressProps) {
	if (totalUnits === 0) {
		return (
			<div className="rounded-lg border border-border bg-card p-5 shadow-sm">
				<h2 className="font-semibold text-[15px]">Progreso de compras</h2>
				<p className="mt-3 text-muted-foreground text-sm">
					Aún no hay regalos en esta wishlist.
				</p>
			</div>
		);
	}

	const percent = Math.round((purchasedUnits / totalUnits) * 100);

	return (
		<div className="rounded-lg border border-border bg-card p-5 shadow-sm">
			<h2 className="font-semibold text-[15px]">Progreso de compras</h2>
			<div className="mt-2 flex items-baseline gap-2">
				<span className="font-heading text-[30px] leading-none">
					{percent}%
				</span>
				<span className="text-muted-foreground text-xs">
					{purchasedUnits} de {totalUnits} regalos
				</span>
			</div>
			<div className="mt-3 h-2 overflow-hidden rounded-full bg-border">
				<div
					className="h-full rounded-full bg-primary"
					style={{ width: `${percent}%` }}
				/>
			</div>
		</div>
	);
}

type ApproxValuePanelProps = {
	approxValue: {
		receivedAmount: string;
		goalAmount: string;
		pricedGiftCount: number;
		visibleGiftCount: number;
		foreignReceived: { currency: string; amount: string }[];
	};
	currency: Currency;
	language: string;
};

export function ApproxValuePanel({
	approxValue,
	currency,
	language,
}: ApproxValuePanelProps) {
	const moneyOptions = { currency, locale: language as Locale };
	const foreignNote = approxValue.foreignReceived
		.map(
			({ amount, currency: foreignCurrency }) =>
				`+ ${formatMoney(amount, {
					currency: foreignCurrency as Currency,
					locale: language as Locale,
				})} en otra moneda (no incluido)`,
		)
		.join(" · ");

	if (approxValue.pricedGiftCount === 0) {
		return (
			<div className="rounded-lg border border-border bg-card p-5 shadow-sm">
				<h2 className="font-semibold text-[15px]">Valor aproximado recibido</h2>
				<p className="mt-3 text-muted-foreground text-sm">
					Agrega precios a tus regalos para ver el valor aproximado.
				</p>
				{foreignNote && (
					<p className="mt-2 text-muted-foreground text-xs">{foreignNote}</p>
				)}
			</div>
		);
	}

	const goal = Number(approxValue.goalAmount);
	const percent =
		goal > 0
			? Math.round((Number(approxValue.receivedAmount) / goal) * 100)
			: 0;

	return (
		<div className="rounded-lg border border-border bg-card p-5 shadow-sm">
			<h2 className="font-semibold text-[15px]">Valor aproximado recibido</h2>
			<div className="mt-2 flex items-baseline gap-2">
				<span className="font-heading text-[30px] leading-none">
					{formatMoney(approxValue.receivedAmount, moneyOptions)}
				</span>
				<span className="text-muted-foreground text-xs">
					de {formatMoney(approxValue.goalAmount, moneyOptions)}
				</span>
			</div>
			<div className="mt-3 h-2 overflow-hidden rounded-full bg-border">
				<div
					className="h-full rounded-full bg-primary"
					style={{ width: `${percent}%` }}
				/>
			</div>
			{approxValue.pricedGiftCount < approxValue.visibleGiftCount && (
				<p className="mt-2 text-muted-foreground text-xs">
					{approxValue.pricedGiftCount} de {approxValue.visibleGiftCount}{" "}
					regalos con precio
				</p>
			)}
			{foreignNote && (
				<p className="mt-2 text-muted-foreground text-xs">{foreignNote}</p>
			)}
		</div>
	);
}

type InvitationProgressProps = {
	openedInvitations: number;
	unopenedInvitations: number;
	totalInvitations: number;
};

export function InvitationProgressPanel({
	openedInvitations,
	unopenedInvitations,
	totalInvitations,
}: InvitationProgressProps) {
	if (totalInvitations === 0) {
		return (
			<div className="rounded-lg border border-border bg-card p-5 shadow-sm">
				<h2 className="font-semibold text-[15px]">Invitaciones abiertas</h2>
				<p className="mt-3 text-muted-foreground text-sm">
					Aún no se han enviado invitaciones.
				</p>
			</div>
		);
	}

	return (
		<div className="rounded-lg border border-border bg-card p-5 shadow-sm">
			<h2 className="font-semibold text-[15px]">Invitaciones abiertas</h2>
			<div className="mt-2 flex items-baseline gap-2">
				<span className="font-heading text-[30px] leading-none">
					{openedInvitations}
					<span className="text-base text-muted-foreground">
						/{totalInvitations}
					</span>
				</span>
				<span className="text-muted-foreground text-xs">
					invitaciones abiertas
				</span>
			</div>
			{unopenedInvitations > 0 && (
				<p className="mt-1.5 font-semibold text-amber-700 text-xs">
					{unopenedInvitations} sin abrir · recordar por WhatsApp
				</p>
			)}
		</div>
	);
}
