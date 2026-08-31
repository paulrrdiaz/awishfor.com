type Props = {
	title: string;
};

export function WishlistTitleBlock({ title }: Props) {
	return (
		<div className="px-7 pt-5 pb-3">
			<h1 className="font-heading font-semibold text-[22px] text-foreground">
				{title}
			</h1>
		</div>
	);
}
