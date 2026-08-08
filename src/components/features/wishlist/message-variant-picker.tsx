"use client";

import type { ReactNode } from "react";
import type { PublicMessageVariantPreset } from "@/config/public-message-variants";
import { cn } from "@/lib/utils";

type Props = {
	options: PublicMessageVariantPreset[];
	selected: string;
	onSelect: (id: string) => void;
};

function Thumb({ children }: { children: ReactNode }) {
	return (
		<div className="flex h-12 w-full items-center justify-center overflow-hidden rounded-md bg-muted">
			{children}
		</div>
	);
}

/**
 * Keyed by variant id, shared across the countdown/welcome/thank-you
 * catalogs — ids never collide with a different meaning across catalogs
 * (e.g. `handwritten` gets the same rotated-note treatment in both).
 */
const VARIANT_THUMBNAILS: Record<string, ReactNode> = {
	"filled-pill": (
		<Thumb>
			<span className="inline-flex h-4 items-center gap-1 rounded-full bg-foreground/70 px-2">
				<span className="size-1 rounded-full bg-background" />
				<span className="h-1 w-6 rounded-full bg-background/70" />
			</span>
		</Thumb>
	),
	"outline-pill": (
		<Thumb>
			<span className="inline-flex h-4 items-center gap-1 rounded-full border border-foreground/40 bg-background px-2">
				<span className="size-1 rounded-full bg-foreground/50" />
				<span className="h-1 w-6 rounded-full bg-foreground/30" />
			</span>
		</Thumb>
	),
	"progress-bar": (
		<Thumb>
			<div className="w-3/4">
				<div className="h-1.5 w-full overflow-hidden rounded-full bg-foreground/15">
					<div className="h-full w-2/3 rounded-full bg-foreground/50" />
				</div>
			</div>
		</Thumb>
	),
	postcard: (
		<Thumb>
			<div className="h-8 w-10 rounded-[2px] border border-foreground/30 border-dashed" />
		</Thumb>
	),
	handwritten: (
		<Thumb>
			<div className="h-8 w-10 -rotate-3 rounded-[2px] bg-background shadow-sm" />
		</Thumb>
	),
	avatars: (
		<Thumb>
			<div className="flex -space-x-1.5">
				<span className="size-4 rounded-full border border-background bg-foreground/40" />
				<span className="size-4 rounded-full border border-background bg-foreground/25" />
			</div>
		</Thumb>
	),
	spotlight: (
		<Thumb>
			<div className="flex h-8 w-10 items-center justify-center rounded-[2px] bg-foreground/80">
				<span className="h-1 w-5 rounded-full bg-background/70" />
			</div>
		</Thumb>
	),
	"social-proof": (
		<Thumb>
			<div className="flex -space-x-1.5">
				<span className="size-4 rounded-full border border-background bg-foreground/40" />
				<span className="size-4 rounded-full border border-background bg-foreground/25" />
				<span className="flex size-4 items-center justify-center rounded-full border border-background bg-foreground/15 text-[6px]">
					+2
				</span>
			</div>
		</Thumb>
	),
};

/**
 * Shared picker for the countdown/welcome/thank-you message variants,
 * following the `ThemeSwatchPicker` / `LayoutPicker` pattern: an inline grid
 * of options with a small visual thumbnail per choice.
 */
export function MessageVariantPicker({ options, selected, onSelect }: Props) {
	return (
		<div className="grid grid-cols-3 gap-2">
			{options.map((option) => {
				const isSelected = selected === option.id;
				return (
					<button
						aria-pressed={isSelected}
						className={cn(
							"rounded-xl border-2 bg-card p-2 text-left transition-all hover:-translate-y-0.5 hover:shadow-sm",
							isSelected
								? "border-primary shadow-sm ring-1 ring-primary/20"
								: "border-border",
						)}
						key={option.id}
						onClick={() => onSelect(option.id)}
						type="button"
					>
						{VARIANT_THUMBNAILS[option.id]}
						<span className="mt-1.5 block font-medium text-foreground text-xs">
							{option.label}
						</span>
					</button>
				);
			})}
		</div>
	);
}
