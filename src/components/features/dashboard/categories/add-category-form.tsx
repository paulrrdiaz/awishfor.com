"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
	isPending: boolean;
	onAdd: (name: string) => Promise<void>;
};

export function AddCategoryForm({ isPending, onAdd }: Props) {
	const [name, setName] = useState("");
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();
		const trimmedName = name.trim();
		if (!trimmedName) {
			setError("Ingresa un nombre de categoría.");
			return;
		}

		try {
			setError(null);
			await onAdd(trimmedName);
			setName("");
		} catch (err) {
			setError(err instanceof Error ? err.message : "No se pudo crear.");
		}
	};

	return (
		<form
			className="rounded-2xl border border-gray-200 bg-white p-4"
			onSubmit={handleSubmit}
		>
			<Label className="mb-2 block" htmlFor="new-category-name">
				Nueva categoría
			</Label>
			<div className="flex flex-col gap-2 sm:flex-row">
				<Input
					id="new-category-name"
					maxLength={80}
					onChange={(event) => setName(event.target.value)}
					placeholder="Ej. Cocina"
					value={name}
				/>
				<Button disabled={isPending || !name.trim()} type="submit">
					{isPending ? "Agregando…" : "Agregar"}
				</Button>
			</div>
			{error && <p className="mt-2 text-red-600 text-sm">{error}</p>}
		</form>
	);
}
