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
	{
		q: "¿Necesito crear una cuenta?",
		a: "No, puedes armar tu wishlist sin registrarte. Solo te pediremos iniciar sesión al publicarla, para que puedas guardarla y editarla después.",
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
			<div
				className="mx-auto flex max-w-[720px] flex-col gap-[10px]"
				data-reveal-stagger
			>
				{FAQS.map((f, i) => (
					<details className="group m-card px-6" key={f.q} open={i === 0}>
						<summary className="m-serif cursor-pointer list-none py-5 font-semibold text-[17px] text-[var(--mink)] [&::-webkit-details-marker]:hidden">
							{f.q}
						</summary>
						<p className="pb-5 text-[14px] text-[var(--mmut)] leading-[1.65]">
							{f.a}
						</p>
					</details>
				))}
			</div>
		</section>
	);
}
