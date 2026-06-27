import { notFound } from "next/navigation";
import { GiftGroup } from "@/components/features/dashboard/gifts/gift-group";
import { api } from "@/trpc/server";

type Props = {
	params: Promise<{ id: string }>;
};

export default async function DashboardWishlistGiftsPage({ params }: Props) {
	const { id } = await params;

	let grouped: Awaited<ReturnType<typeof api.gift.list>>;
	try {
		grouped = await api.gift.list({ wishlistId: id });
	} catch {
		notFound();
	}

	const totalGifts =
		grouped.available.length + grouped.purchased.length + grouped.hidden.length;

	return (
		<div className="mx-auto w-full max-w-3xl px-4 py-8">
			<h1 className="mb-1 font-semibold text-2xl text-gray-900">Regalos</h1>
			<p className="mb-8 text-gray-500 text-sm">
				{totalGifts === 0
					? "Aún no hay regalos en esta lista."
					: `${totalGifts} regalo${totalGifts !== 1 ? "s" : ""} en total`}
			</p>

			{totalGifts === 0 ? (
				<div className="rounded-2xl border border-gray-200 border-dashed px-6 py-12 text-center text-gray-400 text-sm">
					Agrega regalos desde la lista pública o el asistente.
				</div>
			) : (
				<GiftGroup
					available={grouped.available}
					hidden={grouped.hidden}
					purchased={grouped.purchased}
					wishlistId={id}
				/>
			)}
		</div>
	);
}
