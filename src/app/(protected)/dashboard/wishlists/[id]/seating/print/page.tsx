import { notFound } from "next/navigation";
import { SeatingPrintSheet } from "@/components/features/dashboard/seating/seating-print-sheet";
import { toCanonicalWishlistUrl } from "@/lib/wishlist/share";
import { api } from "@/trpc/server";

type Props = {
	params: Promise<{ id: string }>;
};

const formatEventDate = (iso: string | null) =>
	iso
		? new Intl.DateTimeFormat("es-PE", { dateStyle: "long" }).format(
				new Date(iso),
			)
		: null;

export default async function DashboardWishlistSeatingPrintPage({
	params,
}: Props) {
	const { id } = await params;

	let board: Awaited<ReturnType<typeof api.seating.board>>;
	let wishlist: Awaited<ReturnType<typeof api.wishlist.getById>>;
	try {
		[board, wishlist] = await Promise.all([
			api.seating.board({ wishlistId: id }),
			api.wishlist.getById({ id }),
		]);
	} catch {
		notFound();
	}

	return (
		<SeatingPrintSheet
			board={board}
			eventDate={formatEventDate(wishlist.eventDate)}
			eventLocation={wishlist.eventLocation}
			eventName={wishlist.title}
			publicUrl={toCanonicalWishlistUrl(`/w/${wishlist.slug}`)}
			wishlistId={id}
		/>
	);
}
