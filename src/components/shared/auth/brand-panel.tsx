import { Check, ChevronLeft, ChevronRight, Star } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";

const GRADIENTS = {
	wishlist:
		"radial-gradient(at 18% 12%, rgba(146,201,112,0.55) 0px, transparent 55%), radial-gradient(at 85% 5%, rgba(205,222,140,0.35) 0px, transparent 50%), radial-gradient(at 88% 90%, rgba(180,155,215,0.38) 0px, transparent 55%), radial-gradient(at 8% 88%, rgba(140,185,220,0.35) 0px, transparent 50%)",
	benefits:
		"radial-gradient(at 18% 12%, rgba(180,155,215,0.38) 0px, transparent 55%), radial-gradient(at 85% 5%, rgba(140,185,220,0.35) 0px, transparent 50%), radial-gradient(at 88% 90%, rgba(146,201,112,0.55) 0px, transparent 55%), radial-gradient(at 8% 88%, rgba(205,222,140,0.35) 0px, transparent 50%)",
} as const;

const BENEFITS = [
	{
		title: "Gratis y sin comisiones",
		description: "Nunca cobramos a ti ni a tus invitados.",
	},
	{
		title: "Agrega de cualquier tienda",
		description: "Pega un enlace y llenamos nombre, foto y precio.",
	},
	{
		title: "Comparte por enlace, WhatsApp o QR",
		description: "Sin duplicados: cada regalo se marca al comprarse.",
	},
] as const;

interface BrandPanelProps {
	variant?: "wishlist" | "benefits";
}

/**
 * Static, presentational brand panel for the auth split layout. No data
 * fetching — the wishlist preview, testimonial, and stats are fixed
 * placeholders, not live data, and the carousel arrows are decorative only.
 */
export function BrandPanel({ variant = "wishlist" }: BrandPanelProps) {
	return (
		<div
			className="relative flex h-full w-full flex-col justify-center gap-14 overflow-hidden bg-[#fdfdfa] px-12 py-14 text-foreground"
			style={{ backgroundImage: GRADIENTS[variant] }}
		>
			{variant === "wishlist" ? <WishlistContent /> : <BenefitsContent />}
		</div>
	);
}

function WishlistContent() {
	return (
		<>
			<div className="flex w-full flex-col gap-8">
				<div className="flex max-w-xs flex-col gap-2">
					<p className="font-mono text-foreground/60 text-xs uppercase tracking-[0.2em]">
						Así se ve tu wishlist
					</p>
					<p className="text-balance font-serif text-2xl text-foreground leading-snug">
						Un lugar hermoso para cada momento especial.
					</p>
				</div>

				<Card className="mx-auto w-[58%] -rotate-2 overflow-hidden rounded-2xl border-border/40 shadow-[0_32px_60px_rgba(23,62,41,0.24),0_10px_20px_rgba(23,62,41,0.1)]">
					<CardHeader className="gap-1 border-border/60 border-b bg-accent px-5 py-4">
						<p className="font-mono text-[11px] text-accent-foreground/70 uppercase tracking-[0.2em]">
							Baby shower
						</p>
						<p className="font-serif text-foreground text-xl">
							Esperando a Mateo
						</p>
						<p className="text-muted-foreground text-sm">
							Daniela &amp; Andrés · 14 dic
						</p>
					</CardHeader>
					<CardContent className="flex flex-col gap-4 px-5 py-5">
						<div className="flex items-center gap-3">
							<div className="size-10 shrink-0 rounded-lg bg-muted" />
							<div className="flex flex-1 flex-col gap-1.5">
								<p className="text-foreground text-sm">Cuna de madera</p>
								<div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
									<div className="h-full w-2/3 rounded-full bg-[#7797b5]" />
								</div>
							</div>
						</div>
						<button
							className="w-full rounded-full bg-[#7797b5] py-2 font-medium text-sm text-white"
							type="button"
						>
							Marcar como comprado
						</button>
					</CardContent>
				</Card>
			</div>

			<Card className="w-full gap-3 rounded-2xl border-border/40 bg-card shadow-[0_24px_48px_rgba(20,30,50,0.1)]">
				<CardContent className="flex flex-col gap-3 p-5">
					<div className="flex items-center gap-0.5 text-amber-400">
						{Array.from({ length: 5 }).map((_, i) => (
							<Star
								className="size-3 fill-current"
								key={`star-${
									// biome-ignore lint/suspicious/noArrayIndexKey: static, fixed-length decorative rating
									i
								}`}
							/>
						))}
					</div>
					<p className="text-balance font-serif text-foreground text-lg italic leading-snug">
						«Creé la lista del baby shower en diez minutos y todos supieron
						exactamente qué regalar.»
					</p>
					<div className="flex items-end justify-between">
						<div>
							<p className="font-medium text-foreground text-sm">
								Daniela Rivas
							</p>
							<p className="text-muted-foreground text-sm">
								Mamá primeriza · Lima
							</p>
						</div>
						<div className="flex items-center gap-2 text-muted-foreground">
							<span className="flex size-7 items-center justify-center rounded-full border border-border">
								<ChevronLeft className="size-3.5" />
							</span>
							<span className="flex size-7 items-center justify-center rounded-full border border-border">
								<ChevronRight className="size-3.5" />
							</span>
						</div>
					</div>
				</CardContent>
			</Card>
		</>
	);
}

function BenefitsContent() {
	return (
		<div className="flex w-full flex-col gap-10">
			<div className="flex flex-col gap-3">
				<p className="font-mono text-foreground/60 text-xs uppercase tracking-[0.2em]">
					Todo incluido, siempre gratis
				</p>
				<p className="text-balance font-serif text-2xl text-foreground leading-snug">
					Regalos de cualquier tienda, en una sola página que puedes compartir.
				</p>
			</div>

			<div className="flex flex-col gap-5">
				{BENEFITS.map((benefit) => (
					<div className="flex items-start gap-3" key={benefit.title}>
						<div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-card shadow-sm">
							<Check className="size-4 text-accent-foreground" />
						</div>
						<div className="flex flex-col gap-0.5">
							<p className="font-medium text-foreground text-sm">
								{benefit.title}
							</p>
							<p className="text-muted-foreground text-sm">
								{benefit.description}
							</p>
						</div>
					</div>
				))}
			</div>

			<div className="flex w-fit items-center gap-3 rounded-full bg-card/90 py-3 pr-5 pl-4 shadow-sm">
				<div className="flex -space-x-2">
					<span className="size-6 rounded-full border-2 border-card bg-[#9bcf8e]" />
					<span className="size-6 rounded-full border-2 border-card bg-[#8ea9d6]" />
					<span className="size-6 rounded-full border-2 border-card bg-[#b79ce0]" />
				</div>
				<p className="text-foreground text-sm">
					<span className="font-medium">+10 mil listas</span> creadas este año ·{" "}
					<span className="font-medium">4.9★</span> de satisfacción
				</p>
			</div>
		</div>
	);
}
