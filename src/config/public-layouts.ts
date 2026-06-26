export type PublicLayoutPreset = {
	id: string;
	label: string;
	giftColumns: number;
	giftCardStyle: "card" | "row" | "minimal";
	showCategoryDividers: boolean;
};

const grid: PublicLayoutPreset = {
	id: "grid",
	label: "Grid",
	giftColumns: 3,
	giftCardStyle: "card",
	showCategoryDividers: true,
};

const layouts: Record<string, PublicLayoutPreset> = {
	grid,
	editorial: {
		id: "editorial",
		label: "Editorial",
		giftColumns: 2,
		giftCardStyle: "card",
		showCategoryDividers: true,
	},
	minimal: {
		id: "minimal",
		label: "Minimal",
		giftColumns: 1,
		giftCardStyle: "row",
		showCategoryDividers: false,
	},
};

export function resolveLayout(
	id: string | null | undefined,
): PublicLayoutPreset {
	return layouts[id ?? ""] ?? grid;
}
