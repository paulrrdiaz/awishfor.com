export type PublicButtonStylePreset = {
	id: string;
	label: string;
	borderRadius: string;
	borderWidth: string;
	fontWeight: string;
};

const rounded: PublicButtonStylePreset = {
	id: "rounded",
	label: "Redondeado",
	borderRadius: "0.75rem",
	borderWidth: "0",
	fontWeight: "500",
};

const buttonStyles: Record<string, PublicButtonStylePreset> = {
	pill: {
		id: "pill",
		label: "Píldora",
		borderRadius: "9999px",
		borderWidth: "0",
		fontWeight: "500",
	},
	rounded,
};

export function resolveButtonStyle(
	id: string | null | undefined,
): PublicButtonStylePreset {
	return buttonStyles[id ?? ""] ?? rounded;
}

export function getAllButtonStyles(): PublicButtonStylePreset[] {
	return Object.values(buttonStyles);
}
