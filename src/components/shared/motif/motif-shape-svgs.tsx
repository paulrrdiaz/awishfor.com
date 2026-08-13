import type { ReactNode } from "react";
import type { MotifShape as MotifShapeId } from "@/config/motifs";

export type ShapeSvg = {
	viewBox: string;
	width: number;
	height: number;
	children: ReactNode;
};

/**
 * Inline SVG illustrations for every motif shape, keyed by `MotifShape` id.
 * Native `width`/`height` are ported 1:1 from the former `.m-<shape>` CSS
 * rules so every existing placement `scale` value renders the same physical
 * size. Kawaii group (bear, bunny, fox, unicorn, duck, dino, elephant) gets
 * eyes/blush; geometric group stays faceless. See design.md decision 3.
 */
export const SHAPE_SVGS: Record<MotifShapeId, ShapeSvg> = {
	cloud: {
		viewBox: "0 0 54 30",
		width: 54,
		height: 30,
		children: (
			<>
				<circle cx={15} cy={15} fill="var(--mc1, var(--m1))" r={10} />
				<circle cx={29} cy={12} fill="var(--mc1, var(--m1))" r={11} />
				<circle cx={41} cy={15} fill="var(--mc1, var(--m1))" r={9} />
				<ellipse cx={27} cy={21} fill="var(--mc1, var(--m1))" rx={26} ry={9} />
			</>
		),
	},
	bear: {
		viewBox: "0 0 44 44",
		width: 44,
		height: 44,
		children: (
			<>
				<circle cx={9} cy={9} fill="var(--m1)" r={7} />
				<circle cx={35} cy={9} fill="var(--m1)" r={7} />
				<circle cx={22} cy={24} fill="var(--m1)" r={18} />
				<ellipse cx={22} cy={29} fill="var(--m2)" rx={9} ry={6.5} />
				<circle cx={16} cy={22} fill="var(--m3)" r={2} />
				<circle cx={28} cy={22} fill="var(--m3)" r={2} />
				<ellipse cx={22} cy={26} fill="var(--m3)" rx={2} ry={1.5} />
				<ellipse
					cx={11}
					cy={30}
					fill="var(--m3)"
					fillOpacity={0.25}
					rx={3}
					ry={2.5}
				/>
				<ellipse
					cx={33}
					cy={30}
					fill="var(--m3)"
					fillOpacity={0.25}
					rx={3}
					ry={2.5}
				/>
			</>
		),
	},
	flower: {
		viewBox: "0 0 34 34",
		width: 34,
		height: 34,
		children: (
			<>
				<circle cx={17} cy={8} fill="var(--m1)" r={8} />
				<circle cx={17} cy={26} fill="var(--m1)" r={8} />
				<circle cx={8} cy={17} fill="var(--m1)" r={8} />
				<circle cx={26} cy={17} fill="var(--m1)" r={8} />
				<circle cx={17} cy={17} fill="var(--m2)" r={6} />
			</>
		),
	},
	bunny: {
		viewBox: "0 0 38 46",
		width: 38,
		height: 46,
		children: (
			<>
				<rect
					fill="var(--m1)"
					height={26}
					rx={5}
					stroke="var(--m3)"
					strokeWidth={1.1}
					transform="rotate(-8 9 13)"
					width={10}
					x={4}
					y={0}
				/>
				<rect
					fill="var(--m1)"
					height={26}
					rx={5}
					stroke="var(--m3)"
					strokeWidth={1.1}
					transform="rotate(8 29 13)"
					width={10}
					x={24}
					y={0}
				/>
				<rect
					fill="var(--m2)"
					fillOpacity={0.8}
					height={18}
					rx={3}
					transform="rotate(-8 9 13)"
					width={6}
					x={6}
					y={4}
				/>
				<rect
					fill="var(--m2)"
					fillOpacity={0.8}
					height={18}
					rx={3}
					transform="rotate(8 29 13)"
					width={6}
					x={26}
					y={4}
				/>
				<circle
					cx={19}
					cy={30}
					fill="var(--m1)"
					r={16}
					stroke="var(--m3)"
					strokeWidth={1.4}
				/>
				<ellipse
					cx={22}
					cy={38}
					fill="color-mix(in srgb, var(--m1) 80%, black 20%)"
					fillOpacity={0.5}
					rx={10}
					ry={5}
				/>
				<ellipse
					cx={13}
					cy={21}
					fill="color-mix(in srgb, var(--m1) 65%, white 35%)"
					fillOpacity={0.75}
					rx={6}
					ry={4}
					transform="rotate(-20 13 21)"
				/>
				<ellipse
					cx={19}
					cy={35}
					fill="var(--m2)"
					fillOpacity={0.55}
					rx={8}
					ry={7}
				/>
				<ellipse
					cx={13}
					cy={37}
					fill="var(--m1)"
					rx={4}
					ry={3}
					stroke="var(--m3)"
					strokeWidth={1}
				/>
				<ellipse
					cx={25}
					cy={37}
					fill="var(--m1)"
					rx={4}
					ry={3}
					stroke="var(--m3)"
					strokeWidth={1}
				/>
				<circle cx={14.5} cy={28.5} fill="var(--m3)" r={2.6} />
				<circle cx={25.5} cy={28.5} fill="var(--m3)" r={2.6} />
				<circle
					cx={15.6}
					cy={27.2}
					fill="color-mix(in srgb, var(--m3) 12%, white 88%)"
					r={0.9}
				/>
				<circle
					cx={26.6}
					cy={27.2}
					fill="color-mix(in srgb, var(--m3) 12%, white 88%)"
					r={0.9}
				/>
				<ellipse
					cx={19}
					cy={34}
					fill="var(--m2)"
					rx={2.6}
					ry={2}
					stroke="var(--m3)"
					strokeWidth={0.7}
				/>
				<ellipse
					cx={9}
					cy={32.5}
					fill="var(--m3)"
					fillOpacity={0.22}
					rx={3.6}
					ry={2.6}
				/>
				<ellipse
					cx={29}
					cy={32.5}
					fill="var(--m3)"
					fillOpacity={0.22}
					rx={3.6}
					ry={2.6}
				/>
			</>
		),
	},
	rainbow: {
		viewBox: "0 0 64 32",
		width: 64,
		height: 32,
		children: (
			<>
				<path d="M0 32 A32 32 0 0 1 64 32 Z" fill="var(--m1)" />
				<path d="M9 32 A23 23 0 0 1 55 32 Z" fill="var(--m2)" />
				<path d="M18 32 A14 14 0 0 1 46 32 Z" fill="var(--m3)" />
			</>
		),
	},
	unicorn: {
		viewBox: "0 0 46 50",
		width: 46,
		height: 50,
		children: (
			<>
				<rect
					fill="var(--m1)"
					height={10}
					rx={5}
					stroke="var(--m3)"
					strokeWidth={1.3}
					width={16}
					x={15}
					y={40}
				/>
				<ellipse
					cx={17}
					cy={44}
					fill="color-mix(in srgb, var(--m1) 82%, black 18%)"
					fillOpacity={0.5}
					rx={6}
					ry={4}
				/>
				<circle
					cx={23}
					cy={23}
					fill="var(--m1)"
					r={14}
					stroke="var(--m3)"
					strokeWidth={1.4}
				/>
				<ellipse
					cx={17}
					cy={16}
					fill="color-mix(in srgb, var(--m1) 65%, white 35%)"
					fillOpacity={0.75}
					rx={5}
					ry={3.5}
					transform="rotate(-15 17 16)"
				/>
				<circle cx={17} cy={10} fill="var(--m2)" r={3.5} />
				<circle cx={27} cy={9} fill="var(--m2)" r={3.2} />
				<path
					d="M13 12 Q10 4 15 5 Q17 11 13 12 Z"
					fill="var(--m1)"
					stroke="var(--m3)"
					strokeWidth={1}
				/>
				<path
					d="M33 12 Q36 4 31 5 Q29 11 33 12 Z"
					fill="var(--m1)"
					stroke="var(--m3)"
					strokeWidth={1}
				/>
				<path
					d="M14 11 Q12 6 15 7 Q16 10 14 11 Z"
					fill="var(--m2)"
					fillOpacity={0.8}
				/>
				<path
					d="M32 11 Q34 6 31 7 Q30 10 32 11 Z"
					fill="var(--m2)"
					fillOpacity={0.8}
				/>
				<path d="M21 2 Q19 8 23 12 Q25 6 21 2 Z" fill="var(--m3)" />
				<path
					d="M21.5 3 Q20.5 8 22.5 11 Q23 6 21.5 3 Z"
					fill="color-mix(in srgb, var(--m3) 55%, white 45%)"
					fillOpacity={0.8}
				/>
				<ellipse cx={23} cy={31} fill="var(--m2)" rx={8} ry={6.5} />
				<circle cx={18} cy={23} fill="var(--m3)" r={3} />
				<circle cx={28} cy={23} fill="var(--m3)" r={3} />
				<circle
					cx={19.3}
					cy={21.5}
					fill="color-mix(in srgb, var(--m3) 12%, white 88%)"
					r={1.1}
				/>
				<circle
					cx={29.3}
					cy={21.5}
					fill="color-mix(in srgb, var(--m3) 12%, white 88%)"
					r={1.1}
				/>
				<ellipse
					cx={13}
					cy={28}
					fill="var(--m3)"
					fillOpacity={0.22}
					rx={3.5}
					ry={2.5}
				/>
				<ellipse
					cx={33}
					cy={28}
					fill="var(--m3)"
					fillOpacity={0.22}
					rx={3.5}
					ry={2.5}
				/>
			</>
		),
	},
	star: {
		viewBox: "0 0 10 10",
		width: 10,
		height: 10,
		children: (
			<path
				d="M5 0 C5.5 3 7 4.5 10 5 C7 5.5 5.5 7 5 10 C4.5 7 3 5.5 0 5 C3 4.5 4.5 3 5 0 Z"
				fill="var(--m1)"
			/>
		),
	},
	tree: {
		viewBox: "0 0 34 52",
		width: 34,
		height: 52,
		children: (
			<>
				<rect fill="var(--m2)" height={14} rx={2} width={8} x={13} y={38} />
				<circle cx={17} cy={25} fill="var(--m1)" r={17} />
				<circle cx={17} cy={17} fill="var(--m1)" r={13} />
				<circle cx={17} cy={9} fill="var(--m1)" r={9} />
			</>
		),
	},
	fox: {
		viewBox: "0 0 42 40",
		width: 42,
		height: 40,
		children: (
			<>
				<path d="M2 16 Q3 4 9 1 Q15 4 16 16 Z" fill="var(--m1)" />
				<path d="M6 15 Q6.5 8 9 6 Q11.5 8 12 15 Z" fill="var(--m2)" />
				<path d="M26 16 Q27 4 33 1 Q39 4 40 16 Z" fill="var(--m1)" />
				<path d="M30 15 Q30.5 8 33 6 Q35.5 8 36 15 Z" fill="var(--m2)" />
				<circle cx={21} cy={23} fill="var(--m1)" r={17} />
				<ellipse cx={21} cy={28} fill="var(--m2)" rx={8} ry={6} />
				<circle cx={15} cy={19.5} fill="var(--m3)" r={2} />
				<circle cx={27} cy={19.5} fill="var(--m3)" r={2} />
				<ellipse cx={21} cy={25} fill="var(--m3)" rx={2} ry={1.5} />
				<ellipse
					cx={8}
					cy={27}
					fill="var(--m3)"
					fillOpacity={0.22}
					rx={3.5}
					ry={2.5}
				/>
				<ellipse
					cx={34}
					cy={27}
					fill="var(--m3)"
					fillOpacity={0.22}
					rx={3.5}
					ry={2.5}
				/>
			</>
		),
	},
	duck: {
		viewBox: "0 0 38 34",
		width: 38,
		height: 34,
		children: (
			<>
				<ellipse
					cx={17}
					cy={23}
					fill="var(--m1)"
					rx={15}
					ry={9.3}
					stroke="var(--m3)"
					strokeWidth={1.3}
				/>
				<circle
					cx={26}
					cy={11}
					fill="var(--m1)"
					r={8.5}
					stroke="var(--m3)"
					strokeWidth={1.2}
				/>
				<path
					d="M32 10 L38 12 L32 15 Z"
					fill="var(--m2)"
					stroke="var(--m3)"
					strokeWidth={0.8}
				/>
				<ellipse
					cx={12}
					cy={23}
					fill="color-mix(in srgb, var(--m1) 82%, black 18%)"
					fillOpacity={0.5}
					rx={8}
					ry={4.3}
				/>
				<ellipse
					cx={13}
					cy={15.5}
					fill="color-mix(in srgb, var(--m1) 65%, white 35%)"
					fillOpacity={0.8}
					rx={7}
					ry={2.1}
					transform="rotate(-12 13 15.5)"
				/>
				<circle cx={28} cy={9} fill="var(--m3)" r={2.6} />
				<circle
					cx={29.1}
					cy={7.7}
					fill="color-mix(in srgb, var(--m3) 12%, white 88%)"
					r={0.9}
				/>
				<ellipse
					cx={21}
					cy={12.5}
					fill="var(--m3)"
					fillOpacity={0.22}
					rx={3}
					ry={2}
				/>
			</>
		),
	},
	boat: {
		viewBox: "0 0 48 40",
		width: 48,
		height: 40,
		children: (
			<>
				<path
					d="M2 27 L46 27 Q46 40 32 40 L16 40 Q2 40 2 27 Z"
					fill="var(--m1)"
				/>
				<rect fill="var(--m3)" height={25} width={2} x={23} y={3} />
				<path d="M24 5 Q41 14 24 24 Z" fill="var(--m2)" />
			</>
		),
	},
	elephant: {
		viewBox: "0 0 46 42",
		width: 46,
		height: 42,
		children: (
			<>
				<ellipse
					cx={23}
					cy={35}
					fill="var(--m1)"
					rx={14}
					ry={7}
					stroke="var(--m3)"
					strokeWidth={1.3}
				/>
				<path
					d="M11 32 Q7 31 8 35 Q9 37 12 35 Z"
					fill="var(--m1)"
					stroke="var(--m3)"
					strokeWidth={0.8}
				/>
				<ellipse
					cx={23}
					cy={38}
					fill="color-mix(in srgb, var(--m1) 80%, black 20%)"
					fillOpacity={0.5}
					rx={11}
					ry={4}
				/>
				<path
					d="M15 5 Q4 3 2 15 Q1 25 12 26 Q17 24 15 14 Q16 8 15 5 Z"
					fill="var(--m2)"
					stroke="var(--m3)"
					strokeWidth={1.1}
				/>
				<path
					d="M31 5 Q42 3 44 15 Q45 25 34 26 Q29 24 31 14 Q30 8 31 5 Z"
					fill="var(--m2)"
					stroke="var(--m3)"
					strokeWidth={1.1}
				/>
				<circle
					cx={23}
					cy={17}
					fill="var(--m1)"
					r={12}
					stroke="var(--m3)"
					strokeWidth={1.4}
				/>
				<ellipse
					cx={19}
					cy={11}
					fill="color-mix(in srgb, var(--m1) 65%, white 35%)"
					fillOpacity={0.75}
					rx={5}
					ry={3.5}
					transform="rotate(-15 19 11)"
				/>
				<path
					d="M20 26 Q18 33 21 37 Q24 39 26 36 Q23 35 22 31 Q23 28 20 26 Z"
					fill="var(--m1)"
					stroke="var(--m3)"
					strokeWidth={1.2}
				/>
				<path
					d="M20 3 Q19 -1 21 1 Q21 4 20 3 Z"
					fill="var(--m1)"
					stroke="var(--m3)"
					strokeWidth={0.6}
				/>
				<path
					d="M23 2 Q23 -2 25 0 Q24 3 23 2 Z"
					fill="var(--m1)"
					stroke="var(--m3)"
					strokeWidth={0.6}
				/>
				<circle cx={18} cy={15} fill="var(--m3)" r={2.2} />
				<circle cx={28} cy={15} fill="var(--m3)" r={2.2} />
				<circle
					cx={19}
					cy={14}
					fill="color-mix(in srgb, var(--m3) 12%, white 88%)"
					r={0.8}
				/>
				<circle
					cx={29}
					cy={14}
					fill="color-mix(in srgb, var(--m3) 12%, white 88%)"
					r={0.8}
				/>
				<ellipse
					cx={15}
					cy={19}
					fill="var(--m3)"
					fillOpacity={0.22}
					rx={2.6}
					ry={2}
				/>
				<ellipse
					cx={31}
					cy={19}
					fill="var(--m3)"
					fillOpacity={0.22}
					rx={2.6}
					ry={2}
				/>
			</>
		),
	},
	balloon: {
		viewBox: "0 0 20 36",
		width: 20,
		height: 36,
		children: (
			<>
				<ellipse cx={10} cy={12} fill="var(--m1)" rx={10} ry={12} />
				<path d="M8 24 L12 24 L10 27 Z" fill="var(--m1)" />
				<rect fill="var(--m3)" height={11} width={1} x={9.5} y={25} />
			</>
		),
	},
	moon: {
		viewBox: "0 0 26 26",
		width: 26,
		height: 26,
		children: (
			<>
				<path
					d="M22.75 13.86A9.75 9.75 0 1 1 12.14 3.25 7.58 7.58 0 0 0 22.75 13.86Z"
					fill="var(--m1)"
					stroke="var(--m3)"
					strokeWidth={1.2}
				/>
				<ellipse
					cx={8}
					cy={6}
					fill="color-mix(in srgb, var(--m1) 65%, white 35%)"
					fillOpacity={0.7}
					rx={3}
					ry={2}
					transform="rotate(-20 8 6)"
				/>
				<ellipse
					cx={9}
					cy={23}
					fill="color-mix(in srgb, var(--m1) 82%, black 18%)"
					fillOpacity={0.5}
					rx={3}
					ry={2.2}
				/>
				<path
					d="M6 11 Q8 9.3 10 11 Q8 12.3 6 11 Z"
					fill="var(--m3)"
					fillOpacity={0.85}
				/>
				<path
					d="M6 16 Q8 14.3 10 16 Q8 17.3 6 16 Z"
					fill="var(--m3)"
					fillOpacity={0.85}
				/>
				<path
					d="M7 19.5 Q8.5 20.8 10 19.5 Q8.5 20.2 7 19.5 Z"
					fill="var(--m3)"
					fillOpacity={0.7}
				/>
				<ellipse
					cx={6.5}
					cy={15.5}
					fill="var(--m3)"
					fillOpacity={0.2}
					rx={1.8}
					ry={1.3}
				/>
			</>
		),
	},
	leaf: {
		viewBox: "0 0 22 34",
		width: 22,
		height: 34,
		children: (
			<>
				<path
					d="M11 0 C20 4 20 26 11 34 C2 26 2 4 11 0 Z"
					fill="var(--m1)"
					transform="rotate(-8 11 17)"
				/>
				<rect
					fill="var(--m3)"
					fillOpacity={0.4}
					height={24}
					transform="rotate(-8 11 17)"
					width={1}
					x={10}
					y={5}
				/>
			</>
		),
	},
	dino: {
		viewBox: "0 0 46 38",
		width: 46,
		height: 38,
		children: (
			<>
				<path
					d="M3 24 Q0 20 2 28 Q4 31 8 27 Z"
					fill="var(--m1)"
					stroke="var(--m3)"
					strokeWidth={1}
				/>
				<ellipse
					cx={16}
					cy={27}
					fill="var(--m1)"
					rx={13}
					ry={10}
					stroke="var(--m3)"
					strokeWidth={1.3}
				/>
				<rect
					fill="var(--m1)"
					height={4}
					rx={2}
					stroke="var(--m3)"
					strokeWidth={1}
					width={5}
					x={10}
					y={34}
				/>
				<rect
					fill="var(--m1)"
					height={3}
					rx={1.6}
					stroke="var(--m3)"
					strokeWidth={1}
					width={5}
					x={19}
					y={35}
				/>
				<circle
					cx={32}
					cy={16}
					fill="var(--m1)"
					r={13}
					stroke="var(--m3)"
					strokeWidth={1.3}
				/>
				<ellipse
					cx={17}
					cy={33}
					fill="color-mix(in srgb, var(--m1) 80%, black 20%)"
					fillOpacity={0.55}
					rx={10}
					ry={4.5}
				/>
				<ellipse
					cx={27}
					cy={9}
					fill="color-mix(in srgb, var(--m1) 65%, white 35%)"
					fillOpacity={0.75}
					rx={5}
					ry={3.4}
					transform="rotate(-15 27 9)"
				/>
				<path
					d="M21 10 Q21 6 24.5 6.5 Q24 10 21 10 Z"
					fill="var(--m2)"
					stroke="var(--m3)"
					strokeWidth={0.8}
				/>
				<path
					d="M26 6.5 Q26.5 2 30 3 Q29.5 7 26 6.5 Z"
					fill="var(--m2)"
					stroke="var(--m3)"
					strokeWidth={0.8}
				/>
				<path
					d="M31 5 Q32 2 35 3.5 Q34 7 31 5 Z"
					fill="var(--m2)"
					stroke="var(--m3)"
					strokeWidth={0.8}
				/>
				<circle cx={35} cy={14} fill="var(--m3)" r={3.6} />
				<circle
					cx={36.3}
					cy={12.6}
					fill="color-mix(in srgb, var(--m3) 12%, white 88%)"
					r={1.3}
				/>
				<circle
					cx={33.6}
					cy={16}
					fill="color-mix(in srgb, var(--m3) 8%, white 92%)"
					r={0.6}
				/>
				<ellipse
					cx={27}
					cy={20}
					fill="var(--m3)"
					fillOpacity={0.22}
					rx={3}
					ry={2.2}
				/>
			</>
		),
	},
};
