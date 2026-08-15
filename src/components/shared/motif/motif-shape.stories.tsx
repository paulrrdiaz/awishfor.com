import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { MotifColors } from "@/config/motifs";
import { MOTIF_PRESETS } from "@/config/motifs";
import { MotifShape } from "./motif-shape";

const meta = {
	component: MotifShape,
	title: "Shared/Motif/MotifShape",
} satisfies Meta<typeof MotifShape>;

export default meta;
type Story = StoryObj<typeof meta>;

const THEMED_PALETTE = { m1: "#8FBEE0", m2: "#DCEAF6", m3: "#33425C" };

function Grid({
	surface,
	palette,
}: {
	surface: "base" | "primary";
	palette: "fixed" | "themed";
}) {
	return (
		<div
			style={{
				background: surface === "primary" ? "#8FBEE0" : "#fff",
				display: "grid",
				gap: 24,
				gridTemplateColumns: "repeat(4, 1fr)",
				padding: 32,
			}}
		>
			{MOTIF_PRESETS.flatMap((motif) =>
				motif.shapes.map((shape, index) => {
					const isSecondary = index === 1;
					const colors =
						palette === "fixed"
							? isSecondary
								? { ...motif.colors, ...motif.secondaryColors }
								: motif.colors
							: THEMED_PALETTE;
					return (
						<div
							key={`${motif.id}-${shape}`}
							style={
								{
									"--motif-m3-inverted": motif.m3Inverted,
									alignItems: "center",
									display: "flex",
									height: 80,
									justifyContent: "center",
									// biome-ignore lint/suspicious/noExplicitAny: CSS custom property
								} as any
							}
						>
							<MotifShape colors={colors} shape={shape} surface={surface} />
						</div>
					);
				}),
			)}
		</div>
	);
}

export const BaseFixed: Story = {
	args: { shape: "bear" },
	render: () => <Grid palette="fixed" surface="base" />,
};

export const BaseThemed: Story = {
	args: { shape: "bear" },
	render: () => <Grid palette="themed" surface="base" />,
};

export const PrimaryFixed: Story = {
	args: { shape: "bear" },
	render: () => <Grid palette="fixed" surface="primary" />,
};

export const PrimaryThemed: Story = {
	args: { shape: "bear" },
	render: () => <Grid palette="themed" surface="primary" />,
};

const PRIMARY_SCALES = [1.5, 0.7, 0.5, 0.4, 0.32, 0.28];
const SECONDARY_SCALES = [1.3, 0.7, 0.4, 0.24, 0.18];

const BOW_BLOOM = MOTIF_PRESETS.find((motif) => motif.id === "bow-bloom");

function ScaleLadder({
	shape,
	scales,
	colors,
	surface,
}: {
	shape: "bow" | "bloom";
	scales: number[];
	colors?: Partial<MotifColors>;
	surface: "base" | "primary";
}) {
	return (
		<div
			style={{
				alignItems: "flex-end",
				background: surface === "primary" ? "#8FBEE0" : "#fff",
				display: "flex",
				gap: 24,
				padding: 32,
			}}
		>
			{scales.map((scale) => (
				<div
					key={scale}
					style={
						{
							"--motif-m3-inverted": BOW_BLOOM?.m3Inverted,
							alignItems: "center",
							display: "flex",
							flexDirection: "column",
							gap: 8,
							// biome-ignore lint/suspicious/noExplicitAny: CSS custom property
						} as any
					}
				>
					<MotifShape
						colors={colors}
						scale={scale}
						shape={shape}
						surface={surface}
					/>
					<span style={{ color: "#888", fontSize: 11 }}>{scale}</span>
				</div>
			))}
		</div>
	);
}

const BOW_BLOOM_SECONDARY_COLORS: Partial<MotifColors> | undefined = BOW_BLOOM
	? { ...BOW_BLOOM.colors, ...BOW_BLOOM.secondaryColors }
	: undefined;

export const BowBloomScaleLadderBase: Story = {
	args: { shape: "bow" },
	render: () => (
		<div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
			<ScaleLadder
				colors={BOW_BLOOM?.colors}
				scales={PRIMARY_SCALES}
				shape="bow"
				surface="base"
			/>
			<ScaleLadder
				colors={BOW_BLOOM_SECONDARY_COLORS}
				scales={SECONDARY_SCALES}
				shape="bloom"
				surface="base"
			/>
		</div>
	),
};

export const BowBloomScaleLadderPrimary: Story = {
	args: { shape: "bow" },
	render: () => (
		<div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
			<ScaleLadder scales={PRIMARY_SCALES} shape="bow" surface="primary" />
			<ScaleLadder scales={SECONDARY_SCALES} shape="bloom" surface="primary" />
		</div>
	),
};
