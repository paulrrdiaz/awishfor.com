"use client";

import type { ReactNode } from "react";
import type { PublicLayoutPreset } from "@/config/public-layouts";
import { cn } from "@/lib/utils";

type Props = {
	options: PublicLayoutPreset[];
	selected: string | null;
	onSelect: (id: string) => void;
};

function Thumb({ children }: { children: ReactNode }) {
	return (
		<div className="relative h-16 w-full overflow-hidden rounded-md bg-muted">
			{children}
		</div>
	);
}

function Block({ className }: { className?: string }) {
	return (
		<div className={cn("absolute rounded-sm bg-foreground/25", className)} />
	);
}

const LAYOUT_THUMBNAILS: Record<string, ReactNode> = {
	"hero-cinematic": (
		<Thumb>
			<Block className="inset-0" />
			<div className="absolute inset-x-3 bottom-2.5 h-1.5 rounded-full bg-background/80" />
		</Thumb>
	),
	"split-image-right": (
		<Thumb>
			<Block className="top-2 right-2 bottom-2 left-[58%]" />
			<div className="absolute top-3 left-2.5 h-1.5 w-8 rounded-full bg-foreground/25" />
			<div className="absolute top-6 left-2.5 h-1.5 w-6 rounded-full bg-foreground/15" />
		</Thumb>
	),
	"arch-split": (
		<Thumb>
			<div className="absolute top-3 left-2.5 h-1.5 w-8 rounded-full bg-foreground/25" />
			<div className="absolute top-6 left-2.5 h-1.5 w-6 rounded-full bg-foreground/15" />
			<div className="absolute top-2 right-3 bottom-2 w-6 rounded-t-full bg-foreground/25" />
		</Thumb>
	),
	"collage-staggered": (
		<Thumb>
			<Block className="top-4 bottom-2 left-2 w-4" />
			<Block className="top-2 bottom-2 left-[38%] w-5" />
			<Block className="top-4 right-2 bottom-2 w-4" />
		</Thumb>
	),
	"magazine-editorial": (
		<Thumb>
			<div className="absolute top-2 bottom-6 left-3 w-px bg-foreground/25" />
			<div className="absolute top-2.5 left-5 font-bold text-[20px] text-foreground/15 leading-none">
				A
			</div>
			<div className="absolute inset-x-2 bottom-2 flex gap-1">
				<div className="h-4 flex-1 rounded-[2px] bg-foreground/20" />
				<div className="h-4 flex-1 rounded-[2px] bg-foreground/20" />
				<div className="h-4 flex-1 rounded-[2px] bg-foreground/20" />
			</div>
		</Thumb>
	),
	"overlap-duo": (
		<Thumb>
			<Block className="top-2 left-2 h-8 w-7 rotate-[-6deg]" />
			<Block className="right-3 bottom-2 h-7 w-6 rotate-[6deg]" />
			<div className="absolute top-4 right-3 h-1.5 w-5 rounded-full bg-foreground/20" />
		</Thumb>
	),
	"arch-hero-party": (
		<Thumb>
			<div className="absolute top-1/2 left-[30%] size-9 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/25 blur-[3px]" />
			<div className="absolute top-2 left-4 h-9 w-6 rounded-t-full bg-foreground/25" />
			<div className="absolute top-4 right-3 h-1.5 w-8 rounded-full bg-foreground/20" />
		</Thumb>
	),
	"arch-trio": (
		<Thumb>
			<Block className="top-2 left-2 size-7 rounded-full" />
			<Block className="bottom-2 left-6 size-5 rounded-full" />
			<Block className="top-3 left-8 size-4 rounded-full" />
			<div className="absolute top-4 right-3 h-1.5 w-6 rounded-full bg-foreground/20" />
		</Thumb>
	),
	"wedding-formal": (
		<Thumb>
			<div className="absolute inset-x-3 top-3 h-px bg-foreground/20" />
			<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-semibold text-[15px] text-primary/70">
				A&B
			</div>
			<div className="absolute inset-x-3 bottom-3 h-px bg-foreground/20" />
		</Thumb>
	),
	"panoramic-band": (
		<Thumb>
			<Block className="top-1.5 right-1.5 left-1.5 h-8" />
			<div className="absolute right-3 bottom-2 left-3 h-4 rounded-sm bg-background shadow-sm" />
		</Thumb>
	),
	"carousel-hero": (
		<Thumb>
			<Block className="inset-0" />
			<div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
				<span className="size-1 rounded-full bg-background" />
				<span className="size-1 rounded-full bg-background/50" />
				<span className="size-1 rounded-full bg-background/50" />
			</div>
		</Thumb>
	),
	"diagonal-duo": (
		<Thumb>
			<div
				className="absolute inset-0"
				style={{
					background:
						"linear-gradient(135deg, var(--muted) 0% 46%, var(--foreground) 46% 100%)",
					opacity: 0.18,
				}}
			/>
			<Block className="top-3 left-3 size-5 rounded-full" />
			<Block className="right-3 bottom-2 h-6 w-5" />
		</Thumb>
	),
	"scrapbook-polaroids": (
		<Thumb>
			<div className="absolute top-3 left-4 h-6 w-5 rotate-[-8deg] rounded-[2px] bg-background shadow-sm" />
			<div className="absolute top-2 left-[42%] h-7 w-6 rotate-[4deg] rounded-[2px] bg-background shadow-sm" />
			<div className="absolute top-3 right-4 h-6 w-5 rotate-[-3deg] rounded-[2px] bg-background shadow-sm" />
		</Thumb>
	),
	"portrait-frame-split": (
		<Thumb>
			<Block className="top-2 bottom-2 left-2 w-5" />
			<div className="absolute top-3 left-9 h-1.5 w-8 rounded-full bg-foreground/25" />
			<div className="absolute top-6 left-9 h-1.5 w-6 rounded-full bg-foreground/15" />
		</Thumb>
	),
	grid: (
		<Thumb>
			<div className="absolute inset-2 grid grid-cols-3 gap-1">
				{Array.from({ length: 6 }).map((_, i) => (
					<div
						className="rounded-[2px] bg-foreground/20"
						// biome-ignore lint/suspicious/noArrayIndexKey: static decorative grid
						key={i}
					/>
				))}
			</div>
		</Thumb>
	),
	editorial: (
		<Thumb>
			<div className="absolute inset-x-6 top-2 h-3 rounded-sm bg-foreground/20" />
			<div className="absolute inset-x-8 top-6 h-1.5 rounded-full bg-foreground/15" />
			<div className="absolute inset-x-8 bottom-2.5 h-1.5 rounded-full bg-foreground/15" />
		</Thumb>
	),
	minimal: (
		<Thumb>
			<div className="absolute inset-x-2 top-2 flex flex-col gap-1.5">
				<div className="h-2 rounded-[2px] bg-foreground/20" />
				<div className="h-2 rounded-[2px] bg-foreground/20" />
				<div className="h-2 rounded-[2px] bg-foreground/20" />
			</div>
		</Thumb>
	),
};

