"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Field,
	FieldContent,
	FieldDescription,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { GiftPriority } from "@/generated/prisma/enums";
import { cn } from "@/lib/utils";
import type { DraftGift } from "@/stores/wishlist-wizard.store";
import { ImageUpload } from "./image-upload";

type GiftFormValues = Omit<DraftGift, "id" | "sortOrder">;

const PRIORITY_OPTIONS: { value: GiftPriority; label: string }[] = [
	{ value: "high", label: "Alta" },
	{ value: "medium", label: "Media" },
	{ value: "low", label: "Baja" },
];

const DEFAULT_VALUES: GiftFormValues = {
	name: "",
	productUrl: null,
	imageUrl: null,
	priceAmount: null,
	category: "",
	quantityNeeded: 1,
	priority: "medium",
	publicNote: "",
	internalNote: "",
	hidden: false,
};

type Props = {
	categories: string[];
	initialValues?: GiftFormValues;
	onSubmit: (values: GiftFormValues) => void;
	onCancel: () => void;
	submitLabel?: string;
};

export function GiftForm({
	categories,
	initialValues,
	onSubmit,
	onCancel,
	submitLabel = "Guardar regalo",
}: Props) {
	const [values, setValues] = useState<GiftFormValues>(
		initialValues ?? DEFAULT_VALUES,
	);

	function set<K extends keyof GiftFormValues>(
		key: K,
		value: GiftFormValues[K],
	) {
		setValues((prev) => ({ ...prev, [key]: value }));
	}

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (!values.name.trim()) return;
		onSubmit({
			...values,
			productUrl: values.productUrl?.trim() || null,
			imageUrl: values.imageUrl?.trim() || null,
			publicNote: values.publicNote.trim(),
			internalNote: values.internalNote.trim(),
		});
	}

	return (
		<form className="space-y-4" onSubmit={handleSubmit}>
			<FieldGroup className="gap-4">
				<Field>
					<FieldLabel htmlFor="gift-name">
						Nombre del regalo <span className="text-destructive">*</span>
					</FieldLabel>
					<Input
						className="min-h-11"
						id="gift-name"
						onChange={(e) => set("name", e.target.value)}
						placeholder="Ej. Cuna de madera"
						required
						type="text"
						value={values.name}
					/>
				</Field>

				<Field>
					<FieldLabel htmlFor="gift-url">
						Enlace del producto{" "}
						<span className="font-normal text-muted-foreground">
							(opcional)
						</span>
					</FieldLabel>
					<Input
						className="min-h-11"
						id="gift-url"
						onChange={(e) => set("productUrl", e.target.value || null)}
						placeholder="https://..."
						type="url"
						value={values.productUrl ?? ""}
					/>
				</Field>

				<Field>
					<FieldLabel>
						Imagen del regalo{" "}
						<span className="font-normal text-muted-foreground">
							(opcional)
						</span>
					</FieldLabel>
					<ImageUpload
						endpoint="giftImage"
						onChange={(url) => set("imageUrl", url)}
						value={values.imageUrl}
					/>
				</Field>

				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<Field>
						<FieldLabel htmlFor="gift-price">
							Precio{" "}
							<span className="font-normal text-muted-foreground">
								(opcional)
							</span>
						</FieldLabel>
						<Input
							className="min-h-11"
							id="gift-price"
							min="0"
							onChange={(e) =>
								set(
									"priceAmount",
									e.target.value ? Number(e.target.value) : null,
								)
							}
							placeholder="0.00"
							step="0.01"
							type="number"
							value={values.priceAmount ?? ""}
						/>
					</Field>
					<Field>
						<FieldLabel htmlFor="gift-quantity">Cantidad</FieldLabel>
						<Input
							className="min-h-11"
							id="gift-quantity"
							min="1"
							onChange={(e) =>
								set("quantityNeeded", Math.max(1, Number(e.target.value)))
							}
							type="number"
							value={values.quantityNeeded}
						/>
					</Field>
				</div>

				<Field>
					<FieldLabel htmlFor="gift-category">Categoría</FieldLabel>
					<Select
						onValueChange={(value) => set("category", value ?? "")}
						value={values.category}
					>
						<SelectTrigger className="min-h-11" id="gift-category">
							<SelectValue placeholder="Sin categoría" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="">Sin categoría</SelectItem>
							{categories.map((cat) => (
								<SelectItem key={cat} value={cat}>
									{cat}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</Field>

				<Field>
					<FieldLabel>Prioridad</FieldLabel>
					<div className="flex gap-2">
						{PRIORITY_OPTIONS.map((opt) => {
							const isSelected = values.priority === opt.value;
							return (
								<Button
									className={cn(
										"min-h-11 flex-1 border-2",
										isSelected
											? "border-primary bg-primary text-primary-foreground hover:bg-primary/80"
											: "border-border bg-card text-card-foreground hover:border-primary/50 hover:bg-accent",
									)}
									key={opt.value}
									onClick={() => set("priority", opt.value)}
									type="button"
									variant="outline"
								>
									{opt.label}
								</Button>
							);
						})}
					</div>
				</Field>

				<Field>
					<FieldLabel htmlFor="gift-public-note">
						Nota pública{" "}
						<span className="font-normal text-muted-foreground">
							(opcional)
						</span>
					</FieldLabel>
					<Textarea
						id="gift-public-note"
						onChange={(e) => set("publicNote", e.target.value)}
						placeholder="Visible para los invitados"
						rows={2}
						value={values.publicNote}
					/>
				</Field>

				<Field>
					<FieldLabel htmlFor="gift-internal-note">
						Nota interna{" "}
						<span className="font-normal text-muted-foreground">
							(solo tú la ves)
						</span>
					</FieldLabel>
					<Textarea
						id="gift-internal-note"
						onChange={(e) => set("internalNote", e.target.value)}
						placeholder="Solo visible para ti"
						rows={2}
						value={values.internalNote}
					/>
				</Field>

				<Field orientation="horizontal">
					<Checkbox
						checked={values.hidden}
						id="gift-hidden"
						onCheckedChange={(next) => set("hidden", Boolean(next))}
					/>
					<FieldContent>
						<Label className="cursor-pointer" htmlFor="gift-hidden">
							Ocultar este regalo
						</Label>
						<FieldDescription className="text-xs">
							No aparecerá en la lista pública.
						</FieldDescription>
					</FieldContent>
				</Field>
			</FieldGroup>

			<div className="flex justify-end gap-3 pt-2">
				<Button onClick={onCancel} type="button" variant="outline">
					Cancelar
				</Button>
				<Button disabled={!values.name.trim()} type="submit">
					{submitLabel}
				</Button>
			</div>
		</form>
	);
}
