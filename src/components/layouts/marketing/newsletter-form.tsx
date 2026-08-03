"use client";

import { type FormEvent, useState } from "react";

/**
 * Stub submission: no persistence, mutation, or third-party request. A real
 * subscription capability is a separate, not-yet-built change — this only
 * acknowledges the visitor's intent.
 */
export function NewsletterForm() {
	const [submitted, setSubmitted] = useState(false);

	const onSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setSubmitted(true);
	};

	if (submitted) {
		return (
			<p className="text-[13px] text-white lg:text-[#173E29]" role="status">
				¡Gracias! Cuando esté listo, te avisaremos por aquí.
			</p>
		);
	}

	return (
		<form
			className="flex w-full shrink-0 rounded-full bg-white p-1 lg:w-auto lg:p-[5px]"
			onSubmit={onSubmit}
		>
			<label className="sr-only" htmlFor="newsletter-email">
				Correo electrónico
			</label>
			<input
				className="min-w-0 flex-1 border-none px-3 py-[9px] font-[var(--font-inter)] text-[#173E29] text-[12.5px] outline-none placeholder:text-[var(--mmut)] lg:w-[200px] lg:flex-none lg:px-4 lg:py-[10px] lg:text-[13px]"
				id="newsletter-email"
				name="email"
				placeholder="tu@correo.com"
				required
				type="email"
			/>
			<button
				className="m-btn m-btn-lime px-4 py-[9px] text-[12px] lg:px-5 lg:py-[10px] lg:text-[13px]"
				type="submit"
			>
				Unirme
			</button>
		</form>
	);
}
