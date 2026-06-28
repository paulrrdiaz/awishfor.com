import { SUPPORT_EMAIL } from "@/config/contact";

type Props = {
	thankYouMessage?: string | null;
};

export function WishlistFooter({ thankYouMessage }: Props) {
	return (
		<footer className="mt-auto border-t py-10 text-center">
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
