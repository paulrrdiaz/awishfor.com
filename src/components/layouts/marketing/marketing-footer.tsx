import { AtSign, Camera, MessageCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { SUPPORT_EMAIL } from "@/config/contact";

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

const SOCIALS = [
	{ icon: AtSign, label: "X" },
	{ icon: Camera, label: "Instagram" },
	{ icon: MessageCircle, label: "WhatsApp" },
];

const MOBILE_LINKS = [
	{ label: "Cómo funciona", href: "#como-funciona" },
	{ label: "Temas", href: "#temas" },
	{ label: "Ejemplos", href: "#ejemplo" },
	{ label: "FAQ", href: "#faq" },
	{ label: "Términos", href: "/terms" },
	{ label: "Privacidad", href: "/privacy" },
];

export function MarketingFooter() {
	return (
		<footer className="border-[#BCE25A] border-t-[3px] bg-[#EEF9E6] px-11 pt-14">
			<div className="grid grid-cols-1 gap-10 border-[var(--mline)] border-b pb-12 md:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">
				{/* brand */}
				<div>
					<Image
						alt="A Wish For"
						className="mb-[10px] h-8 w-auto"
						height={660}
						src="/assets/awishfor-logo.svg"
						width={916}
					/>
					<p className="mb-[22px] max-w-[240px] text-[13.5px] text-[var(--mmut)] leading-[1.7]">
						Listas de deseos hermosas para tus momentos más especiales. Gratis,
						sin comisiones.
					</p>
					<div className="flex gap-[10px]">
						{SOCIALS.map((s) => (
							<button
								aria-label={s.label}
								className="flex h-11 w-11 items-center justify-center rounded-[10px] border border-[var(--mline)] bg-white text-[var(--mink)] transition-colors hover:border-[var(--mrose)] md:h-9 md:w-9"
								key={s.label}
								type="button"
							>
								<s.icon className="size-4" />
							</button>
						))}
					</div>
				</div>

				{/* flat link list, below md */}
				<div className="flex flex-col gap-1 md:hidden">
					{MOBILE_LINKS.map((l) => (
						<Link
							className="flex min-h-11 items-center text-[13.5px] text-[var(--mink)] hover:text-[var(--mrose)]"
							href={l.href}
							key={l.label}
						>
							{l.label}
						</Link>
					))}
				</div>

				{/* link columns, md:+ */}
				{COLUMNS.map((col) => (
					<div className="hidden md:block" key={col.title}>
						<div className="m-eyebrow mb-[18px] text-[10px]">{col.title}</div>
						<div className="flex flex-col gap-[11px]">
							{col.links.map((l) => (
								<Link
									className="text-[13.5px] text-[var(--mink)] hover:text-[var(--mrose)]"
									href={l.href}
									key={l.label}
								>
									{l.label}
								</Link>
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

			<div className="flex flex-col items-center justify-between gap-2 py-5 text-[12px] text-[var(--mmut)] sm:flex-row">
				<span className="md:hidden">© 2025 A Wish For</span>
				<span className="hidden md:inline">
					© 2025 A Wish For · awishfor.com
				</span>
				<span>Hecho con cariño en México 🌿</span>
			</div>
		</footer>
	);
}
