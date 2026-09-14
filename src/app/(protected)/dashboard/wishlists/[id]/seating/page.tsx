import { notFound } from "next/navigation";
import { SeatingBoard } from "@/components/features/dashboard/seating/seating-board";
import { api } from "@/trpc/server";

type Props = {
	params: Promise<{ id: string }>;
};

export default async function DashboardWishlistSeatingPage({ params }: Props) {
	const { id } = await params;

	let board: Awaited<ReturnType<typeof api.seating.board>>;
	try {
		board = await api.seating.board({ wishlistId: id });
	} catch {
		notFound();
	}

	// `SeatingBoard` branches between the no-guests block state, the no-tables
	// first-run state, and the editor — all three need the same board payload
	// and the same mutation wiring, so the split lives one level down.
	return <SeatingBoard initialBoard={board} wishlistId={id} />;
}
