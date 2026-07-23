"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Minus, Plus } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import {
	createGiftAction,
	updateGiftAction,
} from "@/app/(protected)/dashboard/wishlists/[id]/gifts/actions";
import { Button } from "@/components/ui/button";
import {
	Field,
	FieldContent,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { DashboardGiftRowViewModel } from "@/server/mappers/view-models";
import {
	GIFT_NAME_MAX_LENGTH,
	GIFT_NOTE_MAX_LENGTH,
	GIFT_SIZE_MAX_LENGTH,
	GIFT_STORE_NAME_MAX_LENGTH,
} from "@/server/validators/gift.schema";
import { api } from "@/trpc/react";
import { ImageUpload } from "../../wishlist/image-upload";

const CURRENCY_OPTIONS = [
	{ value: "PEN", label: "S/ PEN" },
	{ value: "USD", label: "$ USD" },
	{ value: "EUR", label: "€ EUR" },
	{ value: "MXN", label: "$ MXN" },
	{ value: "COP", label: "$ COP" },
	{ value: "CLP", label: "$ CLP" },
	{ value: "ARS", label: "$ ARS" },
];

function isValidHttpUrl(value: string): boolean {
	try {
		const { protocol } = new URL(value);
		return protocol === "http:" || protocol === "https:";
	} catch {
		return false;
	}
}

const giftSheetSchema = z.object({
	name: z
		.string()
		.trim()
		.min(1, "El nombre es obligatorio")
		.max(GIFT_NAME_MAX_LENGTH),
	storeName: z.string().trim().max(GIFT_STORE_NAME_MAX_LENGTH).optional(),
	size: z.string().trim().max(GIFT_SIZE_MAX_LENGTH).optional(),
	categoryId: z.string().optional(),
	priceAmount: z
		.string()
		.optional()
		.refine(
			(v) => !v || (!Number.isNaN(Number(v)) && Number(v) >= 0),
			"El precio debe ser un número válido",
		),
	priceCurrency: z.string().optional(),
	quantityNeeded: z.number().int().min(1, "La cantidad mínima es 1"),
	productUrl: z
		.string()
		.optional()
		.refine(
			(v) => !v || v.trim() === "" || isValidHttpUrl(v.trim()),
			"Debe ser un enlace válido (http o https)",
		),
	imageUrl: z.string().nullable().optional(),
	publicNote: z.string().trim().max(GIFT_NOTE_MAX_LENGTH).optional(),
	priority: z.enum(["high", "medium", "low"]),
	visibilityStatus: z.enum(["available", "hidden"]),
});

type GiftSheetFormValues = z.infer<typeof giftSheetSchema>;

const BLANK_VALUES: GiftSheetFormValues = {
	name: "",
	storeName: "",
	size: "",
	categoryId: "",
	priceAmount: "",
	priceCurrency: "PEN",
	quantityNeeded: 1,
	productUrl: "",
	imageUrl: null,
	publicNote: "",
	priority: "medium",
	visibilityStatus: "available",
};

function valuesFromGift(gift: DashboardGiftRowViewModel): GiftSheetFormValues {
	return {
		name: gift.name,
		storeName: gift.storeName ?? "",
		size: gift.size ?? "",
		categoryId: gift.categoryId ?? "",
		priceAmount: gift.priceAmount ?? "",
		priceCurrency: gift.priceCurrency ?? "PEN",
		quantityNeeded: gift.quantityNeeded,
		productUrl: gift.productUrl ?? "",
		imageUrl: gift.imageUrl,
		publicNote: gift.publicNote ?? "",
		priority: gift.priority as GiftSheetFormValues["priority"],
		visibilityStatus:
			gift.visibilityStatus as GiftSheetFormValues["visibilityStatus"],
	};
}

type Props = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	wishlistId: string;
	gift?: DashboardGiftRowViewModel | null;
};

