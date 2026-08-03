"use client";

import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";

import { MarketingContainer } from "./marketing-container";

const FAQS = [
	{
		icon: "🎁",
		q: "¿Qué es A Wish For?",
		a: "Una plataforma para crear listas de regalos hermosas para baby showers, cumpleaños, bodas, nuevo hogar y más. Agregas regalos de cualquier tienda y tus invitados los marcan como comprados para evitar duplicados.",
	},
	{
		icon: "💰",
		q: "¿Cuánto cuesta?",
		a: "Crear y compartir tu wishlist es totalmente gratis. No cobramos comisiones ni a ti ni a tus invitados.",
	},
	{
		icon: "📦",
		q: "¿Cómo se reciben los regalos?",
		a: "Tus invitados compran los regalos directamente en la tienda que elijas y los marcan como comprados en tu lista. Tú coordinas la entrega como prefieras.",
	},
	{
		icon: "🛍️",
		q: "¿Funciona con cualquier tienda?",
		a: "Sí. Puedes agregar regalos desde cualquier tienda con enlace web, además de nuestras tiendas aliadas.",
	},
	{
		icon: "🔐",
		q: "¿Necesito crear una cuenta?",
		a: "No, puedes armar tu wishlist sin registrarte. Solo te pediremos iniciar sesión al publicarla, para que puedas guardarla y editarla después.",
	},
];

export function FaqSection() {
	return (
		<section
			className="border-[var(--mline)] border-t bg-white px-[22px] py-11 sm:px-11 lg:py-[76px]"
			id="faq"
		>
			<MarketingContainer>
				<header className="mb-[22px] text-center sm:mb-10">
					<div className="m-eyebrow mb-[9px] sm:mb-3">Preguntas frecuentes</div>
					<h2 className="m-serif font-semibold text-[24px] leading-[1.15] sm:text-[36px]">
						Resolvemos tus dudas
					</h2>
				</header>

				<Accordion
					className="mx-auto max-w-[640px]"
					collapsible
					defaultValue="what-is-awishfor"
					type="single"
				>
					{FAQS.map((faq, index) => (
						<AccordionItem
							className={`flex items-start gap-3 py-4 sm:gap-[14px] sm:py-5 ${
								index < FAQS.length - 1 ? "border-[var(--mline)] border-b" : ""
							}`}
							key={faq.q}
							value={index === 0 ? "what-is-awishfor" : `faq-${index}`}
						>
							<div
								aria-hidden
								className="flex size-[30px] shrink-0 items-center justify-center rounded-[9px] bg-[#F0FAE8] text-[13px] sm:size-[34px] sm:rounded-[10px] sm:text-[15px]"
							>
								{faq.icon}
							</div>
							<div className="min-w-0 flex-1">
								<AccordionTrigger className="!rounded-none !py-0 m-serif font-semibold text-[14.5px] text-[var(--mink)] hover:no-underline focus-visible:outline-2 focus-visible:outline-[var(--mink)] focus-visible:outline-offset-4 sm:text-[16.5px] [&_[data-slot=accordion-trigger-icon]]:ml-5 [&_[data-slot=accordion-trigger-icon]]:size-[18px] [&_[data-slot=accordion-trigger-icon]]:text-[var(--mmut)]">
									{faq.q}
								</AccordionTrigger>
								<AccordionContent className="max-w-[520px] pt-0 pb-0">
									<p className="mt-[6px] text-[12.5px] text-[var(--mmut)] leading-[1.6] sm:mt-2 sm:text-[13.5px] sm:leading-[1.65]">
										{faq.a}
									</p>
								</AccordionContent>
							</div>
						</AccordionItem>
					))}
				</Accordion>
			</MarketingContainer>
		</section>
	);
}
