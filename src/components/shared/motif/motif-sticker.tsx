import type { MotifPreset, MotifTreatment } from "@/config/motifs";
import { cn } from "@/lib/utils";
import { MotifShape } from "./motif-shape";

type Props = {
	motif: MotifPreset;
	treatment: MotifTreatment;
	rotate?: number;
	className?: string;
};

/** The rotated `.stk` corner sticker: a white circle on `base`, an inverted
 * circle on `--primary` under the `band` treatment. */
export function MotifSticker({
	motif,
	treatment,
	rotate = -6,
	className,
}: Props) {
	const [primary] = motif.shapes;
	const surface = treatment === "band" ? "primary" : "base";

	return (
		<div
			className={cn("stk", className)}
			data-motif-treatment={treatment}
			style={{ transform: `rotate(${rotate}deg)` }}
		>
			<MotifShape scale={0.32} shape={primary} surface={surface} />
		</div>
	);
}
