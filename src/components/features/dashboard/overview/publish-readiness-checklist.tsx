import { CheckCircle2, Circle } from "lucide-react";
import type { DashboardWishlistOverviewViewModel } from "@/server/mappers/view-models";

const CHECK_LABELS: Record<
	keyof DashboardWishlistOverviewViewModel["readiness"]["checks"],
	string
> = {
	title: "Tiene título",
	eventType: "Tiene tipo de evento",
	slug: "Tiene enlace público válido",
	language: "Tiene idioma",
	currency: "Tiene moneda",
	visibleGift: "Tiene al menos un regalo visible",
};

type Props = {
	readiness: DashboardWishlistOverviewViewModel["readiness"];
};

export function PublishReadinessChecklist({ readiness }: Props) {
	return (
		<section className="rounded-xl border border-border bg-card p-5 shadow-sm">
			<div className="mb-5">
				<h2 className="font-heading font-semibold text-xl">
					Lista para publicar
				</h2>
				<p className="mt-1 text-muted-foreground text-sm">
					Completa estos puntos antes de compartirla.
				</p>
			</div>
			<ul className="grid gap-3 sm:grid-cols-2">
				{Object.entries(readiness.checks).map(([key, passed]) => (
					<li className="flex items-center gap-2 text-sm" key={key}>
						{passed ? (
							<CheckCircle2 className="size-4 text-primary" />
						) : (
							<Circle className="size-4 text-muted-foreground" />
						)}
						<span
							className={passed ? "text-foreground" : "text-muted-foreground"}
						>
							{
								CHECK_LABELS[
									key as keyof DashboardWishlistOverviewViewModel["readiness"]["checks"]
								]
							}
						</span>
					</li>
				))}
			</ul>
		</section>
	);
}
