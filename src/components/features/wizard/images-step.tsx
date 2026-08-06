"use client";

import { CircleAlert } from "lucide-react";
import { MultiImageUpload } from "@/components/features/wishlist/multi-image-upload";
import { PublicWishlistPage } from "@/components/layouts/public-wishlist/public-wishlist-page";
import { buildImageGuidanceHint, resolveLayout } from "@/config/public-layouts";
import { draftToPreview } from "@/lib/wishlist/draft-to-preview";
import { useWizardStore } from "./wizard-provider";

const EYEBROW = "font-mono text-[11px] font-medium uppercase tracking-[0.14em]";

export function ImagesStep() {
	const draft = useWizardStore((s) => s.draft);
	const setField = useWizardStore((s) => s.setField);

	const previewViewModel = draftToPreview(draft);
	const selectedLayout = resolveLayout(draft.layoutId);
	const shortfall = selectedLayout.heroImageSlots - draft.images.length;

	return (
		<div className="mx-auto w-full max-w-5xl lg:flex lg:h-full lg:min-h-0 lg:max-w-none">
			<div className="lg:w-[420px] lg:shrink-0 lg:overflow-y-auto lg:border-border lg:border-r lg:px-8 lg:py-8">
				<h1 className="mb-2 text-center font-semibold text-2xl text-foreground lg:mb-1.5 lg:text-left lg:font-serif lg:text-[26px]">
					Sube tus fotos
				</h1>
				<p className="mb-8 text-center text-muted-foreground text-sm lg:mb-5 lg:text-left lg:text-[13.5px]">
					{buildImageGuidanceHint(selectedLayout)}
				</p>

				<MultiImageUpload
					endpoint="coverImage"
					guidance={selectedLayout.imageGuidance}
					onChange={(images) => setField("images", images)}
					value={draft.images}
					variant="inline"
				/>

				{shortfall > 0 && (
					<div className="mt-4 flex items-start gap-2.5 rounded-lg border border-[#F0DBA8] bg-[#FBF1DC] px-3.5 py-3 text-[#8A6512] text-sm">
						<CircleAlert className="mt-0.5 size-4 shrink-0" />
						<p>
							Te faltan {shortfall} {shortfall === 1 ? "foto" : "fotos"} para
							completar este diseño. Puedes seguir avanzando; usaremos fotos de
							muestra en la vista previa hasta que las agregues, y tendrás que
							completarlas antes de publicar.
						</p>
					</div>
				)}
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
