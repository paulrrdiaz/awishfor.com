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
		<div className="w-full px-7 py-5">
			<div className="mb-6">
				<h2 className="mb-1 font-semibold text-base text-foreground">
					Categorías
				</h2>
				<p className="text-muted-foreground text-sm">
					Organiza los filtros públicos de esta lista y revisa cuántos regalos
					tiene cada categoría.
				</p>
			</div>
			<CategoryPanel wishlistId={id} />
		</div>
	);
}
