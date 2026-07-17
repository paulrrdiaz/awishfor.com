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
		<div className="mx-auto w-full max-w-5xl lg:flex lg:h-full lg:max-w-none lg:min-h-0">
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
						<div className="flex flex-wrap gap-2">
							{THEMES.map((theme) => {
								const isSelected = draft.themeId === theme.id;
								return (
									<Button
										aria-label={theme.label}
										className={cn(
											"size-11 rounded-full border-2 p-1 hover:border-primary/50",
											isSelected
												? "border-primary shadow-[0_0_0_2px_var(--primary)]"
												: "border-border",
										)}
										key={theme.id}
										onClick={() => setField("themeId", theme.id)}
										style={{ backgroundColor: theme.preview.background }}
										type="button"
										variant="outline"
									>
										<span
											aria-hidden
											className="block size-full rounded-full"
											style={{ backgroundColor: theme.preview.primary }}
										/>
									</Button>
								);
							})}
						</div>
					</div>

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
			</div>

			<div className="mt-8 lg:mt-0 lg:flex lg:flex-1 lg:min-h-0 lg:flex-col lg:bg-[#E6EBF0] lg:px-7 lg:py-6">
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
