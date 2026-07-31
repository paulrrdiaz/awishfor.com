/* biome-ignore-all lint/performance/noImgElement: carousel images are URL-sized and only mounted near the viewport. */
"use client";
import { useEffect, useRef, useState } from "react";

import { HERO_FEATURED_OCCASIONS } from "./hero-occasions";

/** Server-visible, keyboard-scrollable occasion examples. */
export function HeroCardCarousel() {
	const carouselRef = useRef<HTMLElement>(null);
	const [imagesEnabled, setImagesEnabled] = useState(false);
	const [activeIndex, setActiveIndex] = useState(0);

	useEffect(() => {
		const carousel = carouselRef.current;
		if (!carousel) return;
		const reducedMotion = window.matchMedia(
			"(prefers-reduced-motion: reduce)",
		).matches;
		let sectionVisible = false;
		let autoplayTimer: ReturnType<typeof setInterval> | undefined;

		const observer = new IntersectionObserver(
			([entry]) => {
				sectionVisible = Boolean(entry?.isIntersecting);
				if (sectionVisible) setImagesEnabled(true);
				syncAutoplay();
			},
			{ rootMargin: "200px 0px", threshold: 0.1 },
		);

		const scrollToIndex = (index: number) => {
			const cards = Array.from(
				carousel.querySelectorAll<HTMLElement>("[data-occasion-card]"),
			);
			const card = cards[index];
			if (!card) return;
			carousel.scrollTo({ behavior: "smooth", left: card.offsetLeft });
		};
		const stopAutoplay = () => {
			if (autoplayTimer) clearInterval(autoplayTimer);
			autoplayTimer = undefined;
		};
		function syncAutoplay() {
			stopAutoplay();
			if (
				reducedMotion ||
				!sectionVisible ||
				document.visibilityState !== "visible"
			)
				return;
			autoplayTimer = setInterval(() => {
				setActiveIndex((current) => {
					const next = (current + 1) % HERO_FEATURED_OCCASIONS.length;
					scrollToIndex(next);
					return next;
				});
			}, 6000);
		}
		const syncActiveCard = () => {
			const cards = Array.from(
				carousel.querySelectorAll<HTMLElement>("[data-occasion-card]"),
			);
			let nearestIndex = 0;
			let nearestDistance = Number.POSITIVE_INFINITY;
			for (const [index, card] of cards.entries()) {
				const distance = Math.abs(card.offsetLeft - carousel.scrollLeft);
				if (distance < nearestDistance) {
					nearestDistance = distance;
					nearestIndex = index;
				}
			}
			setActiveIndex(nearestIndex);
		};

		observer.observe(carousel);
		carousel.addEventListener("scrollend", syncActiveCard);
		document.addEventListener("visibilitychange", syncAutoplay);

		return () => {
			stopAutoplay();
			observer.disconnect();
			carousel.removeEventListener("scrollend", syncActiveCard);
			document.removeEventListener("visibilitychange", syncAutoplay);
		};
	}, []);

	return (
		<div>
			<section
				aria-label="Ejemplos por ocasión"
				className="-mx-2 flex snap-x snap-mandatory gap-4 overflow-x-auto px-2 pb-3 [scrollbar-width:thin]"
				ref={carouselRef}
			>
				{HERO_FEATURED_OCCASIONS.map(({ card: example }, index) => {
					const coverImage = example.photo.startsWith("/")
						? example.photo
						: `${example.photo}?w=480&h=180&fit=crop&auto=format`;
					return (
						<article
							className="min-w-[85%] snap-center overflow-hidden rounded-[22px] shadow-[0_32px_72px_rgba(23,62,41,.18),0_8px_24px_rgba(0,0,0,.06)] sm:min-w-full"
							data-occasion-card
							id={`occasion-example-${index + 1}`}
							key={example.title}
						>
							<div className="relative h-[172px] overflow-hidden">
								{imagesEnabled && (
									<img
										alt={example.title}
										className="absolute inset-0 h-full w-full object-cover"
										height={180}
										loading="lazy"
										src={coverImage}
										width={480}
									/>
								)}
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
												{imagesEnabled && (
													<img
														alt={gift.name}
														className="absolute inset-0 h-full w-full object-cover"
														height={110}
														loading="lazy"
														src={`${gift.image}?w=240&h=110&fit=crop&auto=format`}
														width={240}
													/>
												)}
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
			<nav
				aria-label="Seleccionar ejemplo"
				className="mt-4 flex justify-center gap-2"
			>
				{HERO_FEATURED_OCCASIONS.map((occasion, index) => (
					<a
						aria-current={activeIndex === index ? "true" : undefined}
						aria-label={`Ver ejemplo ${index + 1}: ${occasion.card.title}`}
						className="size-2.5 rounded-full bg-[var(--mline)] transition-colors aria-[current=true]:bg-[var(--mink)] motion-reduce:transition-none"
						href={`#occasion-example-${index + 1}`}
						key={occasion.id}
						onClick={() => setActiveIndex(index)}
					>
						<span className="sr-only">{occasion.card.title}</span>
					</a>
				))}
			</nav>
		</div>
	);
}
