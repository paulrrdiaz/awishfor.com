"use client";

import { LoaderCircle, Pencil, Trash2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { GiftForm } from "@/components/features/wishlist/gift-form";
import { PublicThemeProvider } from "@/components/layouts/public-wishlist/public-theme-provider";
import { GiftCard } from "@/components/shared/gift-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { resolveButtonStyle } from "@/config/public-button-styles";
import { resolveBodyFont, resolveHeadingFont } from "@/config/public-fonts";
import { resolveTheme } from "@/config/public-themes";
import { cn } from "@/lib/utils";
import { draftToPreview } from "@/lib/wishlist/draft-to-preview";
import type { DraftGift } from "@/stores/wishlist-wizard.store";
import { api } from "@/trpc/react";
import { useWizardStore } from "./wizard-provider";

type GiftFormValues = Omit<DraftGift, "id" | "sortOrder">;

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

const EYEBROW = "font-mono text-[11px] font-medium uppercase tracking-[0.14em]";
const CARD = "rounded-[14px] border border-border bg-card p-4";

export function GiftsStep() {
	const draft = useWizardStore((s) => s.draft);
	const addCategory = useWizardStore((s) => s.addCategory);
	const renameCategory = useWizardStore((s) => s.renameCategory);
	const removeCategory = useWizardStore((s) => s.removeCategory);
	const addGift = useWizardStore((s) => s.addGift);
	const removeGift = useWizardStore((s) => s.removeGift);

	const [isAddingGift, setIsAddingGift] = useState(false);
	const [newCategoryName, setNewCategoryName] = useState("");
	const [editingCategory, setEditingCategory] = useState<string | null>(null);
	const [editingCategoryName, setEditingCategoryName] = useState("");
	const [categoryError, setCategoryError] = useState<string | null>(null);
	const [importUrl, setImportUrl] = useState("");
	const [importError, setImportError] = useState<string | null>(null);
	const importMutation = api.importer.importFromUrl.useMutation();

	const visibleGifts = draft.gifts.filter((g) => !g.hidden);
	const hiddenCount = draft.gifts.length - visibleGifts.length;
	const previewGifts = draftToPreview(draft).gifts;

	function handleAdd(values: GiftFormValues) {
		addGift(values);
		setIsAddingGift(false);
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
			setIsAddingGift(false);
		} catch {
			setImportError("No pudimos importar ese enlace.");
		}
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

	return (
		<div className="mx-auto w-full max-w-2xl lg:flex lg:h-full lg:max-w-none">
			<div className="lg:w-[420px] lg:shrink-0 lg:overflow-y-auto lg:border-border lg:border-r lg:px-8 lg:py-8">
				<h1 className="mb-2 text-center font-semibold text-2xl text-foreground lg:mb-1.5 lg:text-left lg:font-serif lg:text-[24px]">
					Agrega tus regalos
				</h1>

				<div className={cn(CARD, "mb-3.5")}>
					<p className="mb-[3px] font-semibold text-[13.5px] text-foreground">
						Importar desde URL
					</p>
					<p className="mb-2.5 text-[11.5px] text-muted-foreground">
						Pega un enlace de producto para prellenar el regalo.
					</p>
					<form className="flex gap-2" onSubmit={handleImport}>
						<Input
							className="min-h-11 min-w-0 flex-1 rounded-[10px] text-[13.5px]"
							onChange={(event) => setImportUrl(event.target.value)}
							placeholder="https://tienda.com/producto"
							type="url"
							value={importUrl}
						/>
						<Button
							className="min-h-11 shrink-0 whitespace-nowrap rounded-full px-[22px]"
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
						<p className="mt-2 text-destructive text-xs">{importError}</p>
					)}
				</div>

				<div className={cn(CARD, "mb-3.5")}>
					<p className="mb-[3px] font-semibold text-[13.5px] text-foreground">
						Categorías
					</p>
					<p className="mb-2.5 text-[11.5px] text-muted-foreground">
						Crea opciones para organizar tus regalos antes de publicarlos.
					</p>
					{draft.categories.length > 0 && (
						<div className="mb-2.5 flex flex-wrap gap-2">
							{draft.categories.map((category) =>
								editingCategory === category ? (
									<form
										className="flex flex-wrap items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5"
										key={category}
										onSubmit={(event) => handleRenameCategory(event, category)}
									>
										<Input
											className="h-6 w-24 border-0 bg-transparent px-0 text-[12.5px] shadow-none focus-visible:ring-0"
											maxLength={80}
											onChange={(event) =>
												setEditingCategoryName(event.target.value)
											}
											value={editingCategoryName}
										/>
										<Button
											className="h-6 px-1.5 text-xs"
											type="submit"
											variant="ghost"
										>
											Guardar
										</Button>
										<Button
											className="h-6 px-1.5 text-xs"
											onClick={() => setEditingCategory(null)}
											type="button"
											variant="ghost"
										>
											Cancelar
										</Button>
									</form>
								) : (
									<div
										className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-2 font-semibold text-[12.5px] text-foreground"
										key={category}
									>
										<span>{category}</span>
										<Tooltip>
											<TooltipTrigger asChild>
												<Button
													aria-label={`Renombrar categoría ${category}`}
													onClick={() => startRenameCategory(category)}
													size="icon-xs"
													type="button"
													variant="ghost"
												>
													<Pencil />
												</Button>
											</TooltipTrigger>
											<TooltipContent>Renombrar</TooltipContent>
										</Tooltip>
										<Tooltip>
											<TooltipTrigger asChild>
												<Button
													aria-label={`Quitar categoría ${category}`}
													className="text-muted-foreground hover:text-destructive"
													onClick={() => removeCategory(category)}
													size="icon-xs"
													type="button"
													variant="ghost"
												>
													<Trash2 />
												</Button>
											</TooltipTrigger>
											<TooltipContent>Quitar</TooltipContent>
										</Tooltip>
									</div>
								),
							)}
						</div>
					)}

					<form className="flex gap-2" onSubmit={handleAddCategory}>
						<Input
							className="min-h-11 min-w-0 flex-1 rounded-[10px] text-[13.5px]"
							maxLength={80}
							onChange={(event) => setNewCategoryName(event.target.value)}
							placeholder="Nueva categoría"
							value={newCategoryName}
						/>
						<Button
							className="min-h-11 shrink-0 whitespace-nowrap rounded-full px-[22px]"
							disabled={!newCategoryName.trim()}
							type="submit"
						>
							Agregar
						</Button>
					</form>
					{categoryError && (
						<p className="mt-2 text-destructive text-xs">{categoryError}</p>
					)}
				</div>

				{draft.gifts.length > 0 && (
					<div className="mt-3.5 space-y-3">
						<p className={cn(EYEBROW, "text-muted-foreground")}>
							Tus regalos · {visibleGifts.length}
						</p>
						{draft.gifts.map((gift) => (
							<div
								className={cn(
									"rounded-[14px] border p-4",
									gift.hidden
										? "border-border bg-muted/50 opacity-60"
										: "border-border bg-card",
								)}
								key={gift.id}
							>
								<div className="flex items-start gap-3">
									{gift.imageUrl && (
										<div className="relative size-14 shrink-0 overflow-hidden rounded-[10px] border border-border bg-muted">
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
									<Button
										className="h-7 shrink-0 rounded-full px-2 text-xs"
										onClick={() => removeGift(gift.id)}
										type="button"
										variant="destructive"
									>
										Eliminar
									</Button>
								</div>
							</div>
						))}
					</div>
				)}

				{hiddenCount > 0 && (
					<p className="mt-4 text-center text-muted-foreground text-xs">
						{hiddenCount}{" "}
						{hiddenCount === 1 ? "regalo oculto" : "regalos ocultos"} (no
						aparecen en la vista pública)
					</p>
				)}

				<div className={cn(draft.gifts.length > 0 && "mt-3.5")}>
					{isAddingGift ? (
						<div className={CARD}>
							<p className="mb-4 font-semibold text-[13.5px] text-foreground">
								Nuevo regalo
							</p>
							<GiftForm
								categories={draft.categories}
								onCancel={() => setIsAddingGift(false)}
								onSubmit={handleAdd}
							/>
						</div>
					) : (
						<button
							className="flex min-h-11 w-full items-center justify-center gap-2 rounded-full border-2 border-border border-dashed font-semibold text-[13.5px] text-foreground transition-colors hover:border-primary/50 hover:bg-accent"
							onClick={() => setIsAddingGift(true)}
							type="button"
						>
							<span aria-hidden>+</span> Agregar regalo manualmente
						</button>
					)}
				</div>

				{visibleGifts.length === 0 && draft.gifts.length === 0 && (
					<p className="mt-5 text-center text-muted-foreground text-sm">
						Todavía no tienes regalos. La vista previa mostrará ejemplos hasta
						que agregues el primero.
					</p>
				)}
			</div>

			<div className="mt-8 hidden flex-1 flex-col bg-background px-8 py-8 lg:mt-0 lg:flex">
				<p className={cn(EYEBROW, "mb-3.5 text-muted-foreground")}>
					Así los verán tus invitados
				</p>
				<PublicThemeProvider
					bodyFont={resolveBodyFont(draft.bodyFont)}
					buttonStyle={resolveButtonStyle(draft.buttonStyle)}
					className="min-h-0 bg-transparent"
					headingFont={resolveHeadingFont(draft.headingFont)}
					theme={resolveTheme(draft.themeId)}
				>
					<div className="grid grid-cols-1 gap-4 xl:grid-cols-2 2xl:grid-cols-3">
						{previewGifts.slice(0, 6).map((gift) => (
							<GiftCard cardStyle="card" gift={gift} key={gift.id} />
						))}
					</div>
				</PublicThemeProvider>
			</div>
		</div>
	);
}
