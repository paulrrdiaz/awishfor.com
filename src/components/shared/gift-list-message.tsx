import { cn } from "@/lib/utils";

type Props = {
	message?: string | null;
	className?: string;
};

/** Optional intro line rendered above the gift list, immediately before its heading (when present). */
export function GiftListMessage({ message, className }: Props) {
	if (!message) return null;

	return (
		<div
			className={cn(
				"mx-auto flex w-full max-w-4xl items-center justify-center gap-3 px-6 pb-[18px]",
				className,
			)}
		>
			<span aria-hidden="true" className="h-px w-6 shrink-0 bg-primary" />
			<p className="max-w-[420px] text-center font-heading text-[13.5px] text-accent-foreground italic">
				{message}
			</p>
			<span aria-hidden="true" className="h-px w-6 shrink-0 bg-primary" />
		</div>
	);
}
