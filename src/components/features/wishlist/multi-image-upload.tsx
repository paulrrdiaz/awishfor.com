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
import { useUploadThing } from "@/lib/uploadthing/client";
import { cn } from "@/lib/utils";

const MAX_IMAGES = 6;

type Props = {
	value: string[];
	onChange: (urls: string[]) => void;
	endpoint: "coverImage";
	hint?: string;
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

function SortableThumbnail({
	url,
	isPrincipal,
	onRemove,
}: {
	url: string;
	isPrincipal: boolean;
	onRemove: () => void;
}) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: url });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	return (
		<div
			className={cn(
				"group relative size-24 shrink-0 overflow-hidden rounded-lg border border-border bg-muted",
				isDragging && "opacity-50",
			)}
			ref={setNodeRef}
			style={style}
		>
			<Image alt="Imagen de portada" className="object-cover" fill src={url} />
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

export function MultiImageUpload({ value, onChange, endpoint, hint }: Props) {
	const [error, setError] = useState<string | null>(null);
	const [isHandlingUpload, setIsHandlingUpload] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);
	const sensors = useSensors(useSensor(PointerSensor));

	const { startUpload, isUploading } = useUploadThing(endpoint, {
		onUploadError: (err) => {
			setError(friendlyError(err.message));
		},
	});

	const isBusy = isUploading || isHandlingUpload;
	const canAddMore = value.length < MAX_IMAGES;

	async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
		const files = Array.from(e.target.files ?? []);
		e.target.value = "";
		if (files.length === 0) return;

		const remainingSlots = MAX_IMAGES - value.length;
		const filesToUpload = files.slice(0, remainingSlots);
		if (filesToUpload.length === 0) return;

		setError(null);
		setIsHandlingUpload(true);

		const uploadedUrls: string[] = [];
		for (const file of filesToUpload) {
			try {
				const res = await startUpload([file]);
				const url = res?.[0]?.ufsUrl ?? res?.[0]?.url;
				if (url) {
					uploadedUrls.push(url);
				}
			} catch (err) {
				const message = err instanceof Error ? err.message : "Upload failed";
				setError(friendlyError(message));
			}
		}

		if (uploadedUrls.length > 0) {
			onChange([...value, ...uploadedUrls]);
		}
		setIsHandlingUpload(false);
	}

	function handleRemove(url: string) {
		onChange(value.filter((existing) => existing !== url));
	}

	function handleDragEnd(event: DragEndEvent) {
		const { active, over } = event;
		if (!over || active.id === over.id) return;

		const oldIndex = value.indexOf(String(active.id));
		const newIndex = value.indexOf(String(over.id));
		if (oldIndex === -1 || newIndex === -1) return;

		onChange(arrayMove(value, oldIndex, newIndex));
	}

	return (
		<div className="space-y-2">
			<DndContext
				collisionDetection={closestCenter}
				onDragEnd={handleDragEnd}
				sensors={sensors}
			>
				<SortableContext items={value} strategy={horizontalListSortingStrategy}>
					<div className="flex flex-wrap gap-3">
						{value.map((url, index) => (
							<SortableThumbnail
								isPrincipal={index === 0}
								key={url}
								onRemove={() => handleRemove(url)}
								url={url}
							/>
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
			{error && <p className="text-destructive text-xs">{error}</p>}
		</div>
	);
}
