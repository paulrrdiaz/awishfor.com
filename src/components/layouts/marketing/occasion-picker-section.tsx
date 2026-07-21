import Image from "next/image";
import Link from "next/link";

const OCCASIONS = [
	{
		eventType: "baby_shower",
		label: "Baby Shower",
		subtitle: "Da la bienvenida con cariño",
		photo: "https://images.unsplash.com/photo-1555252333-9f8e92e65df9",
	},
	{
		eventType: "wedding",
		label: "Boda",
		subtitle: "Vajilla, viajes y menaje",
		photo: "https://images.unsplash.com/photo-1519741497674-611481863552",
	},
	{
		eventType: "birthday",
		label: "Cumpleaños",
		subtitle: "Deseos para su día especial",
		photo: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d",
	},
	{
		eventType: "housewarming",
		label: "Nuevo hogar",
		subtitle: "Todo para empezar juntos",
		photo: "https://images.unsplash.com/photo-1484101403633-562f891dc89a",
	},
] as const;

export function OccasionPickerSection() {
	return (
		<section
			className="border-[var(--mline)] border-t bg-white px-11 py-[76px]"
			id="ocasiones"
		>
			<div className="mx-auto mb-11 max-w-[600px] text-center" data-reveal>
				<div className="m-eyebrow mb-3">Elige tu ocasión</div>
				<h2 className="m-serif font-semibold text-[40px] leading-[1.1]">
					¿Qué estás celebrando?
				</h2>
				<p className="mt-3 text-[15px] text-[var(--mmut)] leading-[1.6]">
					Empieza con una plantilla pensada para tu momento. Tema, colores y
					regalos sugeridos, listos en segundos.
				</p>
			</div>
			<div
				className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
				data-reveal-stagger
			>
				{OCCASIONS.map((o) => (
					<Link
						className="card-lift group relative block h-[300px] cursor-pointer overflow-hidden rounded-[20px] shadow-[0_10px_30px_rgba(20,60,20,0.1)]"
						href={`/create?type=${o.eventType}`}
						key={o.eventType}
					>
						<Image
							alt=""
							className="object-cover transition-transform duration-500 group-hover:scale-105"
							fill
							sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
							src={`${o.photo}?w=340&h=420&fit=crop&auto=format`}
						/>
						<div
							className="absolute inset-0"
							style={{
								background:
									"linear-gradient(to bottom,rgba(15,45,25,.05) 30%,rgba(15,45,25,.82))",
							}}
						/>
						<div className="absolute inset-x-0 bottom-0 p-5">
							<div className="m-serif mb-1 font-semibold text-[22px] text-white">
								{o.label}
							</div>
							<div className="mb-[14px] text-[12px] text-white/80">
								{o.subtitle}
							</div>
							<span className="inline-flex items-center gap-[7px] rounded-full bg-[var(--mlime)] px-4 py-[9px] font-bold text-[#1B3A12] text-[12.5px]">
								Crear mi lista →
							</span>
						</div>
					</Link>
				))}
			</div>
			<div className="mt-6 text-center" data-reveal>
				<span className="text-[13.5px] text-[var(--mmut)]">
					¿Otra ocasión?{" "}
					<Link className="font-semibold text-[var(--msky)]" href="/create">
						Crea una wishlist general →
					</Link>
				</span>
			</div>
		</section>
	);
}
