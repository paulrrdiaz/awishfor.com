"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useUploadThing } from "@/lib/uploadthing/client";

type Props = {
	value: string | null;
	onChange: (url: string | null) => void;
	endpoint: "coverImage" | "giftImage";
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

export function ImageUpload({ value, onChange, endpoint }: Props) {
	const [error, setError] = useState<string | null>(null);
	const [isHandlingUpload, setIsHandlingUpload] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);

	const { startUpload, isUploading } = useUploadThing(endpoint, {
		onClientUploadComplete: (res) => {
			const url = res[0]?.ufsUrl ?? res[0]?.url;
			if (url) {
				onChange(url);
				setError(null);
			}
			setIsHandlingUpload(false);
		},
		onUploadError: (err) => {
			setError(friendlyError(err.message));
			setIsHandlingUpload(false);
		},
	});
	const isBusy = isUploading || isHandlingUpload;

	async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0];
		if (!file) return;
		setError(null);
		setIsHandlingUpload(true);
		try {
			const res = await startUpload([file]);
			const url = res?.[0]?.ufsUrl ?? res?.[0]?.url;
			if (url) {
				onChange(url);
				setError(null);
				return;
			}
			setError("No se recibió la URL de la imagen. Inténtalo de nuevo.");
		} catch (err) {
			const message = err instanceof Error ? err.message : "Upload failed";
			setError(friendlyError(message));
		} finally {
			setIsHandlingUpload(false);
			e.target.value = "";
		}
	}

	if (value) {
		return (
			<div className="space-y-2">
				<div className="relative h-48 overflow-hidden rounded-lg border border-border bg-muted sm:h-64">
					<Image
						alt="Imagen subida"
						className="object-contain"
						fill
						src={value}
						unoptimized
					/>
				</div>
				<Button
					className="h-auto p-0 text-xs"
					onClick={() => onChange(null)}
					type="button"
					variant="link"
				>
					Eliminar imagen
				</Button>
			</div>
		);
	}

	return (
		<div className="space-y-2">
			<Button
				className="flex h-auto min-h-32 w-full cursor-pointer items-center justify-center whitespace-normal rounded-lg border-2 border-border border-dashed bg-muted/50 px-4 py-8 text-center hover:border-primary/50 hover:bg-accent"
				disabled={isBusy}
				onClick={() => inputRef.current?.click()}
				type="button"
				variant="outline"
			>
				<div className="text-center">
					{isBusy ? (
						<p className="text-muted-foreground text-sm">Subiendo...</p>
					) : (
						<>
							<p className="text-muted-foreground text-sm">
								Haz clic para seleccionar una imagen
							</p>
							<p className="mt-1 text-muted-foreground/70 text-xs">
								JPG, PNG o WEBP
							</p>
						</>
					)}
				</div>
			</Button>
			<input
				accept="image/jpeg,image/png,image/webp"
				className="hidden"
				disabled={isBusy}
				onChange={handleFileChange}
				ref={inputRef}
				type="file"
			/>
			{error && <p className="text-destructive text-xs">{error}</p>}
		</div>
	);
}
