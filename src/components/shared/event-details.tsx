import { formatEventDate } from "@/lib/format/dates";

type EventDetailsWishlist = {
	eventDate: string | null;
	eventTime: string | null;
	eventLocation: string | null;
	dressCode: string | null;
	language: string;
};

type Props = {
	wishlist: EventDetailsWishlist;
};

export function EventDetails({ wishlist }: Props) {
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
					label: "Código de vestimenta",
					value: wishlist.dressCode,
				}
			: null,
	].filter((detail): detail is { label: string; value: string } =>
		Boolean(detail),
	);

	if (details.length === 0) return null;

	return (
		<section className="mx-auto grid w-full max-w-4xl grid-cols-1 gap-3 px-6 py-6 sm:grid-cols-3">
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
