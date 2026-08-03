/* biome-ignore-all lint/performance/noImgElement: step thumbnails are URL-sized and lazy, outside the first fold. */

const STEPS = [
	{
		n: "1",
		bg: "#BCE25A",
		fg: "#1B3A12",
		thumb: "https://images.unsplash.com/photo-1555252333-9f8e92e65df9",
		title: "Elige el tipo de evento",
		body: "Baby shower, boda, cumpleaños, nuevo hogar o una lista general.",
	},
	{
		n: "2",
		bg: "#9ECD6E",
		fg: "#173E29",
		thumb: "https://images.unsplash.com/photo-1519741497674-611481863552",
		title: "Ponle nombre y elige tu enlace",
		body: "El título, los anfitriones y una URL propia para compartir.",
	},
	{
		n: "3",
		bg: "#7FB069",
		fg: "#fff",
		thumb: null,
		title: "Elige tu tema y personalízalo",
		body: "Siete estilos con vista previa en vivo mientras decides.",
	},
	{
		n: "4",
		bg: "#56A86B",
		fg: "#fff",
		thumb: "https://images.unsplash.com/photo-1592194996308-7b43878e84a6",
		title: "Agrega tus regalos",
		body: "Pega el enlace de cualquier tienda; nosotros traemos foto, nombre y precio.",
	},
	{
		n: "5",
		bg: "#173E29",
		fg: "#D7F09E",
		thumb: "link",
		title: "Publica y comparte",
		body: "Copia tu enlace, comparte por WhatsApp o descarga tu código QR.",
	},
] as const;

export function HowItWorksSection() {
	return (
		<section
			className="border-[var(--mline)] border-t bg-white px-11 py-[76px]"
			id="como-funciona"
		>
			<div className="mb-12 text-center">
				<div className="m-eyebrow mb-3">Cómo funciona</div>
				<h2 className="m-serif font-semibold text-[40px]">
					Del primer clic a tu lista publicada
				</h2>
				<p className="mt-3 text-[15px] text-[var(--mmut)]">
					Los mismos cinco pasos que verás al crear tu wishlist.
				</p>
			</div>
			<div className="relative mx-auto max-w-[760px]">
				<div className="absolute top-[14px] bottom-[14px] left-[26px] z-0 w-[2px] bg-[var(--mline)]" />
				{STEPS.map((s, index) => (
					<div
						className={`relative flex items-center gap-[22px] py-5 ${
							index < STEPS.length - 1
								? "border-[var(--mline)] border-b border-dashed"
								: ""
						}`}
						key={s.n}
					>
						<div
							className="z-[1] m-serif flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full font-bold text-[18px] shadow-[0_8px_20px_rgba(20,60,20,0.22)]"
							style={{ background: s.bg, color: s.fg }}
						>
							{s.n}
						</div>
						{s.thumb === "link" ? (
							<div className="flex h-[72px] w-[92px] shrink-0 items-center justify-center rounded-xl bg-[#173E29] text-[24px]">
								🔗
							</div>
						) : s.thumb ? (
							<img
								alt=""
								className="h-[72px] w-[92px] shrink-0 rounded-xl object-cover"
								decoding="async"
								height={160}
								loading="lazy"
								src={`${s.thumb}?w=200&h=160&fit=crop&auto=format`}
								width={200}
							/>
						) : (
							<div className="h-[72px] w-[92px] shrink-0 rounded-xl bg-[linear-gradient(135deg,#EEF5FB,#8FBEE0)] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.05)]" />
						)}
						<div>
							<div className="m-serif mb-1 font-semibold text-[17.5px] text-[var(--mink)]">
								{s.title}
							</div>
							<div className="text-[13.5px] text-[var(--mmut)] leading-[1.55]">
								{s.body}
							</div>
						</div>
					</div>
				))}
			</div>
		</section>
	);
}
