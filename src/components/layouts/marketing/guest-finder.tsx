"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Field, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { extractWishlistSlug } from "@/lib/wishlist/slug-extract";

const guestFinderSchema = z.object({
	query: z
		.string()
		.trim()
		.min(2, "Ingresa al menos 2 caracteres")
		.max(80, "Máximo 80 caracteres"),
});

type GuestFinderValues = z.infer<typeof guestFinderSchema>;

export function GuestFinder() {
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

	const onSubmit = (values: GuestFinderValues) => {
		const slug = extractWishlistSlug(values.query);

		if (!slug) {
			setNotFoundError(true);
			return;
		}

		setNotFoundError(false);
		router.push(`/w/${slug}`);
	};

	return (
		<section className="border-[var(--mline)] border-t bg-[#F0FAE8] px-11 py-16 text-center">
			<div data-reveal>
				<div className="mb-3 block text-[30px]" data-float-rev>
					🔍
				</div>
				<h2 className="m-serif mb-[6px] font-semibold text-[32px]">
					¿Buscas la lista de alguien?
				</h2>
				<p className="mb-6 text-[15px] text-[var(--mmut)] lg:hidden">
					Encuéntrala por nombre o enlace.
				</p>
				<p className="mb-6 hidden text-[15px] text-[var(--mmut)] lg:block">
					Encuentra su wishlist por nombre o por enlace.
				</p>
				<form
					className="mx-auto max-w-[520px]"
					noValidate
					onSubmit={handleSubmit(onSubmit)}
				>
					<div className="flex items-start gap-[10px]">
						<Field className="flex-1">
							<Input
								aria-invalid={!!errors.query || notFoundError}
								aria-label="Enlace o nombre de la lista"
								className="h-auto rounded-full border-[var(--mline)] bg-white px-5 py-[14px] text-[14px] text-[var(--mink)] placeholder:text-[var(--mmut)] focus-visible:border-[var(--mrose)]"
								placeholder="Nombre del evento o pareja…"
								{...register("query", {
									onChange: () => setNotFoundError(false),
								})}
							/>
							<FieldError className="px-2 text-left" errors={[errors.query]} />
							{notFoundError && (
								<p className="px-2 text-left text-destructive text-sm">
									No reconocimos ese enlace o nombre de lista.
								</p>
							)}
						</Field>
						<Button
							className="m-btn m-btn-pri h-auto"
							disabled={isSubmitting}
							type="submit"
						>
							Buscar
						</Button>
					</div>
				</form>
			</div>
		</section>
	);
}
