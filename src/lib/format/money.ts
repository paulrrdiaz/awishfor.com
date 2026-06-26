import type { Currency, Locale } from "@/generated/prisma/client";

const INTL_LOCALE: Record<Currency, string> = {
	PEN: "es-PE",
	USD: "en-US",
	EUR: "en-GB",
	MXN: "es-MX",
	COP: "es-CO",
	CLP: "es-CL",
	ARS: "es-AR",
};

export function formatMoney(
	amount: number | string,
	{ currency, locale: _locale }: { currency: Currency; locale: Locale },
): string {
	const value = typeof amount === "string" ? Number.parseFloat(amount) : amount;
	return new Intl.NumberFormat(INTL_LOCALE[currency], {
		style: "currency",
		currency,
	}).format(value);
}
