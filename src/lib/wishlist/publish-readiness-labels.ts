import type { PublishReadinessChecks } from "@/lib/wishlist/publish-readiness";

export const CHECK_LABELS: Record<keyof PublishReadinessChecks, string> = {
	title: "Tiene título",
	eventType: "Tiene tipo de evento",
	slug: "Tiene enlace público válido",
	language: "Tiene idioma",
	currency: "Tiene moneda",
	visibleGift: "Tiene al menos un regalo visible",
	images: "Tiene suficientes fotos de portada para su disposición",
};
