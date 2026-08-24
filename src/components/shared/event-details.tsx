import type { ReactNode } from "react";
import { formatEventDate, formatEventTimeRange } from "@/lib/format/dates";
import { cn } from "@/lib/utils";

type EventDetailsWishlist = {
	eventDate: string | null;
	eventTime: string | null;
	endTime?: string | null;
	eventLocation: string | null;
	dressCode: string | null;
	language: string;
};

type EventDetailsVariant = "block" | "compact";
type EventDetailsSize = "sm" | "md";

type Props = {
	wishlist: EventDetailsWishlist;
	variant?: EventDetailsVariant;
	size?: EventDetailsSize;
	/** Compact-only: one column, divider lines between rows, no gaps. */
	stacked?: boolean;
	className?: string;
};

const DRESS_CODE_LABEL: Record<EventDetailsVariant, string> = {
	block: "Código de vestimenta",
	compact: "Dresscode",
};

type EventDetail = { label: string; value: ReactNode };

export function EventDetails({
	wishlist,
	variant = "block",
	size = "sm",
	stacked = false,
	className,
}: Props) {
	const eventTimeRange = formatEventTimeRange(
		wishlist.eventTime,
		wishlist.endTime,
		wishlist.language as "es" | "en",
	);
	const detailItems: Array<EventDetail | null> = [
		wishlist.eventDate
			? {
					label: "Fecha",
					value: (
						<>
							<span>
								{formatEventDate(
									wishlist.eventDate,
									wishlist.language as "es" | "en",
								)}
							</span>
							{eventTimeRange && (
								<span className="mt-1 block whitespace-nowrap">
									{eventTimeRange}
								</span>
							)}
						</>
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
	];
	const details = detailItems.filter(
		(detail): detail is EventDetail => detail !== null,
	);

	if (details.length === 0) return null;

	if (variant === "compact") {
		const isMd = size === "md";

		if (stacked) {
			return (
				<section
					className={cn(
						"grid grid-cols-1 divide-y divide-border overflow-hidden rounded-[14px] border border-border bg-card",
						isMd && "rounded-[16px]",
						className,
					)}
				>
					{details.map((detail) => (
						<div
							className={cn("px-4 py-3 text-center", isMd && "px-5 py-4")}
							key={detail.label}
						>
							<p
								className={cn(
									"font-mono text-[9px] text-muted-foreground uppercase tracking-[0.16em]",
									isMd && "text-[10px]",
								)}
							>
								{detail.label}
							</p>
							<p
								className={cn(
									"mt-1 font-heading font-semibold text-[15px]",
									isMd && "mt-2 text-[17px]",
								)}
							>
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
					"grid grid-cols-1 gap-3 sm:grid-cols-3",
					isMd && "gap-4",
					className,
				)}
			>
				{details.map((detail) => (
					<div
						className={cn(
							"rounded-[14px] border border-border bg-card px-4 py-3 text-center",
							isMd && "rounded-[16px] px-5 py-4",
						)}
						key={detail.label}
					>
						<p
							className={cn(
								"font-mono text-[9px] text-muted-foreground uppercase tracking-[0.16em]",
								isMd && "text-[10px]",
							)}
						>
							{detail.label}
						</p>
						<p
							className={cn(
								"mt-1 font-heading font-semibold text-[15px]",
								isMd && "mt-2 text-[17px]",
							)}
						>
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
