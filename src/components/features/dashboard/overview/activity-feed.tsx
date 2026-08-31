import type { Locale } from "@/generated/prisma/enums";
import { formatRelativeDate } from "@/lib/format/dates";
import type { DashboardActivityEntryViewModel } from "@/server/mappers/view-models";

const KIND_LABELS: Record<DashboardActivityEntryViewModel["kind"], string> = {
	rsvp: "RSVP",
	purchase: "Compra",
	invite_opened: "Vista",
};

const KIND_STYLES: Record<DashboardActivityEntryViewModel["kind"], string> = {
	rsvp: "bg-primary/20 text-secondary",
	purchase: "bg-muted text-muted-foreground",
	invite_opened: "bg-accent text-accent-foreground",
};

function getInitials(label: string): string {
	return (label.split(" ")[0] ?? "").slice(0, 2).toUpperCase();
}

type Props = {
	activity: DashboardActivityEntryViewModel[];
	language: string;
};

export function ActivityFeed({ activity, language }: Props) {
	return (
		<section className="rounded-lg border border-border bg-card p-5 shadow-sm">
			<h2 className="mb-5 font-semibold text-[15px]">Actividad reciente</h2>

			{activity.length === 0 ? (
				<div className="rounded-lg border border-border border-dashed px-4 py-8 text-center text-muted-foreground text-sm">
					Aún no hay actividad registrada.
				</div>
			) : (
				<ul className="divide-y divide-border">
					{activity.map((entry) => (
						<li className="flex items-center gap-3 py-3" key={entry.id}>
							<div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary font-semibold text-secondary-foreground text-xs">
								{getInitials(entry.label) || "?"}
							</div>
							<div className="min-w-0 flex-1">
								<p className="truncate font-medium text-sm">{entry.label}</p>
								<p className="mt-0.5 text-muted-foreground text-xs">
									{formatRelativeDate(entry.occurredAt, language as Locale)}
								</p>
							</div>
							<span
								className={`shrink-0 rounded-full px-2 py-0.5 font-medium text-xs ${KIND_STYLES[entry.kind]}`}
							>
								{KIND_LABELS[entry.kind]}
							</span>
						</li>
					))}
				</ul>
			)}
		</section>
	);
}
