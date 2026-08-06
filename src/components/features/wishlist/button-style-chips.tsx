"use client";

import type { PublicButtonStylePreset } from "@/config/public-button-styles";
import { cn } from "@/lib/utils";

type Props = {
	options: PublicButtonStylePreset[];
	selected: string | null;
	onSelect: (id: string) => void;
	/**
	 * "compact" (default) is the dashboard design-editor chips, each styled
	 * in its own shape. "inline" matches the wizard's Theme step: uniform
	 * cards with a small preview bar, like the design's swatch cards.
	 */
	variant?: "compact" | "inline";
};

export function ButtonStyleChips({
	options,
	selected,
	onSelect,
	variant = "compact",
}: Props) {
	if (variant === "inline") {
		return (
			<div className="flex gap-2">
				{options.map((style) => {
					const isSelected = selected === style.id;
					const isOutline = style.variant === "outline";
					return (
						<button
							aria-pressed={isSelected}
							className={cn(
								"flex-1 rounded-[14px] border bg-card p-3 text-center transition-all",
								isSelected
									? "border-primary ring-1 ring-primary"
									: "border-border",
							)}
							key={style.id}
							onClick={() => onSelect(style.id)}
							type="button"
						>
							<div
								className={cn(
									"mb-1.5 h-5 w-full",
									isOutline
										? "border-2 border-foreground bg-transparent"
										: "bg-foreground",
								)}
								style={{ borderRadius: style.borderRadius }}
							/>
							<div className="text-[10.5px] text-foreground">{style.label}</div>
						</button>
					);
				})}
			</div>
		);
	}

	return (
		<div className="flex flex-wrap gap-2.5">
			{options.map((style) => {
				const isSelected = selected === style.id;
				const isOutline = style.variant === "outline";
				return (
					<button
						aria-pressed={isSelected}
						className={cn(
							"px-4 py-2 font-medium text-sm transition-all",
							isSelected &&
								"ring-2 ring-ring ring-offset-2 ring-offset-background",
							isOutline
								? "border-primary bg-transparent text-primary"
								: "border-transparent bg-primary text-primary-foreground",
						)}
						key={style.id}
						onClick={() => onSelect(style.id)}
						style={{
							borderRadius: style.borderRadius,
							borderWidth: isOutline ? style.borderWidth : 0,
							borderStyle: "solid",
							fontWeight: style.fontWeight,
						}}
						type="button"
					>
						{style.label}
					</button>
				);
			})}
		</div>
	);
}
