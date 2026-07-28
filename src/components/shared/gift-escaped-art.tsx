"use client";

import type { CSSProperties } from "react";
import { useRef } from "react";
import { useEscapedGiftMotion } from "@/lib/gsap/use-escaped-gift-motion";
import { cn } from "@/lib/utils";

type ConfettiColorVar = "--gb-c1" | "--gb-c2" | "--gb-c3";

type ConfettiParticle = {
	left: string;
	top: string;
	size: number;
	shape: "circle" | "square";
	colorVar: ConfettiColorVar;
	duration: number;
	delay: number;
};

type SparkParticle = {
	left?: string;
	right?: string;
	top?: string;
	bottom?: string;
	size: number;
	colorVar: ConfettiColorVar;
	delay: number;
};

/**
 * Fixed positions/sizes/timings so server and client renders match exactly —
 * no randomization, so hydration never sees a mismatch. Colors are CSS custom
 * property references (with sensible fallbacks) so each surface can tint the
 * particles via `confettiColors` without duplicating this layout data.
 */
const CONFETTI: ConfettiParticle[] = [
	{
		left: "7%",
		top: "8%",
		size: 10,
		shape: "square",
		colorVar: "--gb-c1",
		duration: 7,
		delay: 0,
	},
	{
		left: "23%",
		top: "48%",
		size: 8,
		shape: "circle",
		colorVar: "--gb-c2",
		duration: 5.6,
		delay: 1.1,
	},
	{
		left: "69%",
		top: "20%",
		size: 9,
		shape: "square",
		colorVar: "--gb-c3",
		duration: 6.4,
		delay: 0.6,
	},
	{
		left: "88%",
		top: "62%",
		size: 11,
		shape: "circle",
		colorVar: "--gb-c1",
		duration: 7.6,
		delay: 2,
	},
	{
		left: "51%",
		top: "36%",
		size: 7,
		shape: "square",
		colorVar: "--gb-c2",
		duration: 5.8,
		delay: 2.7,
	},
	{
		left: "39%",
		top: "72%",
		size: 9,
		shape: "circle",
		colorVar: "--gb-c3",
		duration: 6.9,
		delay: 3.5,
	},
];

const SPARKLES: SparkParticle[] = [
	{ left: "13%", top: "26%", size: 13, colorVar: "--gb-c1", delay: 0.4 },
	{ right: "11%", top: "20%", size: 15, colorVar: "--gb-c2", delay: 1.6 },
	{ right: "25%", bottom: "14%", size: 10, colorVar: "--gb-c3", delay: 2.4 },
];

const CONFETTI_COLOR_FALLBACK: Record<ConfettiColorVar, string> = {
	"--gb-c1": "var(--primary)",
	"--gb-c2": "#F4C84A",
	"--gb-c3": "var(--accent-foreground)",
};

const CONTAINER_SIZE: Record<"public" | "marketing", string> = {
	public: "h-[190px] w-[320px] md:h-[236px] md:w-[460px]",
	marketing: "h-[196px] w-[320px] md:h-[270px] md:w-[560px]",
};

const NUMERAL_SIZE: Record<"public" | "marketing", string> = {
	public: "text-[108px] md:text-[152px]",
	marketing: "text-[112px] md:text-[176px]",
};

const BOX_SCALE: Record<"public" | "marketing", string> = {
	public: "scale-[0.82] md:scale-100",
	marketing: "scale-[0.82] md:scale-[1.08]",
};

const SMALL_CONTAINER = "h-[120px] w-[220px]";
const SMALL_NUMERAL = "text-[56px]";
const SMALL_BOX_SCALE = "scale-[0.56]";

type GiftBoxVars = CSSProperties & {
	"--gb-fill"?: string;
	"--gb-ribbon"?: string;
	"--gb-c1"?: string;
	"--gb-c2"?: string;
	"--gb-c3"?: string;
};

type Props = {
	/** Governs the responsive numeral/box scale pair (§11: public 108→152px, marketing 112→176px). */
	variant?: "public" | "marketing";
	/** Non-responsive smaller rendering for the dashboard boundary. */
	size?: "default" | "sm";
	fillColor?: string;
	ribbonColor?: string;
	confettiColors?: readonly [string, string, string];
	className?: string;
};

