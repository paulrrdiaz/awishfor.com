/* biome-ignore-all lint/performance/noImgElement: the local SVG is already optimized and lazy. */
import { AtSign, Camera, MessageCircle } from "lucide-react";
import { SUPPORT_EMAIL } from "@/config/contact";
import { cn } from "@/lib/utils";

const COLUMNS = [
	{
		title: "Producto",
		links: [
			{ label: "Cómo funciona", href: "/#como-funciona" },
			{ label: "Temas y estilos", href: "/#temas" },
			{ label: "Ver ejemplos", href: "/#ejemplo" },
			{ label: "Preguntas frecuentes", href: "/#faq" },
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
			{ label: "Cómo funciona", href: "/#como-funciona" },
			{ label: "Temas", href: "/#temas" },
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

type Props = {
	variant: "marketing" | "public-wishlist";
};

export function FooterBody({ variant }: Props) {
	const isMarketing = variant === "marketing";

	return (
		<div
			className={cn(
				"px-[22px] pt-7 lg:px-0 lg:pt-0",
				isMarketing
					? "bg-[#EEF9E6] lg:bg-transparent"
					: "bg-accent text-accent-foreground [font-family:var(--public-font-body)] lg:px-8 lg:pt-10",
			)}
			data-slot="footer-body"
			data-variant={variant}
		>
			<div
				className={cn(
					"grid grid-cols-1 gap-7 border-b pb-5 md:grid-cols-2 md:gap-10 md:pb-10 lg:grid-cols-[1.6fr_1fr_1fr_1fr] lg:pb-10",
					isMarketing
						? "border-[var(--mline)]"
						: "mx-auto max-w-[1160px] border-accent-foreground/20",
				)}
			>
				<div>
					<a
						aria-label="A Wish For"
						className={cn(
							"mb-[10px] inline-flex rounded-md focus-visible:outline-2 focus-visible:outline-offset-4",
							isMarketing
								? "focus-visible:outline-[var(--mink)]"
								: "focus-visible:outline-ring",
						)}
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
					<p
						className={cn(
							"mb-4 max-w-[240px] text-[12.5px] leading-[1.6] lg:mb-[22px] lg:text-[13.5px] lg:leading-[1.7]",
							isMarketing ? "text-[var(--mmut)]" : "text-accent-foreground/75",
						)}
					>
						Listas de deseos hermosas para tus momentos más especiales. Gratis,
						sin comisiones.
					</p>
					<div className="hidden gap-[10px] md:flex">
						{SOCIALS.map((social) => (
							<button
								aria-label={social.label}
								className={cn(
									"flex size-9 items-center justify-center rounded-[10px] border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2",
									isMarketing
										? "border-[var(--mline)] bg-white text-[var(--mink)] hover:border-[var(--mrose)] focus-visible:outline-[var(--mink)]"
										: "border-border bg-card text-card-foreground hover:border-primary focus-visible:outline-ring",
								)}
								key={social.label}
								type="button"
							>
								<social.icon className="size-4" />
							</button>
						))}
					</div>
				</div>

				<div className="grid grid-cols-3 gap-[14px] md:hidden">
					{MOBILE_COLUMNS.map((column) => (
						<div key={column.title}>
							<div
								className={cn(
									"mb-2 font-semibold text-[10.5px]",
									isMarketing
										? "text-[var(--mink)]"
										: "font-heading text-accent-foreground",
								)}
							>
								{column.title}
							</div>
							<div className="flex flex-col gap-[2px]">
								{column.links.map((link) => (
									<a
										className={cn(
											isMarketing
												? "py-[2px] text-[11.5px] text-[var(--mmut)] leading-[1.6] hover:text-[var(--mrose)]"
												: "rounded-sm py-[2px] text-[11.5px] text-accent-foreground/75 leading-[1.6] transition-colors hover:text-accent-foreground focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2",
										)}
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

				{COLUMNS.map((column) => (
					<div className="hidden md:block" key={column.title}>
						<div
							className={cn(
								"mb-[18px] text-[10px]",
								isMarketing
									? "m-eyebrow"
									: "font-mono font-semibold text-accent-foreground uppercase tracking-[0.18em]",
							)}
						>
							{column.title}
						</div>
						<div className="flex flex-col gap-[11px]">
							{column.links.map((link) => (
								<a
									className={cn(
										isMarketing
											? "text-[13.5px] text-[var(--mink)] hover:text-[var(--mrose)]"
											: "rounded-sm text-[13.5px] text-accent-foreground transition-colors hover:text-accent-foreground/70 focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2",
									)}
									href={link.href}
									key={link.label}
								>
									{link.label}
								</a>
							))}
						</div>
						{column.title === "Legal" && (
							<div
								className={cn(
									"mt-[22px] rounded-[12px] border px-4 py-[14px]",
									isMarketing
										? "border-[var(--mline)] bg-white"
										: "border-border bg-card text-card-foreground",
								)}
							>
								<div
									className={cn(
										"mb-1 font-semibold text-[12px]",
										isMarketing ? "text-[#2F7D43]" : "font-heading",
									)}
								>
									100% gratis
								</div>
								<div
									className={cn(
										"text-[11.5px] leading-[1.5]",
										isMarketing
											? "text-[var(--mmut)]"
											: "text-card-foreground/70",
									)}
								>
									Sin comisiones ni pagos ocultos. Siempre.
								</div>
							</div>
						)}
					</div>
				))}
			</div>

			<div
				className={cn(
					"py-[14px] text-[11px] lg:py-5 lg:text-[12px]",
					isMarketing
						? "text-[var(--mmut)]"
						: "mx-auto max-w-[1160px] text-accent-foreground/70",
				)}
			>
				© 2025 A Wish For · awishfor.com
			</div>
		</div>
	);
}
