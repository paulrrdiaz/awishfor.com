import type {
	MotifPalette,
	MotifPreset,
	MotifTreatment,
} from "@/config/motifs";
import { cn } from "@/lib/utils";
import { MotifShape } from "./motif-shape";

type Props = {
	motif: MotifPreset;
	treatment: MotifTreatment;
	palette: MotifPalette;
	className?: string;
};

/** The `.mdiv` section-break row. `scene` only — `band` has no divider. */
export function MotifDivider({ motif, treatment, palette, className }: Props) {
	if (treatment !== "scene") {
		return null;
	}

	const [primary, secondary] = motif.shapes;
	const secondaryColors =
		palette === "fixed" ? motif.secondaryColors : undefined;

	return (
		<div className={cn("mdiv", className)}>
			<MotifShape
				colors={secondaryColors}
				opacity={0.55}
				scale={0.4}
				shape={secondary}
			/>
			<MotifShape scale={0.5} shape={primary} />
			<MotifShape
				colors={secondaryColors}
				opacity={0.55}
				scale={0.4}
				shape={secondary}
			/>
		</div>
	);
}
