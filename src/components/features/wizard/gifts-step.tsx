"use client";

import { LoaderCircle } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { GiftForm } from "@/components/features/wishlist/gift-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { DraftGift } from "@/stores/wishlist-wizard.store";
import { api } from "@/trpc/react";
import { useWizardStore } from "./wizard-provider";

type GiftFormValues = Omit<DraftGift, "id" | "sortOrder">;

type EditingState = { type: "adding" } | { type: "editing"; id: string } | null;

const PRIORITY_LABELS: Record<string, string> = {
	high: "Alta",
	medium: "Media",
	low: "Baja",
};

const IMPORT_ERROR_MESSAGES: Record<string, string> = {
	timeout: "La tienda tardó demasiado en responder.",
	network:
		"No pudimos leer esa página. Revisa el enlace o intenta otra tienda.",
	blocked_host: "Ese enlace no se puede importar por seguridad.",
	too_many_redirects: "Ese enlace redirige demasiadas veces.",
	oversized: "La página es demasiado grande para importarla.",
	invalid_url: "Ingresa un enlace válido que empiece con http o https.",
};

export function GiftsStep() {
	const draft = useWizardStore((s) => s.draft);
	const addCategory = useWizardStore((s) => s.addCategory);
	const renameCategory = useWizardStore((s) => s.renameCategory);
	const removeCategory = useWizardStore((s) => s.removeCategory);
	const addGift = useWizardStore((s) => s.addGift);
	const updateGift = useWizardStore((s) => s.updateGift);
	const removeGift = useWizardStore((s) => s.removeGift);

	const [editing, setEditing] = useState<EditingState>(null);
	const [newCategoryName, setNewCategoryName] = useState("");
	const [editingCategory, setEditingCategory] = useState<string | null>(null);
	const [editingCategoryName, setEditingCategoryName] = useState("");
	const [categoryError, setCategoryError] = useState<string | null>(null);
	const [importUrl, setImportUrl] = useState("");
	const [importError, setImportError] = useState<string | null>(null);
	const importMutation = api.importer.importFromUrl.useMutation();

	const visibleGifts = draft.gifts.filter((g) => !g.hidden);
	const hiddenCount = draft.gifts.length - visibleGifts.length;
	const editingGift =
		editing?.type === "editing"
			? draft.gifts.find((gift) => gift.id === editing.id)
			: null;

	function handleAdd(values: GiftFormValues) {
		addGift(values);
		setEditing(null);
	}

	function handleUpdate(id: string, values: GiftFormValues) {
		updateGift(id, values);
		setEditing(null);
	}

	async function handleImport(event: React.FormEvent) {
		event.preventDefault();
		const url = importUrl.trim();
		if (!url || importMutation.isPending) return;

		setImportError(null);

		try {
			const result = await importMutation.mutateAsync({ url });

			if (!result.ok) {
				setImportError(
					IMPORT_ERROR_MESSAGES[result.error.kind] ??
						"No pudimos importar ese enlace.",
				);
				return;
			}

			addGift({
				name: result.draft.name?.trim() || "Regalo importado",
				productUrl: result.draft.productUrl,
				imageUrl: result.draft.imageUrl ?? null,
				priceAmount: result.draft.priceAmount ?? null,
				category: "",
				quantityNeeded: 1,
				priority: "medium",
				publicNote: "",
				internalNote: "",
				hidden: false,
			});
			setImportUrl("");
			setEditing(null);
		} catch {
			setImportError("No pudimos importar ese enlace.");
		}
	}

	function getInitialValues(gift: DraftGift): GiftFormValues {
		const { id: _id, sortOrder: _sortOrder, ...rest } = gift;
		return rest;
	}

	function categoryExists(name: string, exceptName?: string) {
		const normalizedName = name.trim().toLocaleLowerCase();
		const normalizedExceptName = exceptName?.trim().toLocaleLowerCase();
		return draft.categories.some((category) => {
			const normalizedCategory = category.trim().toLocaleLowerCase();
			return (
				normalizedCategory === normalizedName &&
				normalizedCategory !== normalizedExceptName
			);
		});
	}

	function handleAddCategory(event: React.FormEvent) {
		event.preventDefault();
		const trimmedName = newCategoryName.trim();
		if (!trimmedName) {
			setCategoryError("Ingresa un nombre de categoría.");
			return;
		}
		if (categoryExists(trimmedName)) {
			setCategoryError("Esa categoría ya existe.");
			return;
		}

		addCategory(trimmedName);
		setNewCategoryName("");
		setCategoryError(null);
	}

	function startRenameCategory(name: string) {
		setEditingCategory(name);
		setEditingCategoryName(name);
		setCategoryError(null);
	}

	function handleRenameCategory(event: React.FormEvent, oldName: string) {
		event.preventDefault();
		const trimmedName = editingCategoryName.trim();
		if (!trimmedName) {
			setCategoryError("Ingresa un nombre de categoría.");
			return;
		}
		if (categoryExists(trimmedName, oldName)) {
			setCategoryError("Esa categoría ya existe.");
			return;
		}

		renameCategory(oldName, trimmedName);
		setEditingCategory(null);
		setEditingCategoryName("");
		setCategoryError(null);
	}

	if (editingGift) {
		return (
			<div className="mx-auto w-full max-w-2xl lg:h-full lg:max-w-none lg:overflow-y-auto">
				<div className="mb-6 lg:hidden">
					<p className="mb-2 font-medium text-muted-foreground text-xs uppercase tracking-wide">
						Paso 4 de 5
					</p>
					<h1 className="text-center font-semibold text-2xl text-foreground">
						Editar regalo
					</h1>
				</div>
				<GiftForm
					categories={draft.categories}
					desktopSplit
					initialValues={getInitialValues(editingGift)}
					onCancel={() => setEditing(null)}
					onSubmit={(values) => handleUpdate(editingGift.id, values)}
					submitLabel="Actualizar regalo"
				/>
			</div>
		);
	}

	return (
		<div className="mx-auto w-full max-w-2xl lg:flex lg:h-full lg:max-w-none">
			<div className="lg:w-[520px] lg:shrink-0 lg:overflow-y-auto lg:border-border lg:border-r lg:px-8 lg:py-7">
				<p className="mb-2 font-medium text-muted-foreground text-xs uppercase tracking-wide">
					Paso 4 de 5
				</p>
				<h1 className="mb-2 text-center font-semibold text-2xl text-foreground lg:text-left lg:font-serif lg:text-3xl">
					Agrega tus regalos
				</h1>
				<p className="mb-8 text-center text-muted-foreground text-sm lg:text-left">
					Agrega los regalos que deseas recibir
				</p>

				<Card className="mb-6 border-dashed bg-muted/30">
					<CardContent className="p-4">
						<div className="mb-3">
							<p className="font-medium text-foreground text-sm">
								Importar desde URL
							</p>
							<p className="text-muted-foreground text-xs">
								Pega un enlace de producto para prellenar el regalo.
							</p>
						</div>
						<form
							className="flex flex-col gap-2 sm:flex-row"
							onSubmit={handleImport}
						>
							<Input
								className="min-h-11 min-w-0 flex-1"
								onChange={(event) => setImportUrl(event.target.value)}
								placeholder="https://tienda.com/producto"
								type="url"
								value={importUrl}
							/>
							<Button
								className="min-h-11"
								disabled={!importUrl.trim() || importMutation.isPending}
								type="submit"
								variant="outline"
							>
								{importMutation.isPending ? (
									<LoaderCircle className="size-4 animate-spin" />
								) : null}
								Importar
							</Button>
						</form>
						{importError && (
							<p className="mt-2 text-destructive text-sm">{importError}</p>
						)}
					</CardContent>
				</Card>

				<Card className="mb-6">
					<CardHeader>
						<CardTitle className="text-sm">Categorías</CardTitle>
						<p className="text-muted-foreground text-xs">
							Crea opciones para organizar tus regalos antes de publicarlos.
						</p>
					</CardHeader>
					<CardContent>
						{draft.categories.length > 0 && (
							<div className="mb-4 flex flex-wrap gap-2">
								{draft.categories.map((category) =>
									editingCategory === category ? (
										<form
											className="flex flex-wrap items-center gap-2 rounded-full border border-border bg-muted px-3 py-2"
											key={category}
											onSubmit={(event) =>
												handleRenameCategory(event, category)
											}
										>
											<Input
												className="h-7 w-28 border-0 bg-transparent px-0 text-xs shadow-none focus-visible:ring-0"
												maxLength={80}
												onChange={(event) =>
													setEditingCategoryName(event.target.value)
												}
												value={editingCategoryName}
											/>
											<Button
												className="h-7 px-2 text-xs"
												type="submit"
												variant="ghost"
											>
												Guardar
											</Button>
											<Button
												className="h-7 px-2 text-xs"
												onClick={() => setEditingCategory(null)}
												type="button"
												variant="ghost"
											>
												Cancelar
											</Button>
										</form>
									) : (
										<div
											className="flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-2"
											key={category}
										>
											<span className="text-foreground text-xs">
												{category}
											</span>
											<Button
												className="h-6 px-1.5 text-xs"
												onClick={() => startRenameCategory(category)}
												type="button"
												variant="ghost"
											>
												Renombrar
											</Button>
											<Button
												className="h-6 px-1.5 text-xs"
												onClick={() => removeCategory(category)}
												type="button"
												variant="destructive"
											>
												Quitar
											</Button>
										</div>
									),
								)}
							</div>
						)}

						<form
							className="flex flex-col gap-2 sm:flex-row"
							onSubmit={handleAddCategory}
						>
							<Input
								className="min-h-11 min-w-0 flex-1"
								maxLength={80}
								onChange={(event) => setNewCategoryName(event.target.value)}
								placeholder="Nueva categoría"
								value={newCategoryName}
							/>
							<Button
								className="min-h-11"
								disabled={!newCategoryName.trim()}
								type="submit"
							>
								Agregar
							</Button>
						</form>
						{categoryError && (
							<p className="mt-2 text-destructive text-sm">{categoryError}</p>
						)}
					</CardContent>
				</Card>

				{draft.gifts.length > 0 && (
					<div className="mb-6 space-y-3">
						<p className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
							Tus regalos · {visibleGifts.length}
						</p>
						{draft.gifts.map((gift) => (
							<Card
								className={cn(
									"p-0",
									gift.hidden
										? "border-border bg-muted/50 opacity-60"
										: "border-border bg-card",
								)}
								key={gift.id}
							>
								<CardContent className="flex items-start gap-3 p-4">
									{gift.imageUrl && (
										<div className="relative size-14 shrink-0 overflow-hidden rounded-md border border-border bg-muted">
											<Image
												alt=""
												className="object-cover"
												fill
												src={gift.imageUrl}
												unoptimized
											/>
										</div>
									)}
									<div className="min-w-0 flex-1">
										<div className="flex items-center gap-2">
											<p
												className={cn(
													"font-medium text-sm",
													gift.hidden
														? "text-muted-foreground"
														: "text-foreground",
												)}
											>
												{gift.name}
											</p>
											{gift.hidden && <Badge variant="secondary">Oculto</Badge>}
										</div>
										<div className="mt-1 flex flex-wrap gap-2 text-muted-foreground text-xs">
											{gift.category && <span>{gift.category}</span>}
											{gift.priceAmount != null && (
												<span>S/ {gift.priceAmount}</span>
											)}
											{gift.quantityNeeded > 1 && (
												<span>×{gift.quantityNeeded}</span>
											)}
											<span>
												{PRIORITY_LABELS[gift.priority] ?? gift.priority}
											</span>
										</div>
									</div>
									<div className="flex shrink-0 flex-col gap-2 sm:flex-row">
										<Button
											className="h-7 px-2 text-xs"
											onClick={() =>
												setEditing({ type: "editing", id: gift.id })
											}
											type="button"
											variant="ghost"
										>
											Editar
										</Button>
										<Button
											className="h-7 px-2 text-xs"
											onClick={() => removeGift(gift.id)}
											type="button"
											variant="destructive"
										>
											Eliminar
										</Button>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				)}

				{hiddenCount > 0 && (
					<p className="mb-4 text-center text-muted-foreground text-xs">
						{hiddenCount}{" "}
						{hiddenCount === 1 ? "regalo oculto" : "regalos ocultos"} (no
						aparecen en la vista pública)
					</p>
				)}

				{editing?.type === "adding" ? (
					<Card>
						<CardContent className="p-4">
							<p className="mb-4 font-medium text-foreground text-sm">
								Nuevo regalo
							</p>
							<GiftForm
								categories={draft.categories}
								onCancel={() => setEditing(null)}
								onSubmit={handleAdd}
							/>
						</CardContent>
					</Card>
				) : (
					<Button
						className="flex min-h-14 w-full items-center justify-center gap-2 border-2 border-dashed"
						onClick={() => setEditing({ type: "adding" })}
						type="button"
						variant="outline"
					>
						<span aria-hidden>+</span> Agregar regalo manualmente
					</Button>
				)}

				{visibleGifts.length === 0 && draft.gifts.length === 0 && (
					<p className="mt-6 text-center text-muted-foreground text-sm">
						Todavía no tienes regalos. La vista previa mostrará ejemplos hasta
						que agregues el primero.
					</p>
				)}
			</div>

			<div className="mt-8 hidden flex-1 flex-col bg-background px-8 py-7 lg:mt-0 lg:flex">
				<p className="mb-4 font-medium text-muted-foreground text-xs uppercase tracking-wide">
					Así los verán tus invitados
				</p>
				<div className="grid grid-cols-2 gap-4">
					{(visibleGifts.length > 0
						? visibleGifts
						: [
								{
									id: "sample-1",
									name: "Regalo de ejemplo",
									priceAmount: 120,
									imageUrl: null,
									category: "Favoritos",
								},
								{
									id: "sample-2",
									name: "Detalle especial",
									priceAmount: 80,
									imageUrl: null,
									category: "Hogar",
								},
							]
					)
						.slice(0, 4)
						.map((gift) => (
							<Card className="overflow-hidden" key={gift.id}>
								<div className="relative h-28 bg-muted">
									{"imageUrl" in gift && gift.imageUrl ? (
										<Image
											alt=""
											className="object-cover"
											fill
											src={gift.imageUrl}
											unoptimized
										/>
									) : (
										<div className="flex h-full items-center justify-center text-2xl">
											🎁
										</div>
									)}
								</div>
								<CardContent className="p-3">
									<p className="line-clamp-2 font-medium text-foreground text-sm">
										{gift.name}
									</p>
									<p className="mt-1 text-muted-foreground text-xs">
										{gift.category || "Sin categoría"}
									</p>
									<p className="mt-3 font-semibold text-foreground text-sm">
										{gift.priceAmount != null
											? `S/ ${gift.priceAmount}`
											: "Precio por definir"}
									</p>
								</CardContent>
							</Card>
						))}
				</div>
			</div>
		</div>
	);
}
