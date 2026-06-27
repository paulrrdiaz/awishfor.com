"use client";

import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import type { RouterOutputs } from "@/trpc/react";
import { api } from "@/trpc/react";
import { AddCategoryForm } from "./add-category-form";
import { CategoryRow } from "./category-row";

type Category = RouterOutputs["category"]["list"][number];

type Props = {
	wishlistId: string;
};

export function CategoryPanel({ wishlistId }: Props) {
	const utils = api.useUtils();
	const categoriesQuery = api.category.list.useQuery({ wishlistId });
	const uncategorizedQuery = api.category.uncategorizedCount.useQuery({
		wishlistId,
	});
	const [orderedCategories, setOrderedCategories] = useState<Category[]>([]);
	const previousCategoriesRef = useRef<Category[]>([]);

	useEffect(() => {
		setOrderedCategories(categoriesQuery.data ?? []);
	}, [categoriesQuery.data]);

	const invalidateCounts = async () => {
		await Promise.all([
			utils.category.list.invalidate({ wishlistId }),
			utils.category.uncategorizedCount.invalidate({ wishlistId }),
		]);
	};

	const addMutation = api.category.add.useMutation({
		onSuccess: invalidateCounts,
	});
	const renameMutation = api.category.rename.useMutation({
		onSuccess: invalidateCounts,
	});
	const deleteMutation = api.category.delete.useMutation({
		onSuccess: invalidateCounts,
	});
	const reorderMutation = api.category.reorder.useMutation({
		onError: () => {
			setOrderedCategories(previousCategoriesRef.current);
			void utils.category.list.invalidate({ wishlistId });
		},
		onSettled: () => {
			void utils.category.list.invalidate({ wishlistId });
		},
	});

	const handleAdd = async (name: string) => {
		await addMutation.mutateAsync({ wishlistId, name });
	};

	const handleRename = async (categoryId: string, name: string) => {
		await renameMutation.mutateAsync({ categoryId, name });
	};

	const handleDelete = async (categoryId: string) => {
		await deleteMutation.mutateAsync({ categoryId });
	};

	const handleMove = (categoryId: string, direction: "up" | "down") => {
		const currentIndex = orderedCategories.findIndex(
			(category) => category.id === categoryId,
		);
		const nextIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

		if (
			currentIndex === -1 ||
			nextIndex < 0 ||
			nextIndex >= orderedCategories.length
		) {
			return;
		}

		const nextCategories = [...orderedCategories];
		const [movedCategory] = nextCategories.splice(currentIndex, 1);
		if (!movedCategory) return;
		nextCategories.splice(nextIndex, 0, movedCategory);

		previousCategoriesRef.current = orderedCategories;
		setOrderedCategories(nextCategories);
		reorderMutation.mutate({
			wishlistId,
			categoryIds: nextCategories.map((category) => category.id),
		});
	};

	if (categoriesQuery.isLoading) {
		return (
			<div className="rounded-2xl border border-gray-200 bg-white px-6 py-12 text-center text-gray-400 text-sm">
				Cargando categorías…
			</div>
		);
	}

	if (categoriesQuery.error) {
		return (
			<div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-12 text-center text-red-700 text-sm">
				No se pudieron cargar las categorías.
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<p className="font-medium text-gray-900">Regalos sin categoría</p>
					<p className="text-gray-500 text-sm">
						Eliminar una categoría conserva sus regalos y los mueve aquí.
					</p>
				</div>
				<Badge className="w-fit" variant="secondary">
					{uncategorizedQuery.data ?? 0} regalo
					{(uncategorizedQuery.data ?? 0) !== 1 ? "s" : ""}
				</Badge>
			</div>

			<AddCategoryForm isPending={addMutation.isPending} onAdd={handleAdd} />

			{orderedCategories.length === 0 ? (
				<div className="rounded-2xl border border-gray-200 border-dashed px-6 py-12 text-center text-gray-400 text-sm">
					Aún no hay categorías. Agrega la primera para organizar los filtros
					públicos.
				</div>
			) : (
				<ul className="space-y-2">
					{orderedCategories.map((category, index) => (
						<CategoryRow
							category={category}
							isDeleting={deleteMutation.isPending}
							isFirst={index === 0}
							isLast={index === orderedCategories.length - 1}
							isMutating={renameMutation.isPending || reorderMutation.isPending}
							key={category.id}
							onDelete={handleDelete}
							onMove={handleMove}
							onRename={handleRename}
						/>
					))}
				</ul>
			)}
		</div>
	);
}
