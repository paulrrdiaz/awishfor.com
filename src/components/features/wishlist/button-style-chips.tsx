"use client";

import type { PublicButtonStylePreset } from "@/config/public-button-styles";
import { cn } from "@/lib/utils";

type Props = {
	options: PublicButtonStylePreset[];
	selected: string | null;
	onSelect: (id: string) => void;
};

export function ButtonStyleChips({ options, selected, onSelect }: Props) {
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
