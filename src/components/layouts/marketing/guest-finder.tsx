"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Field, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const guestFinderSchema = z.object({
	query: z
		.string()
		.trim()
		.min(2, "Ingresa al menos 2 caracteres")
		.max(80, "Máximo 80 caracteres"),
});

type GuestFinderValues = z.infer<typeof guestFinderSchema>;

export function GuestFinder() {
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<GuestFinderValues>({
		resolver: zodResolver(guestFinderSchema),
		defaultValues: { query: "" },
	});

	const onSubmit = (values: GuestFinderValues) => {
		// Search is wired in Milestone 8.2; for now confirm the input is valid.
		toast.info(`Pronto podrás buscar: "${values.query}" 🔎`);
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
				<p className="mb-6 text-[15px] text-[var(--mmut)]">
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
								aria-invalid={!!errors.query}
								aria-label="Nombre del evento o de la pareja"
								className="h-auto rounded-full border-[var(--mline)] bg-white px-5 py-[14px] text-[14px] text-[var(--mink)] placeholder:text-[var(--mmut)] focus-visible:border-[var(--mrose)]"
								placeholder="Nombre del evento o de la pareja…"
								{...register("query")}
							/>
							<FieldError className="px-2 text-left" errors={[errors.query]} />
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
