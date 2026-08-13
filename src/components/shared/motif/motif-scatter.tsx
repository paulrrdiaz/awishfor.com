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

type ScatterInstance = {
	role: "primary" | "secondary";
	position: { top?: string; bottom?: string; left?: string; right?: string };
	scale: number;
	opacity: number;
	rotate?: number;
	tiltDepth: number;
	/** Idle float loop, in px/seconds — bigger shapes drift further and slower. */
	floatDistance: number;
	floatDuration: number;
	floatDelay: number;
};

const SCATTER_LAYOUT: ScatterInstance[] = [
	{
		role: "secondary",
		position: { top: "6%", left: "4%" },
		scale: 1.3,
		opacity: 0.45,
		tiltDepth: 4,
		floatDistance: -10,
		floatDuration: 5.5,
		floatDelay: 0,
	},
	{
		role: "primary",
		position: { top: "2%", right: "5%" },
		scale: 1.5,
		opacity: 0.9,
		rotate: -4,
		tiltDepth: 7,
		floatDistance: -12,
		floatDuration: 6.5,
		floatDelay: 0.4,
	},
	{
		role: "secondary",
		position: { bottom: "10%", left: "10%" },
		scale: 0.9,
		opacity: 0.35,
		rotate: 6,
		tiltDepth: 3,
		floatDistance: -7,
		floatDuration: 4.5,
		floatDelay: 0.8,
	},
	{
		role: "primary",
		position: { bottom: "6%", right: "12%" },
		scale: 1.1,
		opacity: 0.55,
		rotate: 5,
		tiltDepth: 5,
		floatDistance: -9,
		floatDuration: 5,
		floatDelay: 1.2,
	},
	{
		role: "secondary",
		position: { top: "38%", right: "2%" },
		scale: 0.7,
		opacity: 0.3,
		tiltDepth: 2,
		floatDistance: -6,
		floatDuration: 4,
		floatDelay: 1.6,
	},
	{
		role: "secondary",
		position: { top: "45%", left: "1%" },
		scale: 0.6,
		opacity: 0.3,
		rotate: -6,
		tiltDepth: 2,
		floatDistance: -5,
		floatDuration: 4.2,
		floatDelay: 0.6,
	},
	{
		role: "secondary",
		position: { top: "18%", right: "24%" },
		scale: 0.55,
		opacity: 0.28,
		rotate: 8,
		tiltDepth: 2,
		floatDistance: -6,
		floatDuration: 4.8,
		floatDelay: 2,
	},
	{
		role: "primary",
		position: { bottom: "0%", left: "26%" },
		scale: 0.75,
		opacity: 0.4,
		rotate: -5,
		tiltDepth: 3,
		floatDistance: -8,
		floatDuration: 5.8,
		floatDelay: 1,
	},
];

/**
 * Absolutely-positioned hero motifs at the design opacities. `scene` only —
 * `band` replaces this with `MotifSeal`. Renders inside a
 * `position: relative` hero; attach `useMotifTilt` to that same hero's ref so
 * the ambient `--tilt-x`/`--tilt-y` these motifs consume are populated.
 */
export function MotifScatter({ motif, treatment, palette, className }: Props) {
	if (treatment !== "scene") {
		return null;
	}

	const [primary, secondary] = motif.shapes;
	const secondaryColors =
		palette === "fixed" ? motif.secondaryColors : undefined;

	return (
		<div
			className={cn(
				"pointer-events-none absolute inset-0 overflow-hidden",
				className,
			)}
		>
			{SCATTER_LAYOUT.map((instance, index) => (
				<div
					className="motif-float absolute"
					// biome-ignore lint/suspicious/noArrayIndexKey: fixed, order-dependent decorative layout, never reordered
					key={`${instance.role}-${index}`}
					style={
						{
							bottom: instance.position.bottom,
							left: instance.position.left,
							right: instance.position.right,
							top: instance.position.top,
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
						tiltDepth={instance.tiltDepth}
					/>
				</div>
			))}
		</div>
	);
}
