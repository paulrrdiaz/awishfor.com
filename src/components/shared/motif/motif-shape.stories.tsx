import type { Meta, StoryObj } from "@storybook/nextjs-vite";
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
