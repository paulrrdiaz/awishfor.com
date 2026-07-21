import { cn } from "@/lib/utils";

type Props = {
	className?: string;
	primaryClassName?: string;
	secondaryClassName?: string;
};

export function HeroCtas({
	className,
	primaryClassName,
	secondaryClassName,
}: Props) {
	return (
		<div
			className={cn(
				"inline-flex flex-wrap items-center justify-center gap-2.5",
				className,
			)}
		>
			<a
				className={cn(
					"public-btn bg-primary px-5 py-2.5 text-primary-foreground text-sm transition-colors hover:bg-primary/90",
					primaryClassName,
				)}
				href="#regalos"
			>
				Ver regalos disponibles
			</a>
			<a
				className={cn(
					"public-btn border border-current/25 px-5 py-2.5 text-sm transition-colors hover:bg-foreground/5",
					secondaryClassName,
				)}
				href="#como-funciona"
			>
				Cómo funciona
			</a>
		</div>
	);
}
