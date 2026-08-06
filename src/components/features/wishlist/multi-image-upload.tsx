"use client";

import {
	closestCenter,
	DndContext,
	type DragEndEvent,
	PointerSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import {
	arrayMove,
	horizontalListSortingStrategy,
	SortableContext,
	useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus, X } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import type {
	ImageOrientation,
	LayoutImageGuidance,
} from "@/config/public-layouts";
import { useUploadThing } from "@/lib/uploadthing/client";
import { cn } from "@/lib/utils";
import {
	getImageMismatchMessage,
	getImageOrientation,
	hasImageOrientationMismatch,
} from "@/lib/wishlist/image-orientation";
import type { DraftCoverImage } from "@/stores/wishlist-wizard.store";

const MAX_IMAGES = 8;

const ORIENTATION_GROUP_LABELS: Record<ImageOrientation, string> = {
	landscape: "Horizontales",
	portrait: "Verticales",
	square: "Cuadradas",
};

const ORIENTATION_GROUP_ORDER: ImageOrientation[] = [
	"landscape",
	"portrait",
	"square",
];

type Props = {
	value: DraftCoverImage[];
	onChange: (images: DraftCoverImage[]) => void;
	endpoint: "coverImage";
	hint?: string;
	guidance?: LayoutImageGuidance;
	/**
	 * "compact" (default) is the dashboard design-editor sizing. "inline"
	 * matches the wizard's Images step: a prominent dropzone and
	 * orientation-shaped thumbnails.
	 */
	variant?: "compact" | "inline";
};

function friendlyError(message: string): string {
	if (message.toLowerCase().includes("size"))
		return "El archivo es demasiado grande";
	if (
		message.toLowerCase().includes("type") ||
		message.toLowerCase().includes("content")
	)
		return "Tipo de archivo no permitido (solo JPG, PNG o WEBP)";
	if (message.toLowerCase().includes("unauthorized"))
		return "Debes iniciar sesión para subir imágenes";
	return "Error al subir la imagen. Inténtalo de nuevo.";
}

function measureImageDimensions(
	file: File,
): Promise<{ width: number; height: number } | null> {
	return new Promise((resolve) => {
		const objectUrl = URL.createObjectURL(file);
		const img = new window.Image();
		img.onload = () => {
			resolve({ width: img.naturalWidth, height: img.naturalHeight });
			URL.revokeObjectURL(objectUrl);
		};
		img.onerror = () => {
			resolve(null);
			URL.revokeObjectURL(objectUrl);
		};
		img.src = objectUrl;
	});
}

function SortableThumbnail({
	image,
	isPrincipal,
	onRemove,
	orientation,
	variant,
}: {
	image: DraftCoverImage;
	isPrincipal: boolean;
	onRemove: () => void;
	orientation: ImageOrientation;
	variant: "compact" | "inline";
}) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: image.url });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	const sizeClasses =
		variant === "inline"
			? cn(
					"rounded-[10px]",
					orientation === "portrait"
						? "aspect-[3/4] w-[120px]"
						: orientation === "landscape"
							? "aspect-[16/10] min-w-[140px] flex-1"
							: "aspect-square w-[120px]",
				)
			: "size-24 rounded-lg";
	const imageSizes =
		variant === "inline"
			? orientation === "landscape"
				? "200px"
				: "120px"
			: "96px";

	return (
		<div
			className={cn(
				"group relative shrink-0 overflow-hidden border border-border bg-muted",
				sizeClasses,
				isDragging && "opacity-50",
			)}
			ref={setNodeRef}
			style={style}
		>
			<Image
				alt="Imagen de portada"
				className="object-cover"
				fill
				sizes={imageSizes}
				src={image.url}
			/>
			{isPrincipal && (
				<span className="absolute top-1 left-1 rounded-full bg-foreground/80 px-2 py-0.5 font-medium text-[10px] text-background">
					Principal
				</span>
			)}
			<button
				aria-label="Reordenar"
				className="absolute right-1 bottom-1 flex size-6 cursor-grab items-center justify-center rounded-full bg-white/90 text-foreground shadow-sm active:cursor-grabbing"
				type="button"
				{...attributes}
				{...listeners}
			>
				<GripVertical className="size-3.5" />
			</button>
			<button
				aria-label="Eliminar imagen"
				className="absolute top-1 right-1 flex size-6 items-center justify-center rounded-full bg-white/90 text-foreground opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
				onClick={onRemove}
				type="button"
			>
				<X className="size-3.5" />
			</button>
		</div>
	);
}