export function LayoutPicker({ options, selected, onSelect }: Props) {
	const activeOptions = options.filter((option) => !option.deprecated);
	const legacyOptions = options.filter((option) => option.deprecated);

	const renderOption = (option: PublicLayoutPreset) => {
		const isSelected = selected === option.id;
		return (
			<button
				aria-pressed={isSelected}
				className={cn(
					"rounded-xl border-2 bg-card p-2.5 text-left transition-all hover:-translate-y-0.5 hover:shadow-sm",
					isSelected
						? "border-primary shadow-sm ring-1 ring-primary/20"
						: "border-border",
				)}
				key={option.id}
				onClick={() => onSelect(option.id)}
				type="button"
			>
				{LAYOUT_THUMBNAILS[option.id]}
				<span className="mt-2 block font-medium text-foreground text-xs">
					{option.label}
				</span>
			</button>
		);
	};

	return (
		<div className="space-y-3">
			<div className="grid grid-cols-2 gap-2.5">
				{activeOptions.map(renderOption)}
			</div>
			{legacyOptions.length > 0 && (
				<>
					<p className="pt-1 font-medium text-[11px] text-muted-foreground uppercase tracking-wide">
						Clásico (se retirará)
					</p>
					<div className="grid grid-cols-2 gap-2.5 opacity-70">
						{legacyOptions.map(renderOption)}
					</div>
				</>
			)}
		</div>
	);
}
