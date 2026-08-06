"use client";

import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
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
			className={cn("bg-ph-tint", className)}
			style={{
				backgroundImage:
					"repeating-linear-gradient(135deg, rgba(0,0,0,.05) 0 8px, transparent 8px 16px)",
			}}
		/>
	);
}

/** Marks a preview slot filled with occasion sample photography, never the creator's own upload. */
export function SampleImageMarker() {
	return (
		<span className="absolute top-1.5 left-1.5 z-10 rounded-full bg-foreground/80 px-2 py-0.5 font-medium text-[10px] text-background">
			Ejemplo
		</span>
	);
}

type HeroImageSlotProps = {
	src: string | null;
	alt: string;
	className?: string;
	priority?: boolean;
	isSample?: boolean;
	sizes?: string;
};

/** A single hero slot: a real cover image, or the tinted placeholder when none is set. */
export function HeroImageSlot({
	src,
	alt,
	className,
	priority,
	isSample,
	sizes = "100vw",
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
				sizes={sizes}
				src={src}
			/>
			{isSample && <SampleImageMarker />}
		</div>
	);
}

type GalleryControlsProps = {
	total: number;
	variant?: "default" | "compact";
};

function GalleryControls({ total, variant = "default" }: GalleryControlsProps) {
	const { scrollPrev, scrollNext, canScrollPrev, canScrollNext, api } =
		useCarousel();
	const [selectedIndex, setSelectedIndex] = useState(0);
	const isCompact = variant === "compact";

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
				className={cn(
					"absolute top-1/2 z-10 flex -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-foreground transition-[opacity,transform] hover:scale-105 disabled:opacity-40",
					isCompact ? "left-1.5 size-7 shadow-sm" : "left-3 size-8 shadow-md",
				)}
				disabled={!canScrollPrev}
				onClick={scrollPrev}
				type="button"
			>
				‹
			</button>
			<button
				aria-label="Foto siguiente"
				className={cn(
					"absolute top-1/2 z-10 flex -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-foreground transition-[opacity,transform] hover:scale-105 disabled:opacity-40",
					isCompact ? "right-1.5 size-7 shadow-sm" : "right-3 size-8 shadow-md",
				)}
				disabled={!canScrollNext}
				onClick={scrollNext}
				type="button"
			>
				›
			</button>
			<div
				className={cn(
					"absolute right-0 left-0 z-10 flex flex-col items-center gap-1.5",
					isCompact ? "bottom-2" : "bottom-3",
				)}
			>
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
				{!isCompact && (
					<span className="rounded-full bg-black/30 px-2.5 py-1 font-mono text-[10px] text-white tracking-wide">
						Galería · foto {selectedIndex + 1}/{total}
					</span>
				)}
			</div>
		</>
	);
}

type HeroCoverImage = { url: string; isSample?: boolean };

type HeroCarouselGalleryProps = {
	images: HeroCoverImage[];
	alt: string;
	className?: string;
	controlsVariant?: "default" | "compact";
	maxImages?: number;
	priority: boolean;
	sizes?: string;
	startIndex?: number;
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
	controlsVariant = "default",
	maxImages = 6,
	priority,
	sizes = "100vw",
	startIndex = 0,
}: HeroCarouselGalleryProps) {
	const autoplay = useRef(Autoplay({ delay: 5000 }));
	const visibleImages = images.slice(0, maxImages);

	if (visibleImages.length <= 1) {
		return (
			<HeroImageSlot
				alt={alt}
				className={className}
				isSample={visibleImages[0]?.isSample}
				priority={priority}
				sizes={sizes}
				src={visibleImages[0]?.url ?? null}
			/>
		);
	}

	return (
		<Carousel
			className={cn("relative", className)}
			opts={{ duration: 28, loop: true, startIndex, active: true }}
			plugins={[autoplay.current]}
		>
			<CarouselContent className="-ml-0 h-full">
				{visibleImages.map((image, index) => (
					<CarouselItem className="h-full pl-0" key={image.url}>
						<div className="relative h-full w-full overflow-hidden">
							<Image
								alt={`${alt} ${index + 1}`}
								className="object-cover"
								fill
								priority={priority && index === 0}
								sizes={sizes}
								src={image.url}
							/>
							{image.isSample && <SampleImageMarker />}
						</div>
					</CarouselItem>
				))}
			</CarouselContent>
			<GalleryControls total={visibleImages.length} variant={controlsVariant} />
		</Carousel>
	);
}