export function GiftEscapedArt({
	variant = "public",
	size = "default",
	fillColor,
	ribbonColor,
	confettiColors,
	className,
}: Props) {
	const rootRef = useRef<HTMLDivElement>(null);
	useEscapedGiftMotion(rootRef);

	const isSmall = size === "sm";
	const style: GiftBoxVars = {
		"--gb-fill": fillColor,
		"--gb-ribbon": ribbonColor,
		"--gb-c1": confettiColors?.[0],
		"--gb-c2": confettiColors?.[1],
		"--gb-c3": confettiColors?.[2],
	};

	return (
		<div
			aria-hidden="true"
			className={cn(
				"relative mx-auto",
				isSmall ? SMALL_CONTAINER : CONTAINER_SIZE[variant],
				className,
			)}
			ref={rootRef}
			style={style}
		>
			{CONFETTI.map((conf) => (
				<span
					className={cn(
						"absolute",
						conf.shape === "circle" ? "rounded-full" : "rounded-[2px]",
					)}
					data-conf
					data-conf-delay={conf.delay}
					data-conf-duration={conf.duration}
					key={`${conf.left}-${conf.top}`}
					style={{
						left: conf.left,
						top: conf.top,
						width: conf.size,
						height: conf.size,
						backgroundColor: `var(${conf.colorVar}, ${CONFETTI_COLOR_FALLBACK[conf.colorVar]})`,
					}}
				/>
			))}
			{SPARKLES.map((spark) => (
				<span
					className="absolute rotate-45"
					data-spark
					data-spark-delay={spark.delay}
					key={`${spark.left ?? spark.right}-${spark.top ?? spark.bottom}`}
					style={{
						left: spark.left,
						right: spark.right,
						top: spark.top,
						bottom: spark.bottom,
						width: spark.size,
						height: spark.size,
						backgroundColor: `var(${spark.colorVar}, ${CONFETTI_COLOR_FALLBACK[spark.colorVar]})`,
					}}
				/>
			))}
			<div className="absolute inset-0 flex items-center justify-center gap-3">
				<span
					className={cn(
						"font-heading font-semibold text-foreground leading-none",
						isSmall ? SMALL_NUMERAL : NUMERAL_SIZE[variant],
					)}
				>
					4
				</span>
				<div
					className={cn(
						"relative",
						isSmall ? SMALL_BOX_SCALE : BOX_SCALE[variant],
					)}
					data-gb-float
				>
					<div className="relative mx-auto w-[104px]">
						<div className="h-[74px] w-[104px] rounded-[9px] bg-[var(--gb-fill,var(--primary))] shadow-[0_16px_34px_rgba(20,30,50,.2)]" />
						<div className="absolute top-[-15px] left-[-8px] h-[23px] w-[120px] rounded-lg bg-[var(--gb-fill,var(--primary))] shadow-[0_5px_12px_rgba(20,30,50,.14)] brightness-90" />
						<div className="absolute top-[-15px] left-[calc(50%-8px)] h-[89px] w-4 bg-[var(--gb-ribbon,#fff)] opacity-90" />
						<div className="absolute top-[-16px] left-1/2 z-[3] size-3 -translate-x-1/2 rounded-full bg-[var(--gb-ribbon,#fff)]" />
						<div className="absolute top-[-31px] left-1/2 z-[2] flex -translate-x-1/2 gap-px">
							<i
								className="h-[23px] w-[19px] rounded-[70%_30%_55%_45%] bg-[var(--gb-ribbon,#fff)] shadow-[0_2px_5px_rgba(20,30,50,.12)]"
								style={{ transform: "rotate(-16deg)" }}
							/>
							<i
								className="h-[23px] w-[19px] rounded-[30%_70%_45%_55%] bg-[var(--gb-ribbon,#fff)] shadow-[0_2px_5px_rgba(20,30,50,.12)]"
								style={{ transform: "rotate(16deg)" }}
							/>
						</div>
					</div>
					<svg
						aria-hidden="true"
						className="absolute top-[71px] left-1/2 -translate-x-1/2"
						data-gb-string
						fill="none"
						height="118"
						viewBox="0 0 70 118"
						width="70"
					>
						<path
							d="M35 2 C 10 28, 60 52, 30 78 C 12 96, 44 108, 34 118"
							stroke="var(--muted-foreground)"
							strokeDasharray="1 8"
							strokeLinecap="round"
							strokeWidth="2.4"
						/>
					</svg>
				</div>
				<span
					className={cn(
						"font-heading font-semibold text-foreground leading-none",
						isSmall ? SMALL_NUMERAL : NUMERAL_SIZE[variant],
					)}
				>
					4
				</span>
			</div>
		</div>
	);
}
