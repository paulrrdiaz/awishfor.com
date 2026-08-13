import type { CSSProperties } from "react";
import type { MotifColors, MotifShape as MotifShapeId } from "@/config/motifs";
import { cn } from "@/lib/utils";
import { SHAPE_SVGS } from "./motif-shape-svgs";

type MotifShapeStyle = CSSProperties & Record<`--${string}`, string | number>;

type Props = {
	shape: MotifShapeId;
	/** Design-specified static transform for this instance. */
	scale?: number;
	rotate?: number;
	opacity?: number;
	/**
	 * Depth multiplier for the hover-tilt effect (0 disables tilt for this
	 * instance). Only hero scatter motifs use a nonzero value.
	 */
	tiltDepth?: number;
	/**
	 * "base" passes the resolved palette through unchanged. "primary" is for
	 * motifs sitting on a `--primary`-filled surface (the `band` treatment's
	 * countdown chip and gift sticker): body/detail render white and features
	 * render in the motif's own `m3Inverted`.
	 */
	surface?: "base" | "primary";
	/**
	 * Fixed-palette-only color identity for this instance (a secondary shape
	 * with its own natural color, e.g. an orange fox). Ignored under the
	 * `primary` surface, which always forces white/inverted.
	 */
	colors?: Partial<MotifColors>;
	className?: string;
	/**
	 * Extra inline style, merged after the computed transform/opacity
	 * variables. Used by standalone previews (the motif picker) to supply
	 * `--motif-m3-inverted` outside the public theme wrapper that normally
	 * provides it.
	 */
	style?: MotifShapeStyle;
};

export function MotifShape({
	shape,
	scale = 1,
	rotate = 0,
	opacity = 1,
	tiltDepth = 0,
	surface = "base",
	colors,
	className,
	style: styleOverride,
}: Props) {
	const { viewBox, width, height, children } = SHAPE_SVGS[shape];

	const style: MotifShapeStyle = {
		"--motif-scale": scale,
		"--motif-rotate": `${rotate}deg`,
		"--motif-tilt-depth": tiltDepth,
		opacity,
		...styleOverride,
	};

	if (surface === "base" && colors) {
		if (colors.m1) style["--m1"] = colors.m1;
		if (colors.m2) style["--m2"] = colors.m2;
		if (colors.m3) style["--m3"] = colors.m3;
		if (colors.mc1) style["--mc1"] = colors.mc1;
	}

	return (
		<div
			aria-hidden="true"
			className={cn("mot", className)}
			data-motif-surface={surface}
			style={style}
		>
			<svg aria-hidden="true" height={height} viewBox={viewBox} width={width}>
				{children}
			</svg>
		</div>
	);
}
