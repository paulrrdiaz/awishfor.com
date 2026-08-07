"use client";

import type { ThemePreset } from "@/config/public-themes";
import { cn } from "@/lib/utils";

type Props = {
	options: ThemePreset[];
	selected: string | null;
	onSelect: (id: string) => void;
	/**
	 * "compact" (default) is the dashboard design-editor sizing. "inline"
	 * matches the wizard's Theme step, where swatches fill the grid cell.
	 */
	variant?: "compact" | "inline";
};

export function ThemeSwatchPicker({
	options,
	selected,
	onSelect,
	variant = "compact",
}: Props) {
	const isInline = variant === "inline";
	return (
		<div className={cn("grid grid-cols-4 gap-2", !isInline && "gap-2.5")}>
			{options.map((theme) => {
				const isSelected = selected === theme.id;
				return (
					<button
						aria-label={theme.label}
						aria-pressed={isSelected}
						className={cn(
							"flex flex-col items-center transition-all hover:-translate-y-0.5",
							isInline ? "gap-1" : "gap-1.5 rounded-lg p-1.5",
							isSelected &&
								!isInline &&
								"ring-2 ring-primary ring-offset-2 ring-offset-background",
						)}
						key={theme.id}
						onClick={() => onSelect(theme.id)}
						type="button"
					>
						<span
							className={cn(
								"block rounded-full",
								isInline
									? cn(
											"aspect-square w-full",
											isSelected &&
												"ring-2 ring-primary ring-offset-2 ring-offset-background",
										)
									: "size-9 border border-border/60 shadow-sm",
							)}
							style={{
								background: `conic-gradient(${theme.preview.primary}, ${theme.preview.background})`,
							}}
						/>
						<span
							className={cn(
								"max-w-full text-muted-foreground",
								isInline ? "text-[9px]" : "truncate text-[10px]",
							)}
						>
							{theme.label}
						</span>
					</button>
				);
			})}
		</div>
	);
}
