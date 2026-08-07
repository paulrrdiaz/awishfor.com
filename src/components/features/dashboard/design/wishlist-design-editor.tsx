"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ButtonStyleChips } from "@/components/features/wishlist/button-style-chips";
import { FontSelect } from "@/components/features/wishlist/font-select";
import { LayoutPicker } from "@/components/features/wishlist/layout-picker";
import { MultiImageUpload } from "@/components/features/wishlist/multi-image-upload";
import { ThemeSwatchPicker } from "@/components/features/wishlist/theme-swatch-picker";
import { PublicWishlistPage } from "@/components/layouts/public-wishlist/public-wishlist-page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getAllButtonStyles } from "@/config/public-button-styles";
import {
	DEFAULT_BODY_FONT_ID,
	DEFAULT_HEADING_FONT_ID,
	getAllBodyFontOptions,
	getAllHeadingFontOptions,
} from "@/config/public-fonts";
import {
	buildImageGuidanceHint,
	getAllLayouts,
	resolveLayout,
} from "@/config/public-layouts";
import { getAllThemes } from "@/config/public-themes";
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
const HEADING_FONTS = getAllHeadingFontOptions();
const BODY_FONTS = getAllBodyFontOptions();
const BUTTON_STYLES = getAllButtonStyles();

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
		headingFont: wishlist.headingFont,
		bodyFont: wishlist.bodyFont,
		buttonStyle: wishlist.buttonStyle,
		images: wishlist.images,
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
		design.headingFont !== wishlist.headingFont ||
		design.bodyFont !== wishlist.bodyFont ||
		design.buttonStyle !== wishlist.buttonStyle ||
		JSON.stringify(design.images) !== JSON.stringify(wishlist.images);

	const previewViewModel = draftToPreview(
		persistedWishlistToPreviewDraft(wishlist, design),
	);
	const selectedLayout = resolveLayout(design.layoutId);

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
		<div className="w-full px-4 py-8">
			<div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
				<div>
					<div className="mb-2 flex flex-wrap items-center gap-2">
						<p className="text-muted-foreground text-sm">Diseño de wishlist</p>
						<Badge variant="secondary">{statusLabel(wishlist.status)}</Badge>
					</div>
					<h2 className="font-heading font-semibold text-3xl">
						{wishlist.title}
					</h2>
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
								themeId: design.themeId,
								layoutId: design.layoutId,
								headingFont: design.headingFont,
								bodyFont: design.bodyFont,
								buttonStyle: design.buttonStyle,
								coverImages: design.images.map(({ url, width, height }) => ({
									url,
									width,
									height,
								})),
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
				<section className="space-y-6 self-start rounded-2xl border bg-card p-5 shadow-sm lg:sticky lg:top-4 lg:max-h-[calc(100svh-7.5rem)] lg:overflow-y-auto">
					<div className="space-y-3">
						<p className="font-medium text-foreground text-sm">Tema de color</p>
						<ThemeSwatchPicker
							onSelect={(id) => setDesignField("themeId", id)}
							options={THEMES}
							selected={design.themeId}
						/>
					</div>

					<div className="space-y-3">
						<p className="font-medium text-foreground text-sm">Disposición</p>
						<LayoutPicker
							onSelect={(id) => setDesignField("layoutId", id)}
							options={LAYOUTS}
							selected={design.layoutId}
						/>
					</div>

					<div className="space-y-3">
						<p className="font-medium text-foreground text-sm">
							Imágenes de portada
						</p>
						<MultiImageUpload
							endpoint="coverImage"
							guidance={selectedLayout.imageGuidance}
							hint={buildImageGuidanceHint(selectedLayout)}
							onChange={(images) => setDesignField("images", images)}
							value={design.images}
						/>
					</div>

					<FontSelect
						defaultId={DEFAULT_HEADING_FONT_ID}
						label="Tipografía · Títulos"
						onSelect={(id) => setDesignField("headingFont", id)}
						options={HEADING_FONTS}
						selected={design.headingFont}
					/>

					<FontSelect
						defaultId={DEFAULT_BODY_FONT_ID}
						label="Tipografía · Texto"
						onSelect={(id) => setDesignField("bodyFont", id)}
						options={BODY_FONTS}
						selected={design.bodyFont}
					/>

					<div className="space-y-3">
						<p className="font-medium text-foreground text-sm">
							Estilo de botón
						</p>
						<ButtonStyleChips
							onSelect={(id) => setDesignField("buttonStyle", id)}
							options={BUTTON_STYLES}
							selected={design.buttonStyle}
						/>
					</div>
				</section>

				<section className="flex min-h-0 flex-col overflow-hidden rounded-2xl border bg-card shadow-sm">
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
					<div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden bg-background">
						<PublicWishlistPage mode="preview" wishlist={previewViewModel} />
					</div>
				</section>
			</div>
		</div>
	);
}
