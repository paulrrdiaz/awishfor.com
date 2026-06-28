"use client";

import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";

const FAQS = [
	{
		q: "¿Qué es A Wish For?",
		a: "Una plataforma para crear listas de regalos hermosas para baby showers, cumpleaños, bodas, nuevo hogar y más. Agregas regalos de cualquier tienda y tus invitados los marcan como comprados para evitar duplicados.",
	},
	{
		q: "¿Cuánto cuesta?",
		a: "Crear y compartir tu wishlist es totalmente gratis. No cobramos comisiones ni a ti ni a tus invitados.",
	},
	{
		q: "¿Cómo se reciben los regalos?",
		a: "Tus invitados compran los regalos directamente en la tienda que elijas y los marcan como comprados en tu lista. Tú coordinas la entrega como prefieras.",
	},
	{
		q: "¿Funciona con cualquier tienda?",
		a: "Sí. Puedes agregar regalos desde cualquier tienda con enlace web, además de nuestras tiendas aliadas.",
	},
	{
		q: "¿Cómo comparto mi lista?",
		a: "Con un enlace único, por WhatsApp o con un código QR para tus invitaciones físicas.",
	},
];

export function FaqSection() {
	return (
		<section
			className="border-[var(--mline)] border-t bg-white px-11 py-[76px]"
			id="faq"
		>
			<div className="mb-9 text-center" data-reveal>
				<div className="m-eyebrow mb-3">Preguntas frecuentes</div>
				<h2 className="m-serif font-semibold text-[38px]">
					Resolvemos tus dudas
				</h2>
			</div>
			<Accordion
				className="mx-auto flex max-w-[720px] flex-col gap-[10px]"
				data-reveal-stagger
				defaultValue={["faq-0"]}
				multiple={false}
			>
				{FAQS.map((f, i) => (
					<AccordionItem
						className="!border-b-0 m-card px-6"
						key={f.q}
						value={`faq-${i}`}
					>
						<AccordionTrigger className="m-serif py-5 font-semibold text-[17px] text-[var(--mink)] hover:no-underline">
							{f.q}
						</AccordionTrigger>
						<AccordionContent className="text-[14px] text-[var(--mmut)] leading-[1.65]">
							{f.a}
						</AccordionContent>
					</AccordionItem>
				))}
			</Accordion>
		</section>
	);
}
