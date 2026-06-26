type Props = {
	thankYouMessage?: string | null;
};

export function WishlistFooter({ thankYouMessage }: Props) {
	return (
		<footer
			className="mt-auto border-t py-10 text-center"
			style={{ borderColor: "var(--public-border)" }}
		>
			{thankYouMessage && (
				<p
					className="mx-auto mb-6 max-w-xl text-base leading-relaxed"
					style={{ color: "var(--public-text)" }}
				>
					{thankYouMessage}
				</p>
			)}
			<p className="text-xs" style={{ color: "var(--public-text-muted)" }}>
				Creado con{" "}
				<span style={{ color: "var(--public-accent)" }}>awishfor</span>
			</p>
		</footer>
	);
}
