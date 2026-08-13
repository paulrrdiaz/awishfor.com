import type { MotifPreset, MotifTreatment } from "@/config/motifs";
import { cn } from "@/lib/utils";
import { MotifShape } from "./motif-shape";

type Props = {
	motif: MotifPreset;
	treatment: MotifTreatment;
	className?: string;
};

/** White 60px drop-shadowed circle wrapping the primary shape. `band` only —
 * replaces the hero scatter. Always the `base` surface: it recolors
 * identically to a card, needing no inversion. */
export function MotifSeal({ motif, treatment, className }: Props) {
	if (treatment !== "band") {
		return null;
	}

	const [primary] = motif.shapes;

	return (
		<div className={cn("seal", className)}>
			<MotifShape scale={0.7} shape={primary} />
		</div>
	);
}
