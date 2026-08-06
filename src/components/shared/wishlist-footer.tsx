import { SUPPORT_EMAIL } from "@/config/contact";
import { cn } from "@/lib/utils";

type Props = {
	thankYouMessage?: string | null;
	className?: string;
	variant?: "default" | "compact";
	wishlistSlug?: string;
};

export function WishlistFooter({
	thankYouMessage,
	className,
	variant = "default",
	wishlistSlug,
}: Props) {
	if (variant === "compact") {
		return (
			<footer
				className={cn(
					"flex min-h-[50px] items-center justify-center border-border border-t px-5 py-3 text-center",
					className,
				)}
			>
				<p className="font-mono text-[9px] text-muted-foreground uppercase tracking-[0.22em]">
					Hecho con cariño en A Wish For
					{wishlistSlug && (
						<>
							<span aria-hidden="true"> · </span>
							<a
								className="transition-colors hover:text-foreground"
								href={`/w/${wishlistSlug}`}
							>
								awishfor.com/w/{wishlistSlug}
							</a>
						</>
					)}
				</p>
			</footer>
		);
	}

	return (
		<footer className={cn("mt-auto border-t py-10 text-center", className)}>
			{thankYouMessage && (
				<p className="mx-auto mb-6 max-w-xl text-base leading-relaxed">
					{thankYouMessage}
				</p>
			)}
			<p className="text-muted-foreground text-xs">
				Hecho con cariño en{" "}
				<a className="text-primary hover:underline" href="https://awishfor.com">
					A Wish For
				</a>
			</p>
			<div className="mt-3 flex items-center justify-center gap-4 text-muted-foreground text-xs">
				<a
					className="hover:underline"
					href={`mailto:${SUPPORT_EMAIL}?subject=Reporte%20de%20lista`}
				>
					Reportar lista
				</a>
				<span aria-hidden="true">·</span>
				<a className="hover:underline" href={`mailto:${SUPPORT_EMAIL}`}>
					{SUPPORT_EMAIL}
				</a>
			</div>
		</footer>
	);
}
