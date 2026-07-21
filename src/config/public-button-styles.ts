export type PublicButtonStyleVariant = "solid" | "outline";

export type PublicButtonStylePreset = {
	id: string;
	label: string;
	borderRadius: string;
	borderWidth: string;
	fontWeight: string;
	variant: PublicButtonStyleVariant;
};

const pill: PublicButtonStylePreset = {
	id: "pill",
	label: "Píldora",
	borderRadius: "9999px",
	borderWidth: "0",
	fontWeight: "500",
	variant: "solid",
};

const rounded: PublicButtonStylePreset = {
	id: "rounded",
	label: "Redondeado",
	borderRadius: "0.75rem",
	borderWidth: "0",
	fontWeight: "500",
	variant: "solid",
};

const square: PublicButtonStylePreset = {
	id: "square",
	label: "Cuadrado",
	borderRadius: "0.25rem",
	borderWidth: "0",
	fontWeight: "600",
	variant: "solid",
};

const outline: PublicButtonStylePreset = {
	id: "outline",
	label: "Contorno",
	borderRadius: "9999px",
	borderWidth: "1.5px",
	fontWeight: "500",
	variant: "outline",
};

const buttonStyles: Record<string, PublicButtonStylePreset> = {
	pill,
	rounded,
	square,
	outline,
};

export function resolveButtonStyle(
	id: string | null | undefined,
): PublicButtonStylePreset {
	return buttonStyles[id ?? ""] ?? pill;
}

export function getAllButtonStyles(): PublicButtonStylePreset[] {
	return Object.values(buttonStyles);
}
