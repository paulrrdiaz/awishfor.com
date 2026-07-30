import Image from "next/image";

import { HERO_OCCASIONS } from "./hero-occasions";

/** Server-visible, keyboard-scrollable occasion examples. */
export function HeroCardCarousel() {
	return (
		<section
			aria-label="Ejemplos por ocasión"
			className="-mx-2 flex snap-x snap-mandatory gap-4 overflow-x-auto px-2 pb-3 [scrollbar-width:thin]"
		>
			{HERO_OCCASIONS.map(({ card: example }, index) => {
				const coverImage = example.photo.startsWith("/")
					? example.photo
					: `${example.photo}?w=480&h=180&fit=crop&auto=format`;
				return (
					<article
						className="min-w-[85%] snap-center overflow-hidden rounded-[22px] shadow-[0_32px_72px_rgba(23,62,41,.18),0_8px_24px_rgba(0,0,0,.06)] sm:min-w-full"
						key={example.title}
					>
						<div className="relative h-[172px] overflow-hidden">
							<Image
								alt={example.title}
								className="object-cover"
								fill
								loading={index === 0 ? "eager" : "lazy"}
								sizes="480px"
								src={coverImage}
							/>
							<div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(20,10,5,.05),rgba(20,10,5,.72))]" />
							<div className="absolute right-0 bottom-[14px] left-0 text-center text-white">
								<div className="m-eyebrow mb-1 text-[8px] opacity-80">
									{example.eyebrow}
								</div>
								<div className="m-serif font-semibold text-[26px] leading-none">
									{example.title}
								</div>
							</div>
						</div>
						<div className="bg-white px-4 pt-[14px] pb-4">
							<div
								className="mb-3 rounded-xl p-[10px] text-center"
								style={{ background: example.accentBg }}
							>
								<div
									className="m-eyebrow mb-[2px] text-[8px] opacity-70"
									style={{ color: example.accentFg }}
								>
									Cuenta regresiva
								</div>
								<div
									className="m-serif font-semibold text-[22px]"
									style={{ color: example.accentFg }}
								>
									{example.countdown}
								</div>
							</div>
							<div className="grid grid-cols-2 gap-[10px]">
								{example.gifts.map((gift) => (
									<div
										className="overflow-hidden rounded-[14px] border border-[var(--mline)]"
										key={gift.name}
									>
										<div className="relative h-[72px]">
											<Image
												alt={gift.name}
												className="object-cover"
												fill
												loading="lazy"
												sizes="150px"
												src={`${gift.image}?w=240&h=110&fit=crop&auto=format`}
											/>
										</div>
										<div className="p-[9px]">
											<div className="m-serif font-semibold text-[#173E29] text-[12px]">
												{gift.name}
											</div>
											<div className="mt-[5px] flex items-center justify-between">
												<span className="font-semibold text-[#173E29] text-[12px]">
													{gift.price}
												</span>
												<span className={`m-badge m-badge-${gift.badge}`}>
													{gift.badgeText}
												</span>
											</div>
										</div>
									</div>
								))}
							</div>
						</div>
						<div className="bg-white px-4 pb-4">
							<span
								className="block w-full rounded-full py-[10px] text-center font-semibold text-[13px]"
								style={{ background: example.btn, color: example.btnFg }}
							>
								Ver regalos disponibles
							</span>
						</div>
					</article>
				);
			})}
		</section>
	);
}
