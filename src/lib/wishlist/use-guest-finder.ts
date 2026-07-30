"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useState } from "react";

import { extractWishlistSlug } from "@/lib/wishlist/slug-extract";

/** Native-form client behavior shared by the small list-finder surfaces. */
export function useGuestFinder() {
	const router = useRouter();
	const [error, setError] = useState<string | null>(null);

	const onSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const query = String(
			new FormData(event.currentTarget).get("query") ?? "",
		).trim();
		if (query.length < 2 || query.length > 80) {
			setError("Ingresa entre 2 y 80 caracteres.");
			return;
		}
		const slug = extractWishlistSlug(query);
		if (!slug) {
			setError("No reconocimos ese enlace o nombre de lista.");
			return;
		}
		setError(null);
		router.push(`/w/${slug}`);
	};

	return { error, onSubmit, clearError: () => setError(null) };
}