export function GiftSheet({ open, onOpenChange, wishlistId, gift }: Props) {
	const mode = gift ? "edit" : "create";
	const [isPending, startTransition] = useTransition();
	const [importUrl, setImportUrl] = useState("");
	const [importError, setImportError] = useState<string | null>(null);
	const importMutation = api.importer.importFromUrl.useMutation();
	const categoriesQuery = api.category.list.useQuery(
		{ wishlistId },
		{ enabled: open },
	);

	const form = useForm<GiftSheetFormValues>({
		resolver: zodResolver(giftSheetSchema),
		defaultValues: BLANK_VALUES,
	});

	useEffect(() => {
		if (!open) return;
		form.reset(gift ? valuesFromGift(gift) : BLANK_VALUES);
		setImportUrl("");
		setImportError(null);
	}, [open, gift, form.reset]);

	async function handleImport() {
		const url = importUrl.trim();
		if (!url || importMutation.isPending) return;
		setImportError(null);
		try {
			const result = await importMutation.mutateAsync({ url });
			if (!result.ok) {
				setImportError("No pudimos importar ese enlace.");
				return;
			}
			if (result.draft.name) form.setValue("name", result.draft.name);
			if (result.draft.imageUrl)
				form.setValue("imageUrl", result.draft.imageUrl);
			if (result.draft.storeName)
				form.setValue("storeName", result.draft.storeName);
			if (result.draft.priceAmount != null)
				form.setValue("priceAmount", String(result.draft.priceAmount));
			if (result.draft.priceCurrency)
				form.setValue("priceCurrency", result.draft.priceCurrency);
			form.setValue("productUrl", result.draft.productUrl);
		} catch {
			setImportError("No pudimos importar ese enlace.");
		}
	}

	function onSubmit(values: GiftSheetFormValues) {
		startTransition(async () => {
			try {
				const shared = {
					name: values.name,
					storeName: values.storeName || undefined,
					size: values.size || undefined,
					priceAmount: values.priceAmount
						? Number(values.priceAmount)
						: undefined,
					priceCurrency: values.priceCurrency || undefined,
					quantityNeeded: values.quantityNeeded,
					productUrl: values.productUrl || undefined,
					imageUrl: values.imageUrl || undefined,
					publicNote: values.publicNote || undefined,
					priority: values.priority,
					visibilityStatus: values.visibilityStatus,
				};

				if (mode === "create") {
					await createGiftAction({
						...shared,
						wishlistId,
						categoryId: values.categoryId || undefined,
						sortOrder: 0,
					});
					toast.success("Regalo agregado");
				} else if (gift) {
					await updateGiftAction(wishlistId, {
						...shared,
						giftId: gift.id,
						categoryId: values.categoryId || null,
					});
					toast.success("Cambios guardados");
				}
				onOpenChange(false);
			} catch {
				toast.error("No pudimos guardar el regalo. Intenta de nuevo.");
			}
		});
	}

	const quantity = form.watch("quantityNeeded");
	const imageUrl = form.watch("imageUrl");

	return (
		<Sheet onOpenChange={onOpenChange} open={open}>
			<SheetContent className="flex w-full flex-col sm:max-w-2xl" side="right">
				<SheetHeader>
					<SheetTitle>
						{mode === "create" ? "Agregar regalo" : "Editar regalo"}
					</SheetTitle>
					<SheetDescription>
						Los cambios se guardan en tu wishlist.
					</SheetDescription>
				</SheetHeader>

				<form
					className="flex min-h-0 flex-1 flex-col"
					onSubmit={form.handleSubmit(onSubmit)}
				>
					<div className="flex-1 space-y-5 overflow-y-auto px-4 pb-4">
						{mode === "create" && (
							<div className="space-y-2 rounded-lg border border-dashed p-3.5">
								<FieldLabel>Importar desde enlace</FieldLabel>
								<div className="flex gap-2">
									<Input
										onChange={(e) => setImportUrl(e.target.value)}
										placeholder="https://tienda.com/producto"
										type="url"
										value={importUrl}
									/>
									<Button
										disabled={!importUrl.trim() || importMutation.isPending}
										onClick={handleImport}
										type="button"
										variant="outline"
									>
										{importMutation.isPending ? (
											<Loader2 className="animate-spin" />
										) : null}
										Traer datos
									</Button>
								</div>
								{importError && (
									<p className="text-destructive text-xs">{importError}</p>
								)}
								<p className="text-muted-foreground text-xs">
									Autocompletamos nombre, imagen, tienda y precio. Puedes
									editarlos después.
								</p>
							</div>
						)}

						<FieldGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<Field className="sm:col-span-2">
								<ImageUpload
									endpoint="giftImage"
									onChange={(url) => form.setValue("imageUrl", url)}
									value={imageUrl ?? null}
									variant="compact"
								/>
							</Field>

							<Field className="sm:col-span-2">
								<FieldLabel htmlFor="gift-sheet-name">
									Nombre del regalo <span className="text-destructive">*</span>
								</FieldLabel>
								<Input id="gift-sheet-name" {...form.register("name")} />
								<FieldError errors={[form.formState.errors.name]} />
							</Field>

							<div className="grid grid-cols-2 gap-4 sm:col-span-2">
								<Field>
									<FieldLabel htmlFor="gift-sheet-store">Tienda</FieldLabel>
									<Input
										id="gift-sheet-store"
										{...form.register("storeName")}
									/>
								</Field>
								<Field>
									<FieldLabel htmlFor="gift-sheet-category">
										Categoría
									</FieldLabel>
									<Select
										onValueChange={(value) =>
											form.setValue("categoryId", value === "none" ? "" : value)
										}
										value={form.watch("categoryId") || "none"}
									>
										<SelectTrigger className="h-8" id="gift-sheet-category">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="none">Sin categoría</SelectItem>
											{categoriesQuery.data?.map((category) => (
												<SelectItem key={category.id} value={category.id}>
													{category.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</Field>
							</div>

							<div className="grid grid-cols-2 gap-4 sm:col-span-2">
								<Field>
									<FieldLabel htmlFor="gift-sheet-size">
										Talla o tamaño{" "}
										<span className="font-normal text-muted-foreground">
											· opcional
										</span>
									</FieldLabel>
									<Input
										id="gift-sheet-size"
										placeholder="Ej. 3-6 meses, M, 24"
										{...form.register("size")}
									/>
								</Field>
								<Field>
									<FieldLabel>Cantidad</FieldLabel>
									<div className="flex h-8 items-center justify-between rounded-lg border border-input px-1">
										<Button
											className="size-6"
											onClick={() =>
												form.setValue(
													"quantityNeeded",
													Math.max(1, quantity - 1),
												)
											}
											size="icon-xs"
											type="button"
											variant="ghost"
										>
											<Minus />
										</Button>
										<span className="font-medium text-sm">{quantity}</span>
										<Button
											className="size-6"
											onClick={() =>
												form.setValue("quantityNeeded", quantity + 1)
											}
											size="icon-xs"
											type="button"
											variant="ghost"
										>
											<Plus />
										</Button>
									</div>
								</Field>
							</div>

							<Field className="sm:col-span-2">
								<FieldLabel htmlFor="gift-sheet-price">Precio</FieldLabel>
								<div className="flex gap-2">
									<Select
										onValueChange={(value) =>
											form.setValue("priceCurrency", value)
										}
										value={form.watch("priceCurrency") || "PEN"}
									>
										<SelectTrigger className="h-8 w-24 shrink-0">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											{CURRENCY_OPTIONS.map((option) => (
												<SelectItem key={option.value} value={option.value}>
													{option.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<Input
										id="gift-sheet-price"
										min="0"
										placeholder="0.00"
										step="0.01"
										type="number"
										{...form.register("priceAmount")}
									/>
								</div>
								<FieldError errors={[form.formState.errors.priceAmount]} />
							</Field>

							<Field className="sm:col-span-2">
								<FieldLabel htmlFor="gift-sheet-url">
									Enlace del producto
								</FieldLabel>
								<Input
									id="gift-sheet-url"
									type="url"
									{...form.register("productUrl")}
								/>
								<FieldError errors={[form.formState.errors.productUrl]} />
							</Field>

							<Field className="sm:col-span-2">
								<FieldLabel htmlFor="gift-sheet-note">
									Nota para invitados{" "}
									<span className="font-normal text-muted-foreground">
										· opcional
									</span>
								</FieldLabel>
								<Textarea
									className="resize-none"
									id="gift-sheet-note"
									placeholder="Ej. Preferimos el color gris."
									rows={3}
									{...form.register("publicNote")}
								/>
							</Field>
						</FieldGroup>

						<div className="space-y-4 border-t pt-5">
							<Field orientation="horizontal">
								<FieldContent>
									<FieldLabel>Marcar como infaltable ★</FieldLabel>
									<FieldDescription>
										Se destaca al inicio de tu lista.
									</FieldDescription>
								</FieldContent>
								<Switch
									checked={form.watch("priority") === "high"}
									onCheckedChange={(checked) =>
										form.setValue("priority", checked ? "high" : "medium")
									}
								/>
							</Field>
							<Field orientation="horizontal">
								<FieldContent>
									<FieldLabel>Visible en la wishlist</FieldLabel>
									<FieldDescription>
										Ocúltalo si aún no está listo.
									</FieldDescription>
								</FieldContent>
								<Switch
									checked={form.watch("visibilityStatus") === "available"}
									onCheckedChange={(checked) =>
										form.setValue(
											"visibilityStatus",
											checked ? "available" : "hidden",
										)
									}
								/>
							</Field>
						</div>
					</div>

					<SheetFooter className="flex-row justify-end border-t">
						<Button
							onClick={() => onOpenChange(false)}
							type="button"
							variant="outline"
						>
							Cancelar
						</Button>
						<Button disabled={isPending} type="submit">
							{isPending ? <Loader2 className="animate-spin" /> : null}
							{mode === "create" ? "Agregar regalo" : "Guardar cambios"}
						</Button>
					</SheetFooter>
				</form>
			</SheetContent>
		</Sheet>
	);
}
