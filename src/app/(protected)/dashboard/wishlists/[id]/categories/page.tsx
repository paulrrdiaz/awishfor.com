import { notFound } from "next/navigation";
import { CategoryPanel } from "@/components/features/dashboard/categories/category-panel";
import { api } from "@/trpc/server";

type Props = {
	params: Promise<{ id: string }>;
};

export default async function DashboardWishlistCategoriesPage({
	params,
}: Props) {
	const { id } = await params;

	try {
		await api.category.list({ wishlistId: id });
	} catch {
		notFound();
	}

	return (
		<div className="mx-auto w-full max-w-3xl px-4 py-8">
			<div className="mb-8">
				<h1 className="mb-1 font-semibold text-2xl text-gray-900">
					Categorías
				</h1>
				<p className="text-gray-500 text-sm">
					Organiza los filtros públicos de esta lista y revisa cuántos regalos
					tiene cada categoría.
				</p>
			</div>
			<CategoryPanel wishlistId={id} />
		</div>
	);
}
