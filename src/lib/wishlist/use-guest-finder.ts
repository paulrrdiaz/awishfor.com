"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { extractWishlistSlug } from "@/lib/wishlist/slug-extract";

const guestFinderSchema = z.object({
	query: z
		.string()
		.trim()
		.min(2, "Ingresa al menos 2 caracteres")
		.max(80, "Máximo 80 caracteres"),
});

export type GuestFinderValues = z.infer<typeof guestFinderSchema>;

/**
 * Shared validation, slug extraction, and navigation behind the guest
 * list-finder, so every surface that offers it (the landing page, the public
 * 404) resolves input identically. Presentation is left entirely to callers.
 */
export function useGuestFinder() {
	const router = useRouter();
	const [notFoundError, setNotFoundError] = useState(false);

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<GuestFinderValues>({
		resolver: zodResolver(guestFinderSchema),
		defaultValues: { query: "" },
	});

	const onSubmit = handleSubmit((values) => {
		const slug = extractWishlistSlug(values.query);

		if (!slug) {
			setNotFoundError(true);
			return;
		}

		setNotFoundError(false);
		router.push(`/w/${slug}`);
	});

	return {
		register,
		errors,
		isSubmitting,
		notFoundError,
		clearNotFoundError: () => setNotFoundError(false),
		onSubmit,
	};
}
