import type { CSSProperties } from "react";
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

type MarginInstance = {
	side: "left" | "right";
	role: "primary" | "secondary";
	top: string;
	inset: string;
	scale: number;
	opacity: number;
	rotate?: number;
	floatDistance: number;
	floatDuration: number;
	floatDelay: number;
};

// Flanks a full-bleed section's content column, not the whole scene. Only
// visible once the viewport is wide enough to actually leave a gutter
// outside the max-w content column. Bigger instances sit closer to the true
// edge and are allowed to bleed into `overflow-hidden`, same as the hero's
// corner shapes — it reads as "peeking in" rather than a clipped mistake.
const MARGIN_LAYOUT: MarginInstance[] = [
	{
		side: "left",
		role: "primary",
		top: "4%",
		inset: "-2%",
		scale: 1.3,
		opacity: 0.4,
		rotate: -8,
		floatDistance: -12,
		floatDuration: 6.2,
		floatDelay: 0,
	},
	{
		side: "left",
		role: "secondary",
		top: "26%",
		inset: "6%",
		scale: 0.5,
		opacity: 0.26,
		rotate: 10,
		floatDistance: -6,
		floatDuration: 4.2,
		floatDelay: 0.9,
	},
	{
		side: "left",
		role: "secondary",
		top: "52%",
		inset: "1%",
		scale: 0.75,
		opacity: 0.32,
		rotate: -5,
		floatDistance: -8,
		floatDuration: 5,
		floatDelay: 1.8,
	},
	{
		side: "left",
		role: "primary",
		top: "80%",
		inset: "4%",
		scale: 0.6,
		opacity: 0.3,
		rotate: 6,
		floatDistance: -7,
		floatDuration: 4.6,
		floatDelay: 0.5,
	},
	{
		side: "right",
		role: "secondary",
		top: "10%",
		inset: "4%",
		scale: 0.65,
		opacity: 0.3,
		rotate: 7,
		floatDistance: -7,
		floatDuration: 4.8,
		floatDelay: 0.6,
	},
	{
		side: "right",
		role: "primary",
		top: "34%",
		inset: "-1%",
		scale: 1.15,
		opacity: 0.4,
		rotate: -5,
		floatDistance: -11,
		floatDuration: 6,
		floatDelay: 1.4,
	},
	{
		side: "right",
		role: "secondary",
		top: "62%",
		inset: "7%",
		scale: 0.45,
		opacity: 0.26,
		rotate: -9,
		floatDistance: -5,
		floatDuration: 4,
		floatDelay: 2.1,
	},
	{
		side: "right",
		role: "primary",
		top: "86%",
		inset: "2%",
		scale: 0.85,
		opacity: 0.36,
		rotate: 4,
		floatDistance: -9,
		floatDuration: 5.4,
		floatDelay: 1,
	},
	{
		side: "left",
		role: "secondary",
		top: "15%",
		inset: "9%",
		scale: 0.4,
		opacity: 0.24,
		rotate: -12,
		floatDistance: -5,
		floatDuration: 3.8,
		floatDelay: 1.3,
	},
	{
		side: "left",
		role: "primary",
		top: "38%",
		inset: "3%",
		scale: 0.95,
		opacity: 0.34,
		rotate: 7,
		floatDistance: -10,
		floatDuration: 5.7,
		floatDelay: 2.3,
	},
	{
		side: "left",
		role: "secondary",
		top: "65%",
		inset: "-1%",
		scale: 1.1,
		opacity: 0.36,
		rotate: -4,
		floatDistance: -9,
		floatDuration: 5.3,
		floatDelay: 0.2,
	},
	{
		side: "left",
		role: "primary",
		top: "93%",
		inset: "7%",
		scale: 0.5,
		opacity: 0.26,
		rotate: 9,
		floatDistance: -6,
		floatDuration: 4.4,
		floatDelay: 1.6,
	},
	{
		side: "right",
		role: "primary",
		top: "22%",
		inset: "8%",
		scale: 0.5,
		opacity: 0.26,
		rotate: -7,
		floatDistance: -6,
		floatDuration: 4.3,
		floatDelay: 1.9,
	},
	{
		side: "right",
		role: "secondary",
		top: "48%",
		inset: "2%",
		scale: 1.2,
		opacity: 0.38,
		rotate: 5,
		floatDistance: -12,
		floatDuration: 6.4,
		floatDelay: 0.3,
	},
	{
		side: "right",
		role: "primary",
		top: "75%",
		inset: "10%",
		scale: 0.42,
		opacity: 0.24,
		rotate: -10,
		floatDistance: -5,
		floatDuration: 3.9,
		floatDelay: 2.5,
	},
	{
		side: "right",
		role: "secondary",
		top: "96%",
		inset: "0%",
		scale: 0.8,
		opacity: 0.32,
		rotate: 6,
		floatDistance: -8,
		floatDuration: 5.1,
		floatDelay: 1.1,
	},
];

/**
 * Ambient floating motif shapes tucked into the gutters beside a full-bleed
 * section's centered content column (see `ArchTrioLayout`'s hero for the
 * same left-1/2/w-screen breakout this is meant to sit inside). `scene`
 * only, same as `MotifScatter` — `band` doesn't use floating shapes.
 */
export function MotifMarginScatter({
	motif,
	treatment,
	palette,
	className,
}: Props) {
	if (treatment !== "scene") {
		return null;
	}

	const [primary, secondary] = motif.shapes;
	const secondaryColors =
		palette === "fixed" ? motif.secondaryColors : undefined;

	return (
		// z-10: a sibling full-bleed surface (e.g. the gift list band) is also
		// `position:relative` for its own breakout and sits later in DOM order,
		// so without an explicit stack level it paints over this absolutely
		// positioned layer instead of the reverse.
		<div
			className={cn(
				"pointer-events-none absolute inset-y-0 right-0 left-0 z-10 hidden overflow-hidden xl:block",
				className,
			)}
		>
			{MARGIN_LAYOUT.map((instance, index) => (
				<div
					className="motif-float absolute"
					// biome-ignore lint/suspicious/noArrayIndexKey: fixed, order-dependent decorative layout, never reordered
					key={`${instance.side}-${instance.role}-${index}`}
					style={
						{
							top: instance.top,
							[instance.side]: instance.inset,
							"--motif-float-delay": `${instance.floatDelay}s`,
							"--motif-float-distance": `${instance.floatDistance}px`,
							"--motif-float-duration": `${instance.floatDuration}s`,
						} as CSSProperties
					}
				>
					<MotifShape
						colors={instance.role === "secondary" ? secondaryColors : undefined}
						opacity={instance.opacity}
						rotate={instance.rotate}
						scale={instance.scale}
						shape={instance.role === "primary" ? primary : secondary}
					/>
				</div>
			))}
		</div>
	);
}
