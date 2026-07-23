"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	useCarousel,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

type PlaceholderProps = {
	className?: string;
};

/** Tinted placeholder for a missing cover image slot — never an empty gray box. */
export function HeroPlaceholder({ className }: PlaceholderProps) {
	return (
		<div
			aria-hidden
			className={cn("bg-accent/50", className)}
			style={{
				backgroundImage:
					"repeating-linear-gradient(135deg, rgba(0,0,0,.05) 0 8px, transparent 8px 16px)",
			}}
		/>
	);
}

type HeroImageSlotProps = {
	src: string | null;
	alt: string;
	className?: string;
	priority?: boolean;
};

/** A single hero slot: a real cover image, or the tinted placeholder when none is set. */
export function HeroImageSlot({
	src,
	alt,
	className,
	priority,
}: HeroImageSlotProps) {
	if (!src) {
		return <HeroPlaceholder className={className} />;
	}

	return (
		<div className={cn("relative overflow-hidden", className)}>
			<Image
				alt={alt}
				className="object-cover"
				fill
				priority={priority}
				src={src}
			/>
		</div>
	);
}

function GalleryControls({ total }: { total: number }) {
	const { scrollPrev, scrollNext, canScrollPrev, canScrollNext, api } =
		useCarousel();
	const [selectedIndex, setSelectedIndex] = useState(0);

	useEffect(() => {
		if (!api) return;
		const onSelect = () => setSelectedIndex(api.selectedScrollSnap());
		onSelect();
		api.on("select", onSelect);
		api.on("reInit", onSelect);
		return () => {
			api.off("select", onSelect);
			api.off("reInit", onSelect);
		};
	}, [api]);

	return (
		<>
			<button
				aria-label="Foto anterior"
				className="absolute top-1/2 left-3 z-10 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-foreground shadow-md transition-opacity disabled:opacity-40"
				disabled={!canScrollPrev}
				onClick={scrollPrev}
				type="button"
			>
				‹
			</button>
			<button
				aria-label="Foto siguiente"
				className="absolute top-1/2 right-3 z-10 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-foreground shadow-md transition-opacity disabled:opacity-40"
				disabled={!canScrollNext}
				onClick={scrollNext}
				type="button"
			>
				›
			</button>
			<div className="absolute right-0 bottom-3 left-0 z-10 flex flex-col items-center gap-1.5">
				<div className="flex gap-1.5">
					{Array.from({ length: total }).map((_, index) => (
						<span
							className={cn(
								"size-1.5 rounded-full",
								index === selectedIndex ? "bg-white" : "bg-white/45",
							)}
							// biome-ignore lint/suspicious/noArrayIndexKey: dots are positional and never reordered
							key={index}
						/>
					))}
				</div>
				<span className="rounded-full bg-black/30 px-2.5 py-1 font-mono text-[10px] text-white tracking-wide">
					Galería · foto {selectedIndex + 1}/{total}
				</span>
			</div>
		</>
	);
}

type HeroCarouselGalleryProps = {
	images: string[];
	alt: string;
	className?: string;
	maxImages?: number;
};

/**
 * Single-frame hero gallery: shows the cover image full-frame, and when 2+
 * images exist, mounts the Carousel primitive with prev/next + a
 * "Galería · foto N/M" caption. 0 or 1 images render without carousel controls.
 */
export function HeroCarouselGallery({
	images,
	alt,
	className,
	maxImages = 6,
}: HeroCarouselGalleryProps) {
	const visibleImages = images.slice(0, maxImages);

	if (visibleImages.length <= 1) {
		return (
			<HeroImageSlot
				alt={alt}
				className={className}
				priority
				src={visibleImages[0] ?? null}
			/>
		);
	}

	return (
		<Carousel className={cn("relative", className)} opts={{ loop: true }}>
			<CarouselContent className="-ml-0 h-full">
				{visibleImages.map((src, index) => (
					<CarouselItem className="h-full pl-0" key={src}>
						<div className="relative h-full w-full overflow-hidden">
							<Image
								alt={`${alt} ${index + 1}`}
								className="object-cover"
								fill
								priority={index === 0}
								src={src}
							/>
						</div>
					</CarouselItem>
				))}
			</CarouselContent>
			<GalleryControls total={visibleImages.length} />
		</Carousel>
	);
}