export function MultiImageUpload({
	value,
	onChange,
	endpoint,
	hint,
	guidance,
	variant = "compact",
}: Props) {
	const isInline = variant === "inline";
	const [errors, setErrors] = useState<string[]>([]);
	const [skippedMessage, setSkippedMessage] = useState<string | null>(null);
	const [isHandlingUpload, setIsHandlingUpload] = useState(false);
	const [isDraggingOver, setIsDraggingOver] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);
	const sensors = useSensors(useSensor(PointerSensor));

	const { startUpload, isUploading } = useUploadThing(endpoint, {
		onUploadError: (err) => {
			setErrors((prev) => [...prev, friendlyError(err.message)]);
		},
	});

	const isBusy = isUploading || isHandlingUpload;
	const canAddMore = value.length < MAX_IMAGES;
	const mismatchMessages = value.flatMap((image) => {
		const recommended = guidance?.orientation;
		if (
			!recommended ||
			!hasImageOrientationMismatch(image.orientation, recommended)
		)
			return [];
		return [
			{
				url: image.url,
				message: getImageMismatchMessage(image.orientation, recommended),
			},
		];
	});

	const groupedByOrientation = ORIENTATION_GROUP_ORDER.map((orientation) => ({
		orientation,
		images: value.filter((image) => image.orientation === orientation),
	})).filter((group) => group.images.length > 0);

	async function processFiles(files: File[]) {
		if (files.length === 0) return;

		const remainingSlots = MAX_IMAGES - value.length;
		const filesToUpload = files.slice(0, remainingSlots);
		const skippedCount = files.length - filesToUpload.length;

		setSkippedMessage(
			skippedCount > 0
				? `${skippedCount} ${skippedCount === 1 ? "imagen no se agregó" : "imágenes no se agregaron"} porque ya tienes el máximo de ${MAX_IMAGES} fotos.`
				: null,
		);

		if (filesToUpload.length === 0) return;

		setErrors([]);
		setIsHandlingUpload(true);

		const uploadedImages: DraftCoverImage[] = [];
		for (const file of filesToUpload) {
			const dimensions = await measureImageDimensions(file);
			if (!dimensions) {
				setErrors((prev) => [
					...prev,
					`${file.name}: no pudimos leer esta imagen. Inténtalo de nuevo.`,
				]);
				continue;
			}

			try {
				const res = await startUpload([file]);
				const url = res?.[0]?.ufsUrl ?? res?.[0]?.url;
				if (url) {
					uploadedImages.push({
						url,
						width: dimensions.width,
						height: dimensions.height,
						orientation:
							getImageOrientation(dimensions.width, dimensions.height) ??
							"square",
					});
				}
			} catch (err) {
				const message = err instanceof Error ? err.message : "Upload failed";
				setErrors((prev) => [
					...prev,
					`${file.name}: ${friendlyError(message)}`,
				]);
			}
		}

		if (uploadedImages.length > 0) {
			onChange([...value, ...uploadedImages]);
		}
		setIsHandlingUpload(false);
	}

	async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
		const files = Array.from(e.target.files ?? []);
		e.target.value = "";
		await processFiles(files);
	}

	function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
		if (!canAddMore || isBusy) return;
		e.preventDefault();
		setIsDraggingOver(true);
	}

	function handleDragLeave() {
		setIsDraggingOver(false);
	}

	async function handleDrop(e: React.DragEvent<HTMLDivElement>) {
		e.preventDefault();
		setIsDraggingOver(false);
		if (!canAddMore || isBusy) return;

		const files = Array.from(e.dataTransfer.files ?? []).filter((file) =>
			file.type.startsWith("image/"),
		);
		await processFiles(files);
	}

	function handleRemove(url: string) {
		onChange(value.filter((existing) => existing.url !== url));
	}

	function handleDragEnd(event: DragEndEvent) {
		const { active, over } = event;
		if (!over || active.id === over.id) return;

		const oldIndex = value.findIndex((image) => image.url === active.id);
		const newIndex = value.findIndex((image) => image.url === over.id);
		if (oldIndex === -1 || newIndex === -1) return;

		onChange(arrayMove(value, oldIndex, newIndex));
	}

	return (
		// biome-ignore lint/a11y/noStaticElementInteractions: native HTML5 drag-and-drop file zone has no equivalent interactive ARIA role; file selection remains available via the "Agregar" button and file input
		<div
			className={cn(
				"space-y-3 rounded-lg",
				isDraggingOver && "ring-2 ring-primary ring-offset-2",
			)}
			onDragLeave={handleDragLeave}
			onDragOver={handleDragOver}
			onDrop={handleDrop}
		>
			{isInline && (
				<button
					className="w-full rounded-[14px] border-2 border-border border-dashed bg-[#FBFAF5] px-5 py-9 text-center text-muted-foreground disabled:cursor-not-allowed disabled:opacity-60"
					disabled={isBusy || !canAddMore}
					onClick={() => inputRef.current?.click()}
					type="button"
				>
					<div aria-hidden className="mb-2 text-2xl">
						📷
					</div>
					<div className="font-semibold text-[14.5px] text-foreground">
						{isBusy ? "Subiendo..." : "Arrastra tus fotos aquí"}
					</div>
					<div className="mt-1 text-[12px]">
						o haz clic para buscar en tu equipo · sugerido 4–8 fotos
					</div>
				</button>
			)}
			<DndContext
				collisionDetection={closestCenter}
				onDragEnd={handleDragEnd}
				sensors={sensors}
			>
				<SortableContext
					items={value.map((image) => image.url)}
					strategy={horizontalListSortingStrategy}
				>
					<div className="space-y-3">
						{groupedByOrientation.map((group) => (
							<div key={group.orientation}>
								{isInline ? (
									<div className="mb-2.5 flex items-center justify-between">
										<span className="font-semibold text-[13.5px] text-foreground">
											{ORIENTATION_GROUP_LABELS[group.orientation]}
										</span>
										<Badge variant="published">{group.images.length}</Badge>
									</div>
								) : (
									<p className="mb-1.5 text-muted-foreground text-xs">
										{ORIENTATION_GROUP_LABELS[group.orientation]} ·{" "}
										{group.images.length}
									</p>
								)}
								<div className="flex flex-wrap gap-2.5">
									{group.images.map((image) => (
										<SortableThumbnail
											image={image}
											isPrincipal={value[0]?.url === image.url}
											key={image.url}
											onRemove={() => handleRemove(image.url)}
											orientation={group.orientation}
											variant={variant}
										/>
									))}
								</div>
							</div>
						))}
						{canAddMore && (
							<button
								className="flex size-24 shrink-0 flex-col items-center justify-center gap-1 rounded-lg border-2 border-border border-dashed bg-muted/50 text-muted-foreground text-xs hover:border-primary/50 hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
								disabled={isBusy}
								onClick={() => inputRef.current?.click()}
								type="button"
							>
								<Plus className="size-4" />
								{isBusy ? "Subiendo..." : "Agregar"}
							</button>
						)}
					</div>
				</SortableContext>
			</DndContext>
			<input
				accept="image/jpeg,image/png,image/webp"
				className="hidden"
				disabled={isBusy}
				multiple
				onChange={handleFileChange}
				ref={inputRef}
				type="file"
			/>
			{hint && <p className="text-muted-foreground text-xs">{hint}</p>}
			{mismatchMessages.map(({ url, message }) => (
				<p className="text-muted-foreground text-xs" key={url} role="status">
					{message}
				</p>
			))}
			{skippedMessage && (
				<p className="text-muted-foreground text-xs" role="status">
					{skippedMessage}
				</p>
			)}
			{errors.map((message) => (
				<p className="text-destructive text-xs" key={message}>
					{message}
				</p>
			))}
		</div>
	);
}
