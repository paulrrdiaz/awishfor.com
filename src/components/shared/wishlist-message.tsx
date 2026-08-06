import { cn } from "@/lib/utils";

type Props = {
	message: string;
	attribution?: string | null;
	className?: string;
};

export function WishlistMessage({ message, attribution, className }: Props) {
	return (
		<section
			className={cn("border-border border-b px-5 pb-5 sm:px-7", className)}
		>
			<div className="flex min-h-[170px] flex-col items-center justify-center rounded-[20px] bg-accent px-7 py-8 text-center text-accent-foreground sm:px-12">
				<p className="mx-auto max-w-[820px] font-heading font-semibold text-[20px] italic leading-[1.45] sm:text-[24px]">
					«{message}»
				</p>
				{attribution && (
					<p className="mt-4 font-mono text-[9px] uppercase tracking-[0.24em] opacity-70">
						— {attribution}
					</p>
				)}
			</div>
		</section>
	);
}
