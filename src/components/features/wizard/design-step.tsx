"use client";

import { ImageUpload } from "@/components/features/wishlist/image-upload";
import { PublicWishlistPage } from "@/components/layouts/public-wishlist/public-wishlist-page";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getAllButtonStyles } from "@/config/public-button-styles";
import { getAllFontPairingOptions } from "@/config/public-fonts";
import { getAllLayouts } from "@/config/public-layouts";
import { getAllThemes } from "@/config/public-themes";
import { cn } from "@/lib/utils";
import { draftToPreview } from "@/lib/wishlist/draft-to-preview";
import { useWizardStore } from "./wizard-provider";

const THEMES = getAllThemes();
const LAYOUTS = getAllLayouts();
const FONT_PAIRINGS = getAllFontPairingOptions();
const BUTTON_STYLES = getAllButtonStyles();

function SelectorGrid<T extends { id: string; label: string }>({
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
	accentStyle?: (option: T) => React.CSSProperties;
}) {
	return (
		<div>
			<p className="mb-2 font-medium text-foreground text-sm">{label}</p>
			<div className="flex flex-wrap gap-2">
				{options.map((option) => {
					const isSelected = selected === option.id;
					return (
						<Button
							className={cn(
								"min-h-11 border-2 px-3",
								isSelected
									? "border-primary bg-primary text-primary-foreground hover:bg-primary/80"
									: "border-border bg-card text-card-foreground hover:border-primary/50 hover:bg-accent",
							)}
							key={option.id}
							onClick={() => onSelect(option.id)}
							style={accentStyle?.(option)}
							type="button"
							variant="outline"
						>
							{option.label}
						</Button>
					);
				})}
			</div>
		</div>
	);
}

export function DesignStep() {
	const draft = useWizardStore((s) => s.draft);
	const setField = useWizardStore((s) => s.setField);

	const previewViewModel = draftToPreview(draft);

	return (
		<div className="mx-auto w-full max-w-5xl">
			<h1 className="mb-2 text-center font-semibold text-2xl text-foreground">
				Diseño y vista previa
			</h1>
			<p className="mb-8 text-center text-muted-foreground text-sm">
				Personaliza el aspecto de tu lista
			</p>

			<div className="grid grid-cols-1 gap-8 lg:grid-cols-[320px_1fr]">
				{/* Selectors panel */}
				<div className="space-y-6">
					<SelectorGrid
						accentStyle={(t) => ({
							borderColor:
								draft.themeId === t.id ? undefined : t.preview.primary,
							color: draft.themeId === t.id ? undefined : t.preview.primary,
						})}
						label="Tema de color"
						onSelect={(id) => setField("themeId", id)}
						options={THEMES}
						selected={draft.themeId}
					/>

					<SelectorGrid
						label="Disposición"
						onSelect={(id) => setField("layoutId", id)}
						options={LAYOUTS}
						selected={draft.layoutId}
					/>

					<SelectorGrid
						label="Tipografía"
						onSelect={(id) => setField("fontPairing", id)}
						options={FONT_PAIRINGS}
						selected={draft.fontPairing}
					/>

					<SelectorGrid
						label="Estilo de botón"
						onSelect={(id) => setField("buttonStyle", id)}
						options={BUTTON_STYLES}
						selected={draft.buttonStyle}
					/>

					{/* Cover image upload */}
					<div>
						<p className="mb-2 font-medium text-foreground text-sm">
							Imagen de portada
						</p>
						<ImageUpload
							endpoint="coverImage"
							onChange={(url) => setField("coverImageUrl", url)}
							value={draft.coverImageUrl}
						/>
					</div>
				</div>

				{/* Live preview */}
				<Card className="overflow-hidden">
					<CardHeader className="border-border border-b bg-muted/40 px-4 py-3">
						<p className="text-muted-foreground text-xs">
							Vista previa con ejemplos
						</p>
					</CardHeader>
					<CardContent className="max-h-[600px] overflow-y-auto p-0">
						<PublicWishlistPage mode="preview" wishlist={previewViewModel} />
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
