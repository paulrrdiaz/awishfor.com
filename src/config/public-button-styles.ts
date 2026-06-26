export type PublicButtonStylePreset = {
	id: string;
	label: string;
	borderRadius: string;
	borderWidth: string;
	fontWeight: string;
};

const rounded: PublicButtonStylePreset = {
	id: "rounded",
	label: "Rounded",
	borderRadius: "0.375rem",
	borderWidth: "0",
	fontWeight: "500",
};

const buttonStyles: Record<string, PublicButtonStylePreset> = {
	rounded,
	pill: {
		id: "pill",
		label: "Pill",
		borderRadius: "9999px",
		borderWidth: "0",
		fontWeight: "500",
	},
	flat: {
		id: "flat",
		label: "Flat",
		borderRadius: "0",
		borderWidth: "0",
		fontWeight: "600",
	},
	outlined: {
		id: "outlined",
		label: "Outlined",
		borderRadius: "0.375rem",
		borderWidth: "1.5px",
		fontWeight: "500",
	},
};

export function resolveButtonStyle(
	id: string | null | undefined,
): PublicButtonStylePreset {
	return buttonStyles[id ?? ""] ?? rounded;
}

export function getAllButtonStyles(): PublicButtonStylePreset[] {
	return Object.values(buttonStyles);
}
