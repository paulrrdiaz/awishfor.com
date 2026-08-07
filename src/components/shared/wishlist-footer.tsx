import { FooterBody } from "@/components/shared/footer-body";
import { SUPPORT_EMAIL } from "@/config/contact";
import { cn } from "@/lib/utils";

type Props = {
	className?: string;
	variant?: "expanded" | "compact";
	wishlistSlug?: string;
};

const reportHref = `mailto:${SUPPORT_EMAIL}?subject=Reporte%20de%20lista`;

export function WishlistFooter({
	className,
	variant = "expanded",
	wishlistSlug,
}: Props) {
	if (variant === "compact") {
		return (
			<footer
				className={cn(
					"flex min-h-[74px] flex-col items-center justify-center gap-2 border-border border-t bg-card px-5 py-3 text-center text-card-foreground",
					className,
				)}
				data-variant="compact"
			>
				<p className="font-mono text-[9px] text-card-foreground/70 uppercase tracking-[0.22em]">
					Hecho con cariño en{" "}
					<a
						className="rounded-sm text-card-foreground transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
						href="/"
					>
						A Wish For
					</a>
					{wishlistSlug && (
						<>
							<span aria-hidden="true"> · </span>
							<a
								className="rounded-sm normal-case transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
								href={`/w/${wishlistSlug}`}
							>
								awishfor.com/w/{wishlistSlug}
							</a>
						</>
					)}
				</p>
				<div className="flex items-center justify-center gap-3 text-[10px] text-card-foreground/70">
					<a
						className="rounded-sm transition-colors hover:text-card-foreground focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
						href={reportHref}
					>
						Reportar lista
					</a>
					<span aria-hidden="true">·</span>
					<a
						className="rounded-sm transition-colors hover:text-card-foreground focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
						href={`mailto:${SUPPORT_EMAIL}`}
					>
						{SUPPORT_EMAIL}
					</a>
				</div>
			</footer>
		);
	}

	return (
		<footer
			className={cn("mt-auto bg-accent text-accent-foreground", className)}
			data-variant="expanded"
		>
			<FooterBody variant="public-wishlist" />
			<div className="border-accent-foreground/20 border-t bg-accent px-[22px] py-4 text-accent-foreground lg:px-8">
				<div className="mx-auto flex max-w-[1160px] flex-col gap-2 text-[11px] sm:flex-row sm:items-center sm:justify-between lg:text-[12px]">
					<span className="font-heading">¿Necesitas ayuda con esta lista?</span>
					<div className="flex flex-wrap items-center gap-3 text-accent-foreground/75">
						<a
							className="rounded-sm transition-colors hover:text-accent-foreground focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
							href={reportHref}
						>
							Reportar lista
						</a>
						<span aria-hidden="true">·</span>
						<a
							className="rounded-sm transition-colors hover:text-accent-foreground focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
							href={`mailto:${SUPPORT_EMAIL}`}
						>
							{SUPPORT_EMAIL}
						</a>
					</div>
				</div>
			</div>
		</footer>
	);
}
