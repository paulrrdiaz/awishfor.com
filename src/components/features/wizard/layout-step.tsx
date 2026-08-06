"use client";

import { LayoutPicker } from "@/components/features/wishlist/layout-picker";
import { PublicWishlistPage } from "@/components/layouts/public-wishlist/public-wishlist-page";
import { getAllLayouts, resolveLayout } from "@/config/public-layouts";
import { draftToPreview } from "@/lib/wishlist/draft-to-preview";
import { useWizardStore } from "./wizard-provider";

const LAYOUTS = getAllLayouts();

const EYEBROW = "font-mono text-[11px] font-medium uppercase tracking-[0.14em]";

export function LayoutStep() {
	const draft = useWizardStore((s) => s.draft);
	const setField = useWizardStore((s) => s.setField);

	const previewViewModel = draftToPreview(draft);
	const selectedLayout = resolveLayout(draft.layoutId);

	return (
		<div className="mx-auto w-full max-w-5xl lg:flex lg:h-full lg:min-h-0 lg:max-w-none">
			<div className="lg:w-[460px] lg:shrink-0 lg:overflow-y-auto lg:border-border lg:border-r lg:px-8 lg:py-8">
				<h1 className="mb-2 text-center font-semibold text-2xl text-foreground lg:mb-1.5 lg:text-left lg:font-serif lg:text-[24px]">
					Elige una disposición
				</h1>
				<p className="mb-8 text-center text-muted-foreground text-sm lg:mb-[18px] lg:text-left lg:text-[13px]">
					Selecciona la composición que mejor presenta tu wishlist
				</p>

				<LayoutPicker
					onSelect={(id) => setField("layoutId", id)}
					options={LAYOUTS}
					selected={draft.layoutId}
					variant="inline"
				/>
			</div>

			<div className="mt-8 lg:mt-0 lg:flex lg:min-h-0 lg:flex-1 lg:flex-col lg:px-8 lg:py-8">
				<p
					className={`mb-3.5 hidden ${EYEBROW} text-muted-foreground lg:block`}
				>
					Vista previa — {selectedLayout.label}
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
