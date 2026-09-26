import { Locale } from "@/generated/prisma/enums";
import { formatEventDate } from "@/lib/format/dates";
import { cn } from "@/lib/utils";
import type {
	SeatingPassMemberViewModel,
	SeatingPassTableViewModel,
	SeatingPassViewModel,
} from "@/server/mappers/view-models";

export const EYEBROW =
	"font-mono text-[8.5px] font-medium uppercase tracking-[0.16em] text-muted-foreground";

export function CountdownPill({
	label,
	className,
}: {
	label: string | null;
	className?: string;
}) {
	if (!label) return null;
	return (
		<span
			className={cn(
				"inline-flex items-center rounded-full bg-primary px-2.5 py-1 font-semibold text-[11px] text-primary-foreground",
				className,
			)}
		>
			{label}
		</span>
	);
}

export function eventWhen(pass: SeatingPassViewModel): string {
	return formatEventDate(pass.eventDate, Locale.es, pass.eventTime);
}

export function PartyList({
	members,
}: {
	members: SeatingPassMemberViewModel[];
}) {
	return (
		<ul className="flex flex-col gap-2">
			{members.map((member) => (
				<li
					className="flex items-baseline justify-between gap-3 text-[13.5px]"
					key={member.id}
				>
					<span className="min-w-0 truncate text-card-foreground">
						{member.name}
					</span>
					<span
						className={cn(
							"shrink-0 text-right font-semibold",
							member.tableId ? "text-card-foreground" : "text-muted-foreground",
						)}
					>
						{member.label}
					</span>
				</li>
			))}
		</ul>
	);
}

export function Tablemates({
	tables,
}: {
	tables: SeatingPassTableViewModel[];
}) {
	const withMates = tables.filter((table) => table.mates.length > 0);
	if (withMates.length === 0) return null;
	return (
		<div className="flex flex-col gap-1 text-[12.5px] text-muted-foreground">
			{withMates.map((table) => (
				<p key={table.id}>
					En {table.label} también:{" "}
					<span className="text-card-foreground">{table.mates.join(", ")}</span>
				</p>
			))}
		</div>
	);
}

export function googleMapsUrl(location: string): string {
	return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
}

export function wazeUrl(location: string): string {
	return `https://waze.com/ul?q=${encodeURIComponent(location)}&navigate=yes`;
}

const LINK_PROPS = { target: "_blank", rel: "noopener noreferrer" } as const;

export function VenueLinks({
	location,
	variant,
}: {
	location: string | null;
	variant: "links" | "buttons";
}) {
	if (!location) return null;
	if (variant === "buttons") {
		return (
			<div className="flex flex-col gap-2">
				<div className="text-[12.5px] text-muted-foreground">{location}</div>
				<div className="flex gap-2">
					<a
						className="flex-1 rounded-full bg-primary px-3 py-2.5 text-center font-semibold text-[12.5px] text-primary-foreground"
						href={googleMapsUrl(location)}
						{...LINK_PROPS}
					>
						Abrir en Google Maps
					</a>
					<a
						className="rounded-full border border-border bg-card px-4 py-2.5 text-center font-semibold text-[12.5px] text-card-foreground"
						href={wazeUrl(location)}
						{...LINK_PROPS}
					>
						Waze
					</a>
				</div>
			</div>
		);
	}
	return (
		<div className="flex flex-col gap-1.5">
			<div className={EYEBROW}>Cómo llegar</div>
			<div className="text-[13px] text-card-foreground">{location}</div>
			<div className="flex gap-4 text-[12.5px]">
				<a
					className="text-accent-foreground underline"
					href={googleMapsUrl(location)}
					{...LINK_PROPS}
				>
					Google Maps
				</a>
				<a
					className="text-accent-foreground underline"
					href={wazeUrl(location)}
					{...LINK_PROPS}
				>
					Waze
				</a>
			</div>
		</div>
	);
}
