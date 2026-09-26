import type { SeatingPassViewModel } from "@/server/mappers/view-models";
import {
	CountdownPill,
	EYEBROW,
	eventWhen,
	PartyList,
	Tablemates,
	VenueLinks,
} from "./shared";

/** 1a — Pase de mesa: a ticket with the table as a large numeral. */
export function PassVariant({ pass }: { pass: SeatingPassViewModel }) {
	const { headline } = pass;
	const isNumeral = headline.numeral !== headline.label;
	return (
		<div className="overflow-hidden rounded-xl border border-border bg-card shadow-[0_14px_34px_rgba(80,30,60,.1)]">
			<div className="px-[26px] pt-[24px] pb-[20px]">
				<div className={EYEBROW}>Mesa asignada · {pass.primaryName}</div>
				<div className="mt-2 flex items-end justify-between gap-3">
					{isNumeral ? (
						<div className="flex items-baseline gap-2">
							<span className="font-heading font-semibold text-[15px] text-muted-foreground uppercase tracking-[0.12em]">
								Mesa
							</span>
							<span className="font-heading font-semibold text-[64px] text-primary leading-none">
								{headline.numeral}
							</span>
						</div>
					) : (
						<span className="min-w-0 break-words font-heading font-semibold text-[30px] text-primary leading-[1.1]">
							{headline.label}
						</span>
					)}
					<CountdownPill
						className="mb-1 shrink-0"
						label={pass.countdownLabel}
					/>
				</div>
				<div className="mt-3 text-[12.5px] text-muted-foreground">
					{eventWhen(pass)}
				</div>
			</div>

			<div className="relative">
				<span className="absolute top-0 -left-2 size-4 -translate-y-1/2 rounded-full border border-border bg-background" />
				<span className="absolute top-0 -right-2 size-4 -translate-y-1/2 rounded-full border border-border bg-background" />
				<div className="mx-[18px] border-border border-t border-dashed" />
			</div>

			<div className="flex flex-col gap-4 px-[26px] pt-[18px] pb-[22px]">
				<div>
					<div className={`${EYEBROW} mb-2.5`}>Tu grupo</div>
					<PartyList members={pass.members} />
				</div>
				<Tablemates tables={pass.tables} />
				<VenueLinks location={pass.location} variant="links" />
			</div>
		</div>
	);
}
