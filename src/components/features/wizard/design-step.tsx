"use client";

import { ImageUpload } from "@/components/features/wishlist/image-upload";
import { PublicWishlistPage } from "@/components/layouts/public-wishlist/public-wishlist-page";
import { getAllButtonStyles } from "@/config/public-button-styles";
import { getAllFontPairingOptions } from "@/config/public-fonts";
import { getAllLayouts } from "@/config/public-layouts";
import { getAllThemes } from "@/config/public-themes";
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
			<p className="mb-2 font-medium text-gray-700 text-sm">{label}</p>
			<div className="flex flex-wrap gap-2">
				{options.map((option) => {
					const isSelected = selected === option.id;
					return (
						<button
							className={[
								"rounded-lg border-2 px-3 py-2 text-sm transition-all",
								isSelected
									? "border-gray-900 bg-gray-900 text-white"
									: "border-gray-200 bg-white text-gray-700 hover:border-gray-400",
							].join(" ")}
							key={option.id}
							onClick={() => onSelect(option.id)}
							style={accentStyle?.(option)}
							type="button"
						>
							{option.label}
						</button>
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
		<div className="mx-auto w-full max-w-5xl px-4 py-8">
			<h1 className="mb-2 text-center font-semibold text-2xl text-gray-900">
				Diseño y vista previa
			</h1>
			<p className="mb-8 text-center text-gray-500 text-sm">
				Personaliza el aspecto de tu lista
			</p>

			<div className="grid grid-cols-1 gap-8 lg:grid-cols-[320px_1fr]">
				{/* Selectors panel */}
				<div className="space-y-6">
					<SelectorGrid
						accentStyle={(t) => ({
							borderColor:
								draft.themeId === t.id ? undefined : t.vars["--public-accent"],
							color:
								draft.themeId === t.id ? undefined : t.vars["--public-accent"],
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
						<p className="mb-2 font-medium text-gray-700 text-sm">
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
				<div className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
					<div className="border-gray-100 border-b bg-gray-50 px-4 py-2">
						<p className="text-gray-500 text-xs">Vista previa</p>
					</div>
					<div className="max-h-[600px] overflow-y-auto">
						<PublicWishlistPage mode="preview" wishlist={previewViewModel} />
					</div>
				</div>
			</div>
		</div>
	);
}
