"use client";

import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";
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
	image: string;
};

type EventExample = {
	eyebrow: string;
	title: string;
	countdown: string;
	photo: string;
	accentBg: string;
	accentFg: string;
	btn: string;
	btnFg: string;
	gifts: [Gift, Gift];
};

const EXAMPLES: EventExample[] = [
	{
		eyebrow: "Baby Shower · 12 de agosto",
		title: "Esperando a Mateo",
		countdown: "Faltan 21 días",
		photo: "https://images.unsplash.com/photo-1492725764893-90b379c2b6e7",
		accentBg: "#EEF5FB",
		accentFg: "#1B2A40",
		btn: "#8FBEE0",
		btnFg: "#1B2A40",
		gifts: [
			{
				name: "Cuna de madera",
				price: "$2,400",
				badge: "avail",
				badgeText: "Disponible",
				image: "https://images.unsplash.com/photo-1542901689-8917f44e3541",
			},
			{
				name: "Body de algodón",
				price: "$320",
				badge: "part",
				badgeText: "2 de 5",
				image: "https://images.unsplash.com/photo-1622290319146-7b63df48a635",
			},
		],
	},
	{
		eyebrow: "Cumpleaños · 5 de julio",
		title: "Mis 30 🎉",
		countdown: "Faltan 9 días",
		photo: "https://images.unsplash.com/photo-1503266980949-bd30d04d0b7a",
		accentBg: "#F3EFFA",
		accentFg: "#3A2A52",
		btn: "#B79CE0",
		btnFg: "#3A2A52",
		gifts: [
			{
				name: "Cámara instantánea",
				price: "$1,100",
				badge: "avail",
				badgeText: "Disponible",
				image: "https://images.unsplash.com/photo-1516962126636-27ad087061cc",
			},
			{
				name: "Audífonos",
				price: "$650",
				badge: "done",
				badgeText: "✓ Comprado",
				image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b",
			},
		],
	},
	{
		eyebrow: "Boda · 14 de septiembre",
		title: "María & Tomás",
		countdown: "Faltan 60 días",
		photo: "https://images.unsplash.com/photo-1777651929448-055c21fef72e",
		accentBg: "#F7F2EA",
		accentFg: "#3A2E18",
		btn: "#BFA06B",
		btnFg: "#3A2E18",
		gifts: [
			{
				name: "Copas de cristal",
				price: "$320",
				badge: "avail",
				badgeText: "Disponible",
				image: "https://images.unsplash.com/photo-1546567379-1af2e0d527e8",
			},
			{
				name: "Vajilla 12 pzs",
				price: "$890",
				badge: "part",
				badgeText: "2 de 4",
				image: "https://images.unsplash.com/photo-1737681707230-04eebda96529",
			},
		],
	},
	{
		eyebrow: "Nuevo hogar · 20 de octubre",
		title: "Nuestra casa nueva",
		countdown: "Faltan 32 días",
		photo: "https://images.unsplash.com/photo-1758523671285-9ff3f4e0ff38",
		accentBg: "#EEF4EC",
		accentFg: "#22382A",
		btn: "#9CC4A0",
		btnFg: "#22382A",
		gifts: [
			{
				name: "Vajilla cerámica",
				price: "$1,200",
				badge: "avail",
				badgeText: "Disponible",
				image: "https://images.unsplash.com/photo-1525973779373-015bdf68e579",
			},
			{
				name: "Set de ollas",
				price: "$980",
				badge: "done",
				badgeText: "✓ Comprado",
				image: "https://images.unsplash.com/photo-1604414499020-f9ac575bc5ec",
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
							<div className="relative h-[172px] w-full overflow-hidden">
								<Image
									alt={ex.title}
									className="object-cover"
									fill
									sizes="480px"
									src={`${ex.photo}?w=480&h=180&fit=crop&auto=format`}
								/>
								<div
									className="absolute inset-0"
									style={{
										background:
											"linear-gradient(to bottom,rgba(20,10,5,.05),rgba(20,10,5,.72))",
									}}
								/>
								<div className="absolute right-0 bottom-[14px] left-0 text-center text-white">
									<div className="m-eyebrow mb-1 text-[8px] opacity-80">
										{ex.eyebrow}
									</div>
									<div className="m-serif font-semibold text-[26px] leading-none">
										{ex.title}
									</div>
								</div>
							</div>
							<div className="bg-white px-4 pt-[14px] pb-4">
								<div
									className="mb-3 rounded-xl p-[10px] text-center"
									style={{ background: ex.accentBg }}
								>
									<div
										className="m-eyebrow mb-[2px] text-[8px] opacity-70"
										style={{ color: ex.accentFg }}
									>
										Cuenta regresiva
									</div>
									<div
										className="m-serif font-semibold text-[22px]"
										style={{ color: ex.accentFg }}
									>
										{ex.countdown}
									</div>
								</div>
								<div className="grid grid-cols-2 gap-[10px]">
									{ex.gifts.map((g) => (
										<div
											className="overflow-hidden rounded-[14px] border border-[var(--mline)]"
											key={g.name}
										>
											<div className="relative h-[72px] w-full">
												<Image
													alt={g.name}
													className="object-cover"
													fill
													sizes="150px"
													src={`${g.image}?w=240&h=110&fit=crop&auto=format`}
												/>
											</div>
											<div className="p-[9px]">
												<div className="m-serif font-semibold text-[#173E29] text-[12px]">
													{g.name}
												</div>
												<div className="mt-[5px] flex items-center justify-between">
													<span className="font-semibold text-[#173E29] text-[12px]">
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
						aria-label={`Ir al ejemplo: ${ex.title}`}
						className="flex h-11 w-11 items-center justify-center"
						key={ex.title}
						onClick={() => api?.scrollTo(i)}
						type="button"
					>
						<span
							className={`h-2 rounded-full transition-all ${
								i === current
									? "w-6 bg-[var(--mink)]"
									: "w-2 bg-[var(--mline)] hover:bg-[var(--mrose)]"
							}`}
						/>
					</button>
				))}
			</div>
		</Carousel>
	);
}
