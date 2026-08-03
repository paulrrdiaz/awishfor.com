import { MarketingContainer } from "./marketing-container";
import { OccasionMediaController } from "./occasion-media-controller";

const OCCASIONS = [
	{
		eventType: "wedding",
		label: "Boda",
		subtitle: "Vajilla, viajes y menaje",
		photo: "https://images.unsplash.com/photo-1519741497674-611481863552",
	},
	{
		eventType: "baby_shower",
		label: "Baby Shower",
		subtitle: "Da la bienvenida con cariño",
		photo: "https://images.unsplash.com/photo-1555252333-9f8e92e65df9",
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

const CARD_LAYOUTS = {
	baby_shower: "h-[158px] md:col-start-2 md:row-start-1 md:h-auto",
	wedding:
		"col-span-2 h-[280px] md:col-span-1 md:row-span-2 md:row-start-1 md:h-auto",
	birthday: "h-[158px] md:col-start-3 md:row-start-1 md:h-auto",
	housewarming: "h-[158px] md:col-start-2 md:row-start-2 md:h-auto",
} as const;

export function OccasionPickerSection() {
	return (
		<section
			className="border-[var(--mline)] border-t bg-white px-6 py-16 sm:px-10 lg:py-[66px]"
			id="ocasiones"
		>
			<MarketingContainer>
				<div className="mx-auto mb-9 max-w-[600px] text-center md:mb-10">
					<div className="m-eyebrow mb-3">Elige tu ocasión</div>
					<h2 className="m-serif font-semibold text-[34px] leading-[1.1] sm:text-[40px]">
						¿Qué estás celebrando?
					</h2>
					<p className="mt-3 text-[14px] text-[var(--mmut)] leading-[1.55] sm:text-[15px] sm:leading-[1.6]">
						Empieza con una plantilla pensada para tu momento. Tema, colores y
						regalos sugeridos, listos en segundos.
					</p>
				</div>
				<div
					className="grid grid-cols-2 gap-3 md:grid-cols-[1.3fr_1fr_1fr] md:grid-rows-[repeat(2,157px)]"
					data-occasion-grid
				>
					{OCCASIONS.map((o) => {
						const isWedding = o.eventType === "wedding";

						return (
							<a
								aria-label={`Crear una lista para ${o.label}`}
								className={`card-lift group relative block cursor-pointer overflow-hidden rounded-[15px] shadow-[0_10px_30px_rgba(20,60,20,0.1)] ${CARD_LAYOUTS[o.eventType]}`}
								href={`/create?type=${o.eventType}`}
								key={o.eventType}
							>
								{/* biome-ignore lint/performance/noImgElement: src is assigned only after intersection; next/image requires an eager src. */}
								<img
									alt=""
									className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
									data-deferred-src={`${o.photo}?w=760&h=680&fit=crop&auto=format`}
									decoding="async"
									height={680}
									loading="lazy"
									width={760}
								/>
								<noscript>
									{/* biome-ignore lint/performance/noImgElement: this is the no-JavaScript fallback for the deferred image. */}
									<img
										alt=""
										className="absolute inset-0 h-full w-full object-cover"
										height={680}
										loading="lazy"
										src={`${o.photo}?w=760&h=680&fit=crop&auto=format`}
										width={760}
									/>
								</noscript>
								<div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(15,45,25,.03)_24%,rgba(15,45,25,.78)_100%)]" />
								<div
									className={`absolute inset-x-0 bottom-0 ${
										isWedding ? "p-[22px]" : "p-3"
									}`}
								>
									<div
										className={`m-serif font-semibold text-white ${
											isWedding ? "mb-1 text-[24px]" : "text-[16px]"
										}`}
									>
										{o.label}
									</div>
									<div
										className={`text-white/85 ${
											isWedding ? "mb-[13px] text-[11px]" : "text-[10px]"
										}`}
									>
										{o.subtitle}
									</div>
									{isWedding && (
										<span className="inline-flex rounded-full bg-[var(--mlime)] px-3.5 py-2 font-bold text-[#1B3A12] text-[10px]">
											Crear mi lista →
										</span>
									)}
								</div>
							</a>
						);
					})}
					<a
						aria-label="Crear una wishlist general"
						className="card-lift col-span-2 flex h-[158px] flex-col items-center justify-center rounded-[15px] bg-[#1D432D] px-4 text-center text-white md:col-start-3 md:row-start-2 md:h-auto"
						href="/create?type=general"
					>
						<span aria-hidden="true" className="mb-2 text-[24px] leading-none">
							✦
						</span>
						<span className="m-serif font-semibold text-[16px]">
							Wishlist general
						</span>
						<span className="mt-1 text-[10px] text-white/75">
							Para cualquier momento →
						</span>
					</a>
				</div>
			</MarketingContainer>
			<OccasionMediaController />
		</section>
	);
}
