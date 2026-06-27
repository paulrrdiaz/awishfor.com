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
				Creado con <span className="text-primary">awishfor</span>
			</p>
		</footer>
	);
}
