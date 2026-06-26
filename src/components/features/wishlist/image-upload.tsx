"use client";

import Image from "next/image";
import { useRef, useState } from "react";
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
	const inputRef = useRef<HTMLInputElement>(null);

	const { startUpload, isUploading } = useUploadThing(endpoint, {
		onClientUploadComplete: (res) => {
			const url = res[0]?.ufsUrl ?? res[0]?.url;
			if (url) {
				onChange(url);
				setError(null);
			}
		},
		onUploadError: (err) => {
			setError(friendlyError(err.message));
		},
	});

	async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0];
		if (!file) return;
		setError(null);
		await startUpload([file]);
		e.target.value = "";
	}

	if (value) {
		return (
			<div className="space-y-2">
				<div className="relative h-32 overflow-hidden rounded-lg border border-gray-200">
					<Image
						alt="Imagen subida"
						className="object-cover"
						fill
						src={value}
					/>
				</div>
				<button
					className="text-gray-500 text-xs underline hover:text-gray-700"
					onClick={() => onChange(null)}
					type="button"
				>
					Eliminar imagen
				</button>
			</div>
		);
	}

	return (
		<div className="space-y-2">
			<button
				className="flex w-full cursor-pointer items-center justify-center rounded-lg border-2 border-gray-200 border-dashed bg-gray-50 px-4 py-8 transition-colors hover:border-gray-300 hover:bg-gray-100"
				disabled={isUploading}
				onClick={() => inputRef.current?.click()}
				type="button"
			>
				<div className="text-center">
					{isUploading ? (
						<p className="text-gray-500 text-sm">Subiendo...</p>
					) : (
						<>
							<p className="text-gray-500 text-sm">
								Haz clic para seleccionar una imagen
							</p>
							<p className="mt-1 text-gray-400 text-xs">JPG, PNG o WEBP</p>
						</>
					)}
				</div>
			</button>
			<input
				accept="image/jpeg,image/png,image/webp"
				className="hidden"
				disabled={isUploading}
				onChange={handleFileChange}
				ref={inputRef}
				type="file"
			/>
			{error && <p className="text-red-500 text-xs">{error}</p>}
		</div>
	);
}
