import { formatEventDate } from "@/lib/format/dates";
import { cn } from "@/lib/utils";

type EventDetailsWishlist = {
	eventDate: string | null;
	eventTime: string | null;
	eventLocation: string | null;
	dressCode: string | null;
	language: string;
};

type EventDetailsVariant = "block" | "compact";

type Props = {
	wishlist: EventDetailsWishlist;
	variant?: EventDetailsVariant;
	className?: string;
};

const DRESS_CODE_LABEL: Record<EventDetailsVariant, string> = {
	block: "Código de vestimenta",
	compact: "Dresscode",
};

export function EventDetails({
	wishlist,
	variant = "block",
	className,
}: Props) {
	const details = [
		wishlist.eventDate
			? {
					label: "Fecha",
					value: formatEventDate(
						wishlist.eventDate,
						wishlist.language as "es" | "en",
						wishlist.eventTime,
					),
				}
			: null,
		wishlist.eventLocation
			? {
					label: "Lugar",
					value: wishlist.eventLocation,
				}
			: null,
		wishlist.dressCode
			? {
					label: DRESS_CODE_LABEL[variant],
					value: wishlist.dressCode,
				}
			: null,
	].filter((detail): detail is { label: string; value: string } =>
		Boolean(detail),
	);

	if (details.length === 0) return null;

	if (variant === "compact") {
		return (
			<section
				className={cn("grid grid-cols-1 gap-3 sm:grid-cols-3", className)}
			>
				{details.map((detail) => (
					<div
						className="rounded-[14px] border border-border bg-card px-4 py-3 text-center"
						key={detail.label}
					>
						<p className="font-mono text-[9px] text-muted-foreground uppercase tracking-[0.16em]">
							{detail.label}
						</p>
						<p className="mt-1 font-heading font-semibold text-[15px]">
							{detail.value}
						</p>
					</div>
				))}
			</section>
		);
	}

	return (
		<section
			className={cn(
				"mx-auto grid w-full max-w-4xl grid-cols-1 gap-3 px-6 py-6 sm:grid-cols-3",
				className,
			)}
		>
			{details.map((detail) => (
				<div
					className="rounded-lg border border-border bg-card p-4 text-card-foreground"
					key={detail.label}
				>
					<p className="font-medium text-muted-foreground text-xs uppercase">
						{detail.label}
					</p>
					<p className="mt-2 text-sm leading-relaxed">{detail.value}</p>
				</div>
			))}
		</section>
	);
}
