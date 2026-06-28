"use client";

import { type CSSProperties, useState } from "react";
import { toast } from "sonner";
import { ImageUpload } from "@/components/features/wishlist/image-upload";
import { PublicWishlistPage } from "@/components/layouts/public-wishlist/public-wishlist-page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getAllButtonStyles } from "@/config/public-button-styles";
import { getAllFontPairingOptions } from "@/config/public-fonts";
import { getAllLayouts } from "@/config/public-layouts";
import { getAllThemes } from "@/config/public-themes";
import { cn } from "@/lib/utils";
import { draftToPreview } from "@/lib/wishlist/draft-to-preview";
import {
	type PersistedWishlistDesign,
	persistedWishlistToPreviewDraft,
} from "@/lib/wishlist/persisted-to-preview";
import { api, type RouterOutputs } from "@/trpc/react";

type WishlistDetail = RouterOutputs["wishlist"]["getById"];

type Props = {
	wishlist: WishlistDetail;
};

const THEMES = getAllThemes();
const LAYOUTS = getAllLayouts();
const FONT_PAIRINGS = getAllFontPairingOptions();
const BUTTON_STYLES = getAllButtonStyles();

function SelectorGrid<
	T extends { id: string; label: string; description?: string },
>({
	label,
	options,
	selected,
	onSelect,
	accentStyle,
}: {
	label: string;
	options: T[];
	selected: string | null;
	onSelect: (id: string) => void;
	accentStyle?: (option: T) => CSSProperties;
}) {
	return (
		<div className="space-y-3">
			<p className="font-medium text-foreground text-sm">{label}</p>
			<div className="grid gap-2 sm:grid-cols-2">
				{options.map((option) => {
					const isSelected = selected === option.id;
					return (
						<button
							aria-pressed={isSelected}
							className={cn(
								"rounded-xl border bg-background p-3 text-left transition-all hover:-translate-y-0.5 hover:border-foreground/30 hover:shadow-sm focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
								isSelected
									? "border-foreground shadow-sm ring-1 ring-foreground/10"
									: "border-border",
							)}
							key={option.id}
							onClick={() => onSelect(option.id)}
							style={accentStyle?.(option)}
							type="button"
						>
							<span className="block font-medium text-sm">{option.label}</span>
							{"description" in option && option.description ? (
								<span className="mt-1 block text-muted-foreground text-xs leading-snug">
									{option.description}
								</span>
							) : null}
						</button>
					);
				})}
			</div>
		</div>
	);
}

function statusLabel(status: string) {
	if (status === "published") {
		return "Publicada";
	}
	if (status === "archived") {
		return "Archivada";
	}
	return "Borrador";
}

export function WishlistDesignEditor({ wishlist }: Props) {
	const [design, setDesign] = useState<PersistedWishlistDesign>({
		themeId: wishlist.themeId,
		layoutId: wishlist.layoutId,
		fontPairing: wishlist.fontPairing,
		buttonStyle: wishlist.buttonStyle,
		coverImageUrl: wishlist.coverImageUrl,
	});

	const updateDesign = api.wishlist.updateDesign.useMutation({
		onError: () => {
			toast.error("No se pudo guardar el diseño");
		},
		onSuccess: () => {
			toast.success("Diseño guardado");
		},
	});

	const hasChanges =
		design.themeId !== wishlist.themeId ||
		design.layoutId !== wishlist.layoutId ||
		design.fontPairing !== wishlist.fontPairing ||
		design.buttonStyle !== wishlist.buttonStyle ||
		design.coverImageUrl !== wishlist.coverImageUrl;

	const previewViewModel = draftToPreview(
		persistedWishlistToPreviewDraft(wishlist, design),
	);

	const setDesignField = <Key extends keyof PersistedWishlistDesign>(
		key: Key,
		value: PersistedWishlistDesign[Key],
	) => {
		setDesign((current) => ({
			...current,
			[key]: value,
		}));
	};

	return (
		<div className="mx-auto w-full max-w-6xl px-4 py-8">
			<div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
				<div>
					<div className="mb-2 flex flex-wrap items-center gap-2">
						<p className="text-muted-foreground text-sm">Diseño de wishlist</p>
						<Badge variant="secondary">{statusLabel(wishlist.status)}</Badge>
					</div>
					<h1 className="font-heading font-semibold text-3xl">
						{wishlist.title}
					</h1>
					<p className="mt-2 max-w-2xl text-muted-foreground text-sm">
						Ajusta el tema, la composición y la portada. La vista previa cambia
						al instante; guarda para publicar los cambios.
					</p>
				</div>
				<div className="flex flex-col items-start gap-2 md:items-end">
					<Button
						disabled={!hasChanges || updateDesign.isPending}
						onClick={() => {
							updateDesign.mutate({
								id: wishlist.id,
								...design,
							});
						}}
						type="button"
					>
						{updateDesign.isPending ? "Guardando..." : "Guardar diseño"}
					</Button>
					{updateDesign.isSuccess ? (
						<p className="text-emerald-700 text-xs">Cambios guardados.</p>
					) : null}
					{updateDesign.isError ? (
						<p className="text-destructive text-xs">
							No se pudo guardar. Inténtalo otra vez.
						</p>
					) : null}
				</div>
			</div>

			<div className="grid gap-8 lg:grid-cols-[360px_minmax(0,1fr)]">
				<section className="space-y-6 rounded-2xl border bg-card p-5 shadow-sm">
					<SelectorGrid
						accentStyle={(theme) => ({
							borderColor:
								design.themeId === theme.id ? theme.preview.primary : undefined,
						})}
						label="Tema de color"
						onSelect={(id) => setDesignField("themeId", id)}
						options={THEMES}
						selected={design.themeId}
					/>

					<SelectorGrid
						label="Disposición"
						onSelect={(id) => setDesignField("layoutId", id)}
						options={LAYOUTS}
						selected={design.layoutId}
					/>

					<SelectorGrid
						label="Tipografía"
						onSelect={(id) => setDesignField("fontPairing", id)}
						options={FONT_PAIRINGS}
						selected={design.fontPairing}
					/>

					<SelectorGrid
						label="Botones"
						onSelect={(id) => setDesignField("buttonStyle", id)}
						options={BUTTON_STYLES}
						selected={design.buttonStyle}
					/>

					<div className="space-y-3">
						<p className="font-medium text-foreground text-sm">
							Imagen de portada
						</p>
						<ImageUpload
							endpoint="coverImage"
							onChange={(url) => setDesignField("coverImageUrl", url)}
							value={design.coverImageUrl}
						/>
					</div>
				</section>

				<section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
					<div className="flex items-center justify-between gap-3 border-b bg-muted/40 px-4 py-3">
						<div>
							<p className="font-medium text-sm">Vista previa</p>
							<p className="text-muted-foreground text-xs">
								Los cambios se muestran antes de guardar.
							</p>
						</div>
						{hasChanges ? (
							<Badge variant="outline">Sin guardar</Badge>
						) : (
							<Badge variant="secondary">Actual</Badge>
						)}
					</div>
					<div className="max-h-[720px] overflow-y-auto bg-background">
						<PublicWishlistPage mode="preview" wishlist={previewViewModel} />
					</div>
				</section>
			</div>
		</div>
	);
}
