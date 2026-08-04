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

const SMALL_TILE_LAYOUTS = {
	baby_shower: "lg:col-start-2 lg:row-start-1",
	birthday: "lg:col-start-3 lg:row-start-1",
	housewarming: "lg:col-start-2 lg:row-start-2",
} as const;

export function OccasionPickerSection() {
	const [lead, ...smallOccasions] = OCCASIONS;

	return (
		<section
			className="border-[var(--mline)] border-t bg-white px-[22px] py-11 lg:px-11 lg:py-[76px]"
			id="ocasiones"
		>
			<MarketingContainer>
				<div className="mx-auto mb-6 max-w-[600px] text-center lg:mb-11">
					<div className="m-eyebrow mb-[9px] lg:mb-3">Elige tu ocasión</div>
					<h2 className="m-serif font-semibold text-[27px] leading-[1.1] lg:text-[40px]">
						¿Qué estás celebrando?
					</h2>
					<p className="mt-3 hidden text-[15px] text-[var(--mmut)] leading-[1.6] lg:block">
						Empieza con una plantilla pensada para tu momento. Tema, colores y
						regalos sugeridos, listos en segundos.
					</p>
				</div>
				<div
					className="flex flex-col gap-3 lg:grid lg:h-[392px] lg:grid-cols-[1.3fr_1fr_1fr] lg:grid-rows-2 lg:gap-4"
					data-occasion-grid
				>
					<a
						aria-label={`Crear una lista para ${lead.label}`}
						className="card-lift group relative block h-[172px] cursor-pointer overflow-clip rounded-2xl shadow-[0_8px_22px_rgba(20,60,20,0.1)] lg:row-span-2 lg:h-auto lg:rounded-[20px] lg:shadow-[0_10px_30px_rgba(20,60,20,0.1)]"
						href={`/create?type=${lead.eventType}`}
					>
						{/* biome-ignore lint/performance/noImgElement: src is assigned only after intersection; next/image requires an eager src. */}
						<img
							alt=""
							className="absolute inset-0 m-parallax h-full w-full scale-[1.08] object-cover transition-transform duration-500 [--m-par-from:-3%] [--m-par-to:3%] group-hover:scale-[1.1]"
							data-deferred-src={`${lead.photo}?w=760&h=780&fit=crop&auto=format`}
							decoding="async"
							height={780}
							loading="lazy"
							width={760}
						/>
						<noscript>
							{/* biome-ignore lint/performance/noImgElement: this is the no-JavaScript fallback for the deferred image. */}
							<img
								alt=""
								className="absolute inset-0 h-full w-full object-cover"
								height={780}
								loading="lazy"
								src={`${lead.photo}?w=760&h=780&fit=crop&auto=format`}
								width={760}
							/>
						</noscript>
						<div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(15,45,25,.03)_30%,rgba(15,45,25,.82)_100%)]" />
						<div className="absolute inset-x-0 bottom-0 p-3.5 lg:p-[26px]">
							<div className="m-serif font-semibold text-[18px] text-white lg:mb-1 lg:text-[28px]">
								{lead.label}
							</div>
							<div className="hidden text-[13px] text-white/85 lg:mb-4 lg:block">
								{lead.subtitle}
							</div>
							<span className="mt-2 inline-flex rounded-full bg-[var(--mlime)] px-[11px] py-[5px] font-bold text-[#1B3A12] text-[10.5px] lg:mt-0 lg:px-4 lg:py-[9px] lg:text-[12.5px]">
								Crear mi lista →
							</span>
						</div>
					</a>

					<div className="grid grid-cols-2 gap-3 lg:contents">
						{smallOccasions.map((o) => (
							<a
								aria-label={`Crear una lista para ${o.label}`}
								className={`card-lift group relative block h-[130px] cursor-pointer overflow-hidden rounded-2xl shadow-[0_8px_22px_rgba(20,60,20,0.1)] lg:h-auto lg:rounded-[18px] lg:shadow-[0_10px_30px_rgba(20,60,20,0.1)] ${SMALL_TILE_LAYOUTS[o.eventType]}`}
								href={`/create?type=${o.eventType}`}
								key={o.eventType}
							>
								{/* biome-ignore lint/performance/noImgElement: src is assigned only after intersection; next/image requires an eager src. */}
								<img
									alt=""
									className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
									data-deferred-src={`${o.photo}?w=340&h=340&fit=crop&auto=format`}
									decoding="async"
									height={340}
									loading="lazy"
									width={340}
								/>
								<noscript>
									{/* biome-ignore lint/performance/noImgElement: this is the no-JavaScript fallback for the deferred image. */}
									<img
										alt=""
										className="absolute inset-0 h-full w-full object-cover"
										height={340}
										loading="lazy"
										src={`${o.photo}?w=340&h=340&fit=crop&auto=format`}
										width={340}
									/>
								</noscript>
								<div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(15,45,25,.03)_40%,rgba(15,45,25,.82)_100%)]" />
								<div className="absolute inset-x-0 bottom-0 p-[11px] lg:p-4">
									<div className="m-serif font-semibold text-[14px] text-white lg:text-[17px]">
										{o.label}
									</div>
									<div className="hidden text-[11px] text-white/80 lg:mt-0.5 lg:block">
										{o.subtitle}
									</div>
								</div>
							</a>
						))}
						<a
							aria-label="Crear una wishlist general"
							className="card-lift flex h-[130px] flex-col items-center justify-center rounded-2xl bg-[#173E29] p-2 text-center text-white shadow-[0_8px_22px_rgba(20,60,20,0.1)] lg:col-start-3 lg:row-start-2 lg:h-auto lg:rounded-[18px] lg:p-3.5 lg:shadow-[0_10px_30px_rgba(20,60,20,0.1)]"
							href="/create?type=general"
						>
							<span
								aria-hidden="true"
								className="mb-0.5 text-[16px] leading-none lg:mb-1 lg:text-[20px]"
							>
								✦
							</span>
							<span className="m-serif font-semibold text-[#D7F09E] text-[12.5px] lg:text-[15px]">
								Wishlist general
							</span>
							<span className="mt-[3px] hidden text-[10.5px] text-white/65 lg:block">
								Para cualquier momento →
							</span>
						</a>
					</div>
				</div>
			</MarketingContainer>
			<OccasionMediaController />
		</section>
	);
}
