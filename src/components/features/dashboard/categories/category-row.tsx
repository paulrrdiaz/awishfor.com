"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { RouterOutputs } from "@/trpc/react";
import { DeleteCategoryDialog } from "./delete-category-dialog";

type Category = RouterOutputs["category"]["list"][number];

type Props = {
	category: Category;
	isFirst: boolean;
	isLast: boolean;
	isDeleting: boolean;
	isMutating: boolean;
	onDelete: (categoryId: string) => Promise<void>;
	onMove: (categoryId: string, direction: "up" | "down") => void;
	onRename: (categoryId: string, name: string) => Promise<void>;
};

export function CategoryRow({
	category,
	isFirst,
	isLast,
	isDeleting,
	isMutating,
	onDelete,
	onMove,
	onRename,
}: Props) {
	const [isEditing, setIsEditing] = useState(false);
	const [name, setName] = useState(category.name);
	const [error, setError] = useState<string | null>(null);

	const handleRename = async (event: React.FormEvent) => {
		event.preventDefault();
		const trimmedName = name.trim();
		if (!trimmedName) {
			setError("Ingresa un nombre de categoría.");
			return;
		}

		try {
			setError(null);
			await onRename(category.id, trimmedName);
			setIsEditing(false);
		} catch (err) {
			setError(err instanceof Error ? err.message : "No se pudo renombrar.");
		}
	};

	const cancelRename = () => {
		setName(category.name);
		setError(null);
		setIsEditing(false);
	};

	return (
		<li className="rounded-2xl border border-gray-200 bg-white p-4">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="min-w-0 flex-1">
					{isEditing ? (
						<form className="space-y-2" onSubmit={handleRename}>
							<Input
								aria-label={`Renombrar ${category.name}`}
								maxLength={80}
								onChange={(event) => setName(event.target.value)}
								value={name}
							/>
							{error && <p className="text-red-600 text-sm">{error}</p>}
							<div className="flex gap-2">
								<Button disabled={isMutating || !name.trim()} size="sm">
									Guardar
								</Button>
								<Button
									onClick={cancelRename}
									size="sm"
									type="button"
									variant="outline"
								>
									Cancelar
								</Button>
							</div>
						</form>
					) : (
						<div className="flex flex-wrap items-center gap-2">
							<p className="font-medium text-gray-900">{category.name}</p>
							<Badge variant="secondary">
								{category.giftCount} regalo
								{category.giftCount !== 1 ? "s" : ""}
							</Badge>
						</div>
					)}
				</div>
				{!isEditing && (
					<div className="flex flex-wrap items-center gap-1">
						<Button
							disabled={isFirst || isMutating}
							onClick={() => onMove(category.id, "up")}
							size="sm"
							type="button"
							variant="ghost"
						>
							↑
						</Button>
						<Button
							disabled={isLast || isMutating}
							onClick={() => onMove(category.id, "down")}
							size="sm"
							type="button"
							variant="ghost"
						>
							↓
						</Button>
						<Button
							onClick={() => setIsEditing(true)}
							size="sm"
							type="button"
							variant="ghost"
						>
							Renombrar
						</Button>
						<DeleteCategoryDialog
							categoryName={category.name}
							giftCount={category.giftCount}
							isPending={isDeleting}
							onDelete={() => onDelete(category.id)}
						/>
					</div>
				)}
			</div>
		</li>
	);
}
