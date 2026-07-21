"use client";

import type { ThemePreset } from "@/config/public-themes";
import { cn } from "@/lib/utils";

type Props = {
	options: ThemePreset[];
	selected: string | null;
	onSelect: (id: string) => void;
};

export function ThemeSwatchPicker({ options, selected, onSelect }: Props) {
	return (
		<div className="grid grid-cols-4 gap-2.5 sm:grid-cols-6">
			{options.map((theme) => {
				const isSelected = selected === theme.id;
				return (
					<button
						aria-label={theme.label}
						aria-pressed={isSelected}
						className={cn(
							"flex flex-col items-center gap-1.5 rounded-lg p-1.5 transition-all hover:-translate-y-0.5",
							isSelected &&
								"ring-2 ring-primary ring-offset-2 ring-offset-background",
						)}
						key={theme.id}
						onClick={() => onSelect(theme.id)}
						type="button"
					>
						<span
							className="block size-9 rounded-full border border-border/60 shadow-sm"
							style={{
								background: `linear-gradient(135deg, ${theme.preview.background} 50%, ${theme.preview.primary} 50%)`,
							}}
						/>
						<span className="max-w-full truncate text-[10px] text-muted-foreground">
							{theme.label}
						</span>
					</button>
				);
			})}
		</div>
	);
}
