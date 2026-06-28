"use client";

import Autoplay from "embla-carousel-autoplay";
import { useEffect, useRef, useState } from "react";

import {
	Carousel,
	type CarouselApi,
	CarouselContent,
	CarouselItem,
} from "@/components/ui/carousel";

type Gift = {
	name: string;
	price: string;
	badge: "avail" | "part" | "done";
	badgeText: string;
};

type EventExample = {
	eyebrow: string;
	title: string;
	subtitle: string;
	countdown: string;
	accent: string; // header gradient top color
	fg: string;
	mut: string;
	pill: string;
	pillFg: string;
	ph: string;
	border: string;
	btn: string;
	btnFg: string;
	gifts: [Gift, Gift];
};

const EXAMPLES: EventExample[] = [
	{
		eyebrow: "Baby Shower",
		title: "Esperando a Mateo",
		subtitle: "Andrea & Diego · 12 de agosto",
		countdown: "Faltan 21 días",
		accent: "#EEF5FB",
		fg: "#33425C",
		mut: "#6C7C95",
		pill: "#8FBEE0",
		pillFg: "#1B2A40",
		ph: "#DCEAF6",
		border: "#DCE7F2",
		btn: "#8FBEE0",
		btnFg: "#1B2A40",
		gifts: [
			{
				name: "Cuna de madera",
				price: "$2,400",
				badge: "avail",
				badgeText: "Disponible",
			},
			{
				name: "Set de pañales",
				price: "$320",
				badge: "part",
				badgeText: "2 de 5",
			},
		],
	},
	{
		eyebrow: "Cumpleaños",
		title: "Mis 30 🎉",
		subtitle: "Valentina · 5 de julio",
		countdown: "Faltan 9 días",
		accent: "#F3EFFA",
		fg: "#46394F",
		mut: "#7A6E86",
		pill: "#B79CE0",
		pillFg: "#3A2A52",
		ph: "#E7DEF6",
		border: "#E4DAF2",
		btn: "#B79CE0",
		btnFg: "#3A2A52",
		gifts: [
			{
				name: "Cámara instantánea",
				price: "$1,100",
				badge: "avail",
				badgeText: "Disponible",
			},
			{
				name: "Audífonos",
				price: "$650",
				badge: "done",
				badgeText: "✓ Comprado",
			},
		],
	},
	{
		eyebrow: "Boda",
		title: "María & Tomás",
		subtitle: "14 de septiembre · Hacienda San Ángel",
		countdown: "Faltan 60 días",
		accent: "#F7F2EA",
		fg: "#4A4030",
		mut: "#8A7E66",
		pill: "#BFA06B",
		pillFg: "#3A2E18",
		ph: "#EDE3CF",
		border: "#E7DCC8",
		btn: "#BFA06B",
		btnFg: "#3A2E18",
		gifts: [
			{
				name: "Copas de cristal",
				price: "$320",
				badge: "avail",
				badgeText: "Disponible",
			},
			{
				name: "Vajilla 12 pzs",
				price: "$890",
				badge: "part",
				badgeText: "2 de 4",
			},
		],
	},
	{
		eyebrow: "Nuevo hogar",
		title: "Nuestra casa nueva",
		subtitle: "Lucía & Marco · 20 de octubre",
		countdown: "Faltan 32 días",
		accent: "#EEF4EC",
		fg: "#34433A",
		mut: "#6C7E6F",
		pill: "#9CC4A0",
		pillFg: "#22382A",
		ph: "#DDE9DA",
		border: "#DCE7DA",
		btn: "#9CC4A0",
		btnFg: "#22382A",
		gifts: [
			{
				name: "Vajilla cerámica",
				price: "$1,200",
				badge: "avail",
				badgeText: "Disponible",
			},
			{
				name: "Set de ollas",
				price: "$980",
				badge: "done",
				badgeText: "✓ Comprado",
			},
		],
	},
];

export function HeroCardCarousel() {
	const autoplay = useRef(
		Autoplay({ delay: 3600, stopOnInteraction: false, stopOnMouseEnter: true }),
	);
	const [api, setApi] = useState<CarouselApi>();
	const [current, setCurrent] = useState(0);

	useEffect(() => {
		if (!api) return;
		setCurrent(api.selectedScrollSnap());
		const onSelect = () => setCurrent(api.selectedScrollSnap());
		api.on("select", onSelect);
		return () => {
			api.off("select", onSelect);
		};
	}, [api]);

	return (
		<Carousel
			className="overflow-visible"
			opts={{ loop: true, align: "center" }}
			plugins={[autoplay.current]}
			setApi={setApi}
		>
			<CarouselContent>
				{EXAMPLES.map((ex) => (
					<CarouselItem key={ex.title}>
						<div
							className="relative overflow-hidden rounded-[22px]"
							style={{
								boxShadow:
									"0 32px 72px rgba(23,62,41,.18),0 8px 24px rgba(0,0,0,.06)",
							}}
						>
							<div
								className="px-5 pt-[26px] pb-[18px] text-center"
								style={{
									background: `linear-gradient(180deg,${ex.accent},#FFFFFF)`,
								}}
							>
								<div className="m-eyebrow mb-[6px] text-[9px]">
									{ex.eyebrow}
								</div>
								<div
									className="m-serif font-semibold text-[28px]"
									style={{ color: ex.fg }}
								>
									{ex.title}
								</div>
								<div className="mt-1 text-[12px]" style={{ color: ex.mut }}>
									{ex.subtitle}
								</div>
								<div
									className="mt-3 inline-block rounded-full px-4 py-[7px] font-semibold text-[12px]"
									style={{ background: ex.pill, color: ex.pillFg }}
								>
									{ex.countdown}
								</div>
							</div>
							<div className="grid grid-cols-2 gap-[10px] bg-white px-4 py-[14px]">
								{ex.gifts.map((g) => (
									<div
										className="overflow-hidden rounded-[14px] border"
										key={g.name}
										style={{ borderColor: ex.border }}
									>
										<div
											className="m-ph h-[72px]"
											style={{ backgroundColor: ex.ph }}
										/>
										<div className="p-[9px]">
											<div
												className="m-serif font-semibold text-[12px]"
												style={{ color: ex.fg }}
											>
												{g.name}
											</div>
											<div className="mt-[5px] flex items-center justify-between">
												<span
													className="font-semibold text-[12px]"
													style={{ color: ex.fg }}
												>
													{g.price}
												</span>
												<span className={`m-badge m-badge-${g.badge}`}>
													{g.badgeText}
												</span>
											</div>
										</div>
									</div>
								))}
							</div>
							<div className="bg-white px-4 pb-4">
								<button
									className="w-full rounded-full py-[10px] font-semibold text-[13px]"
									style={{ background: ex.btn, color: ex.btnFg }}
									type="button"
								>
									Ver regalos disponibles
								</button>
							</div>
						</div>
					</CarouselItem>
				))}
			</CarouselContent>
			<div className="mt-5 flex justify-center gap-2">
				{EXAMPLES.map((ex, i) => (
					<button
						aria-current={i === current}
						aria-label={`Ir al ejemplo: ${ex.eyebrow}`}
						className={`h-2 rounded-full transition-all ${
							i === current
								? "w-6 bg-[var(--mink)]"
								: "w-2 bg-[var(--mline)] hover:bg-[var(--mrose)]"
						}`}
						key={ex.title}
						onClick={() => api?.scrollTo(i)}
						type="button"
					/>
				))}
			</div>
		</Carousel>
	);
}
