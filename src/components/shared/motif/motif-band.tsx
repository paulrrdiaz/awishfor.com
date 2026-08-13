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
	/**
	 * The footer band renders under both treatments (reduced opacity under
	 * `scene`, accent-filled under `band`). The header band exists only
	 * under `band`.
	 */
	position?: "header" | "footer";
	className?: string;
};

/** The `.mband` row: a single reduced-opacity strip under `scene`, an
 * accent-filled strip above and below the content under `band`. */
export function MotifBand({
	motif,
	treatment,
	palette,
	position = "footer",
	className,
}: Props) {
	if (position === "header" && treatment !== "band") {
		return null;
	}

	const [primary, secondary] = motif.shapes;
	const secondaryColors =
		palette === "fixed" ? motif.secondaryColors : undefined;

	// Alternating secondary/primary rhythm, small-large-small, so the band
	// reads as a scattered pattern rather than three evenly-sized icons.
	const sequence: Array<{ shape: typeof primary; scale: number }> = [
		{ shape: secondary, scale: 0.2 },
		{ shape: primary, scale: 0.3 },
		{ shape: secondary, scale: 0.24 },
		{ shape: primary, scale: 0.4 },
		{ shape: secondary, scale: 0.22 },
		{ shape: primary, scale: 0.28 },
		{ shape: secondary, scale: 0.18 },
	];

	return (
		<div className={cn("mband", className)} data-motif-treatment={treatment}>
			{sequence.map(({ shape, scale }, index) => (
				<MotifShape
					colors={shape === secondary ? secondaryColors : undefined}
					// biome-ignore lint/suspicious/noArrayIndexKey: fixed, order-dependent decorative sequence, never reordered
					key={`${shape}-${index}`}
					scale={scale}
					shape={shape}
				/>
			))}
		</div>
	);
}
