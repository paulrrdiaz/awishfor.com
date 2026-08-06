"use client";

import { ButtonStyleChips } from "@/components/features/wishlist/button-style-chips";
import { FontSelect } from "@/components/features/wishlist/font-select";
import { ThemeSwatchPicker } from "@/components/features/wishlist/theme-swatch-picker";
import { PublicWishlistPage } from "@/components/layouts/public-wishlist/public-wishlist-page";
import { getAllButtonStyles } from "@/config/public-button-styles";
import {
	DEFAULT_BODY_FONT_ID,
	DEFAULT_HEADING_FONT_ID,
	getAllBodyFontOptions,
	getAllHeadingFontOptions,
} from "@/config/public-fonts";
import { getAllThemes } from "@/config/public-themes";
import { draftToPreview } from "@/lib/wishlist/draft-to-preview";
import { useWizardStore } from "./wizard-provider";

const THEMES = getAllThemes();
const HEADING_FONTS = getAllHeadingFontOptions();
const BODY_FONTS = getAllBodyFontOptions();
const BUTTON_STYLES = getAllButtonStyles();

const EYEBROW = "font-mono text-[11px] font-medium uppercase tracking-[0.14em]";

export function ThemeStep() {
	const draft = useWizardStore((s) => s.draft);
	const setField = useWizardStore((s) => s.setField);

	const previewViewModel = draftToPreview(draft);

	return (
		<div className="mx-auto w-full max-w-5xl lg:flex lg:h-full lg:min-h-0 lg:max-w-none">
			<div className="lg:w-[420px] lg:shrink-0 lg:overflow-y-auto lg:border-border lg:border-r lg:px-8 lg:py-8">
				<h1 className="mb-2 text-center font-semibold text-2xl text-foreground lg:mb-1.5 lg:text-left lg:font-serif lg:text-[24px]">
					Elige un tema
				</h1>
				<p className="mb-8 text-center text-muted-foreground text-sm lg:mb-[18px] lg:text-left lg:text-[13px]">
					Personaliza los colores y la tipografía de tu página
				</p>

				<div className="mb-5">
					<p className="mb-[7px] font-semibold text-[13px] text-foreground">
						Tema de color
					</p>
					<ThemeSwatchPicker
						onSelect={(id) => setField("themeId", id)}
						options={THEMES}
						selected={draft.themeId}
						variant="inline"
					/>
				</div>

				<div className="mb-2.5">
					<FontSelect
						defaultId={DEFAULT_HEADING_FONT_ID}
						label="Tipografía · Títulos"
						onSelect={(id) => setField("headingFont", id)}
						options={HEADING_FONTS}
						selected={draft.headingFont}
						variant="inline"
					/>
				</div>

				<div className="mb-5">
					<FontSelect
						defaultId={DEFAULT_BODY_FONT_ID}
						label="Tipografía · Texto"
						onSelect={(id) => setField("bodyFont", id)}
						options={BODY_FONTS}
						selected={draft.bodyFont}
						variant="inline"
					/>
				</div>

				<div>
					<p className="mb-[7px] font-semibold text-[13px] text-foreground">
						Estilo de botones
					</p>
					<ButtonStyleChips
						onSelect={(id) => setField("buttonStyle", id)}
						options={BUTTON_STYLES}
						selected={draft.buttonStyle}
						variant="inline"
					/>
				</div>
			</div>

			<div className="mt-8 lg:mt-0 lg:flex lg:min-h-0 lg:flex-1 lg:flex-col lg:px-8 lg:py-8">
				<p
					className={`mb-3.5 hidden ${EYEBROW} text-muted-foreground lg:block`}
				>
					Vista previa en vivo
				</p>
				<div className="flex flex-col overflow-hidden rounded-[18px] border border-border bg-card lg:min-h-0 lg:flex-1">
					<div className="max-h-[600px] overflow-y-auto lg:h-full lg:max-h-none">
						<PublicWishlistPage mode="preview" wishlist={previewViewModel} />
					</div>
				</div>
			</div>
		</div>
	);
}
