/* biome-ignore-all lint/performance/noImgElement: step thumbnails are URL-sized and lazy, outside the first fold. */

const STEPS = [
	{
		n: "1",
		bg: "#BCE25A",
		fg: "#1B3A12",
		thumb: "https://images.unsplash.com/photo-1555252333-9f8e92e65df9",
		title: "Elige el tipo de evento",
		body: "Baby shower, boda, cumpleaños, nuevo hogar o una lista general.",
		riseRange: "[--m-rise-start:cover_0%] [--m-rise-end:cover_35%]",
	},
	{
		n: "2",
		bg: "#9ECD6E",
		fg: "#173E29",
		thumb: "https://images.unsplash.com/photo-1519741497674-611481863552",
		title: "Ponle nombre y elige tu enlace",
		body: "El título, los anfitriones y una URL propia para compartir.",
		riseRange: "[--m-rise-start:cover_4%] [--m-rise-end:cover_39%]",
	},
	{
		n: "3",
		bg: "#7FB069",
		fg: "#fff",
		thumb: null,
		title: "Elige tu tema y personalízalo",
		body: "Siete estilos con vista previa en vivo mientras decides.",
		riseRange: "[--m-rise-start:cover_8%] [--m-rise-end:cover_43%]",
	},
	{
		n: "4",
		bg: "#56A86B",
		fg: "#fff",
		thumb: "https://images.unsplash.com/photo-1592194996308-7b43878e84a6",
		title: "Agrega tus regalos",
		body: "Pega el enlace de cualquier tienda; nosotros traemos foto, nombre y precio.",
		riseRange: "[--m-rise-start:cover_12%] [--m-rise-end:cover_47%]",
	},
	{
		n: "5",
		bg: "#173E29",
		fg: "#D7F09E",
		thumb: "link",
		title: "Publica y comparte",
		body: "Copia tu enlace, comparte por WhatsApp o descarga tu código QR.",
		riseRange: "[--m-rise-start:cover_16%] [--m-rise-end:cover_51%]",
	},
] as const;

export function HowItWorksSection() {
	return (
		<section
			className="border-[var(--mline)] border-t bg-white px-[22px] py-11 lg:px-11 lg:py-[76px]"
			id="como-funciona"
		>
			<div className="mb-6 text-center lg:mb-12">
				<div className="m-eyebrow mb-[9px] lg:mb-3">Cómo funciona</div>
				<h2 className="m-serif font-semibold text-[25px] lg:text-[40px]">
					Del primer clic a tu lista publicada
				</h2>
				<p className="mt-3 hidden text-[15px] text-[var(--mmut)] lg:block">
					Los mismos cinco pasos que verás al crear tu wishlist.
				</p>
			</div>
			<div className="relative mx-auto max-w-[760px]">
				<div className="absolute top-[14px] bottom-[14px] left-[26px] z-0 hidden w-[2px] bg-[var(--mline)] lg:block" />
				{STEPS.map((s, index) => (
					<div
						className={`relative m-scroll-rise flex items-center gap-3.5 py-1.5 lg:gap-[22px] lg:py-5 ${s.riseRange} ${
							index < STEPS.length - 1
								? "lg:border-[var(--mline)] lg:border-b lg:border-dashed"
								: ""
						}`}
						key={s.n}
					>
						<div
							className="z-[1] m-serif flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold text-[15px] shadow-[0_6px_16px_rgba(20,60,20,0.25)] lg:h-[52px] lg:w-[52px] lg:text-[18px] lg:shadow-[0_8px_20px_rgba(20,60,20,0.22)]"
							style={{ background: s.bg, color: s.fg }}
						>
							{s.n}
						</div>
						<div className="flex flex-1 items-center gap-2.5 rounded-2xl border border-[var(--mline)] bg-white p-3 lg:contents lg:flex-none lg:gap-0 lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0">
							{s.thumb === "link" ? (
								<div className="flex h-11 w-14 shrink-0 items-center justify-center rounded-[9px] bg-[#173E29] text-[16px] lg:h-[72px] lg:w-[92px] lg:rounded-xl lg:text-[24px]">
									🔗
								</div>
							) : s.thumb ? (
								<img
									alt=""
									className="h-11 w-14 shrink-0 rounded-[9px] object-cover lg:h-[72px] lg:w-[92px] lg:rounded-xl"
									decoding="async"
									height={160}
									loading="lazy"
									src={`${s.thumb}?w=200&h=160&fit=crop&auto=format`}
									width={200}
								/>
							) : (
								<div className="h-11 w-14 shrink-0 rounded-[9px] bg-[linear-gradient(135deg,#EEF5FB,#8FBEE0)] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.05)] lg:h-[72px] lg:w-[92px] lg:rounded-xl" />
							)}
							<div>
								<div className="m-serif mb-[3px] font-semibold text-[14px] text-[var(--mink)] lg:mb-1 lg:text-[17.5px]">
									{s.title}
								</div>
								<div className="text-[11.5px] text-[var(--mmut)] leading-[1.5] lg:text-[13.5px] lg:leading-[1.55]">
									{s.body}
								</div>
							</div>
						</div>
					</div>
				))}
			</div>
		</section>
	);
}
