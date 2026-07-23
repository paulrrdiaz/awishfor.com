"use client";

import { ButtonStyleChips } from "@/components/features/wishlist/button-style-chips";
import { FontSelect } from "@/components/features/wishlist/font-select";
import { LayoutPicker } from "@/components/features/wishlist/layout-picker";
import { MultiImageUpload } from "@/components/features/wishlist/multi-image-upload";
import { ThemeSwatchPicker } from "@/components/features/wishlist/theme-swatch-picker";
import { PublicWishlistPage } from "@/components/layouts/public-wishlist/public-wishlist-page";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
import { useWizardStore } from "./wizard-provider";

const THEMES = getAllThemes();
const LAYOUTS = getAllLayouts();
const HEADING_FONTS = getAllHeadingFontOptions();
const BODY_FONTS = getAllBodyFontOptions();
const BUTTON_STYLES = getAllButtonStyles();

export function DesignStep() {
	const draft = useWizardStore((s) => s.draft);
	const setField = useWizardStore((s) => s.setField);

	const previewViewModel = draftToPreview(draft);
	const selectedLayout = resolveLayout(draft.layoutId);

	return (
		<div className="mx-auto w-full max-w-5xl lg:flex lg:h-full lg:min-h-0 lg:max-w-none">
			<div className="lg:w-[420px] lg:shrink-0 lg:overflow-y-auto lg:border-border lg:border-r lg:px-8 lg:py-7">
				<p className="mb-2 font-medium text-muted-foreground text-xs uppercase tracking-wide">
					Paso 3 de 5
				</p>
				<h1 className="mb-2 text-center font-semibold text-2xl text-foreground lg:text-left lg:font-serif lg:text-3xl">
					Diseña tu página
				</h1>
				<p className="mb-8 text-center text-muted-foreground text-sm lg:text-left">
					Personaliza el aspecto de tu lista
				</p>

				<div className="space-y-6">
					<div>
						<p className="mb-2 font-medium text-foreground text-sm">
							Tema de color
						</p>
						<ThemeSwatchPicker
							onSelect={(id) => setField("themeId", id)}
							options={THEMES}
							selected={draft.themeId}
						/>
					</div>

					<div>
						<p className="mb-2 font-medium text-foreground text-sm">
							Disposición
						</p>
						<LayoutPicker
							onSelect={(id) => setField("layoutId", id)}
							options={LAYOUTS}
							selected={draft.layoutId}
						/>
					</div>

					<div>
						<p className="mb-2 font-medium text-foreground text-sm">
							Imágenes de portada
						</p>
						<MultiImageUpload
							endpoint="coverImage"
							guidance={selectedLayout.imageGuidance}
							hint={buildImageGuidanceHint(selectedLayout)}
							onChange={(urls) => {
								setField("coverImageUrls", urls);
								setField("coverImageUrl", urls[0] ?? null);
							}}
							value={draft.coverImageUrls}
						/>
					</div>

					<FontSelect
						defaultId={DEFAULT_HEADING_FONT_ID}
						label="Tipografía · Títulos"
						onSelect={(id) => setField("headingFont", id)}
						options={HEADING_FONTS}
						selected={draft.headingFont}
					/>

					<FontSelect
						defaultId={DEFAULT_BODY_FONT_ID}
						label="Tipografía · Texto"
						onSelect={(id) => setField("bodyFont", id)}
						options={BODY_FONTS}
						selected={draft.bodyFont}
					/>

					<div>
						<p className="mb-2 font-medium text-foreground text-sm">
							Estilo de botón
						</p>
						<ButtonStyleChips
							onSelect={(id) => setField("buttonStyle", id)}
							options={BUTTON_STYLES}
							selected={draft.buttonStyle}
						/>
					</div>
				</div>
			</div>

			<div className="mt-8 lg:mt-0 lg:flex lg:min-h-0 lg:flex-1 lg:flex-col lg:bg-[#E6EBF0] lg:px-7 lg:py-6">
				<div className="hidden items-center justify-between lg:mb-4 lg:flex">
					<p className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
						Vista previa en vivo
					</p>
					<span className="rounded-full bg-card px-3 py-1 font-medium text-foreground text-xs">
						en vivo
					</span>
				</div>
				<Card className="overflow-hidden lg:min-h-0 lg:flex-1">
					<CardHeader className="border-border border-b bg-muted/40 px-4 py-3">
						<p className="text-muted-foreground text-xs">
							Vista previa con ejemplos
						</p>
					</CardHeader>
					<CardContent className="max-h-[600px] overflow-y-auto p-0 lg:h-full">
						<PublicWishlistPage mode="preview" wishlist={previewViewModel} />
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
