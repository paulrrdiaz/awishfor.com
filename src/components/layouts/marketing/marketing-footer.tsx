/* biome-ignore-all lint/performance/noImgElement: the local SVG is already optimized and lazy. */
import { AtSign, Camera, MessageCircle } from "lucide-react";
import { SUPPORT_EMAIL } from "@/config/contact";
import { MarketingContainer } from "./marketing-container";
import { NewsletterForm } from "./newsletter-form";

const COLUMNS = [
	{
		title: "Producto",
		links: [
			{ label: "Cómo funciona", href: "#como-funciona" },
			{ label: "Temas y estilos", href: "#temas" },
			{ label: "Ver ejemplos", href: "#ejemplo" },
			{ label: "Preguntas frecuentes", href: "#faq" },
		],
	},
	{
		title: "Ocasiones",
		links: [
			{ label: "Baby Shower", href: "/create" },
			{ label: "Cumpleaños", href: "/create" },
			{ label: "Boda", href: "/create" },
			{ label: "Nuevo hogar", href: "/create" },
		],
	},
	{
		title: "Legal",
		links: [
			{ label: "Términos de uso", href: "/terms" },
			{ label: "Privacidad", href: "/privacy" },
			{ label: "Contacto", href: `mailto:${SUPPORT_EMAIL}` },
		],
	},
];

const MOBILE_COLUMNS = [
	{
		title: "Producto",
		links: [
			{ label: "Cómo funciona", href: "#como-funciona" },
			{ label: "Temas", href: "#temas" },
		],
	},
	{
		title: "Ocasiones",
		links: [
			{ label: "Boda", href: "/create" },
			{ label: "Baby shower", href: "/create" },
		],
	},
	{
		title: "Legal",
		links: [
			{ label: "Privacidad", href: "/privacy" },
			{ label: "Términos", href: "/terms" },
		],
	},
];

const SOCIALS = [
	{ icon: AtSign, label: "X" },
	{ icon: Camera, label: "Instagram" },
	{ icon: MessageCircle, label: "WhatsApp" },
];

export function MarketingFooter() {
	return (
		<footer className="bg-[#173E29] lg:bg-[#EEF9E6]">
			<MarketingContainer className="lg:pt-10">
				<section className="flex flex-col gap-3 border-white/[.12] border-b px-[22px] py-6 text-white lg:mb-10 lg:flex-row lg:items-center lg:justify-between lg:gap-6 lg:rounded-[20px] lg:border-0 lg:bg-[linear-gradient(135deg,#DCEFC9,#EEF9E6)] lg:px-[34px] lg:py-[26px] lg:text-[var(--mink)]">
					<div>
						<div className="m-serif mb-[3px] font-semibold text-[16px] lg:mb-1 lg:text-[19px]">
							Ideas para tu próximo evento
						</div>
						<div className="text-[12px] text-white/60 lg:text-[13px] lg:text-[var(--mmut)]">
							<span className="lg:hidden">Un correo al mes, sin spam.</span>
							<span className="hidden lg:inline">
								Un correo al mes, con inspiración real. Sin spam.
							</span>
						</div>
					</div>
					<NewsletterForm />
				</section>

				<div className="bg-[#EEF9E6] px-[22px] pt-7 lg:bg-transparent lg:px-0 lg:pt-0">
					<div className="grid grid-cols-1 gap-7 border-[var(--mline)] border-b pb-5 md:grid-cols-2 md:gap-10 md:pb-10 lg:grid-cols-[1.6fr_1fr_1fr_1fr] lg:pb-10">
						{/* brand */}
						<div>
							<a
								aria-label="A Wish For"
								className="mb-[10px] inline-flex rounded-md focus-visible:outline-2 focus-visible:outline-[var(--mink)] focus-visible:outline-offset-4"
								href="/"
							>
								<img
									alt="A Wish For"
									className="h-32 w-auto lg:h-32"
									height={1024}
									loading="lazy"
									src="/assets/logo.svg"
									width={1024}
								/>
							</a>
							<p className="mb-4 max-w-[240px] text-[12.5px] text-[var(--mmut)] leading-[1.6] lg:mb-[22px] lg:text-[13.5px] lg:leading-[1.7]">
								Listas de deseos hermosas para tus momentos más especiales.
								Gratis, sin comisiones.
							</p>
							<div className="hidden gap-[10px] md:flex">
								{SOCIALS.map((s) => (
									<button
										aria-label={s.label}
										className="flex size-9 items-center justify-center rounded-[10px] border border-[var(--mline)] bg-white text-[var(--mink)] transition-colors hover:border-[var(--mrose)] focus-visible:outline-2 focus-visible:outline-[var(--mink)] focus-visible:outline-offset-2"
										key={s.label}
										type="button"
									>
										<s.icon className="size-4" />
									</button>
								))}
							</div>
						</div>

						{/* compact three-column link map, below md */}
						<div className="grid grid-cols-3 gap-[14px] md:hidden">
							{MOBILE_COLUMNS.map((column) => (
								<div key={column.title}>
									<div className="mb-2 font-semibold text-[10.5px] text-[var(--mink)]">
										{column.title}
									</div>
									<div className="flex flex-col gap-[2px]">
										{column.links.map((link) => (
											<a
												className="py-[2px] text-[11.5px] text-[var(--mmut)] leading-[1.6] hover:text-[var(--mrose)]"
												href={link.href}
												key={link.label}
											>
												{link.label}
											</a>
										))}
									</div>
								</div>
							))}
						</div>

						{/* link columns, md:+ */}
						{COLUMNS.map((col) => (
							<div className="hidden md:block" key={col.title}>
								<div className="m-eyebrow mb-[18px] text-[10px]">
									{col.title}
								</div>
								<div className="flex flex-col gap-[11px]">
									{col.links.map((l) => (
										<a
											className="text-[13.5px] text-[var(--mink)] hover:text-[var(--mrose)]"
											href={l.href}
											key={l.label}
										>
											{l.label}
										</a>
									))}
								</div>
								{col.title === "Legal" && (
									<div className="mt-[22px] rounded-[12px] border border-[var(--mline)] bg-white px-4 py-[14px]">
										<div className="mb-1 font-semibold text-[#2F7D43] text-[12px]">
											100% gratis
										</div>
										<div className="text-[11.5px] text-[var(--mmut)] leading-[1.5]">
											Sin comisiones ni pagos ocultos. Siempre.
										</div>
									</div>
								)}
							</div>
						))}
					</div>

					<div className="py-[14px] text-[11px] text-[var(--mmut)] lg:py-5 lg:text-[12px]">
						<span className="lg:hidden">
							© 2025 A Wish For · Hecho con cariño en México 🌿
						</span>
						<span className="hidden lg:inline">
							© 2025 A Wish For · awishfor.com
						</span>
					</div>
				</div>
			</MarketingContainer>
		</footer>
	);
}
