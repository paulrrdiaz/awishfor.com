"use client";

import { Button } from "@/components/ui/button";
import { Field, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useGuestFinder } from "@/lib/wishlist/use-guest-finder";

type Props = {
	className?: string;
};

/**
 * Compact public-theme rendering of the guest list-finder, for embedding
 * inside another surface (the public 404) rather than standing alone as a
 * section like the marketing `GuestFinder`. Same resolution behavior, styled
 * with public theme tokens instead of the marketing `--m*` tokens.
 */
export function GuestFinderField({ className }: Props) {
	const {
		register,
		errors,
		isSubmitting,
		notFoundError,
		clearNotFoundError,
		onSubmit,
	} = useGuestFinder();

	return (
		<form
			className={cn("mx-auto max-w-[400px]", className)}
			noValidate
			onSubmit={onSubmit}
		>
			<div className="flex items-start gap-2">
				<Field className="flex-1">
					<Input
						aria-invalid={!!errors.query || notFoundError}
						aria-label="Enlace o nombre de la lista"
						className="h-auto rounded-full border-border bg-card px-4 py-[10px] text-[13px] text-foreground placeholder:text-muted-foreground focus-visible:border-ring"
						placeholder="Nombre o enlace de la lista…"
						{...register("query", {
							onChange: clearNotFoundError,
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
					className="public-btn h-auto bg-primary px-4 py-[10px] text-primary-foreground text-sm"
					disabled={isSubmitting}
					type="submit"
				>
					Buscar
				</Button>
			</div>
		</form>
	);
}
