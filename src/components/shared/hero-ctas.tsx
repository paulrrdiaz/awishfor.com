import { cn } from "@/lib/utils";

type Props = {
	className?: string;
	primaryClassName?: string;
	secondaryClassName?: string;
	variant?: "default" | "on-photo";
};

export function HeroCtas({
	className,
	primaryClassName,
	secondaryClassName,
	variant = "default",
}: Props) {
	const isOnPhoto = variant === "on-photo";

	return (
		<div
			className={cn(
				"inline-flex flex-wrap items-center justify-center gap-2.5",
				className,
			)}
		>
			<a
				className={cn(
					"public-btn px-5 py-2.5 text-sm transition-colors",
					isOnPhoto
						? "bg-white text-gray-900 hover:bg-white/90"
						: "bg-primary text-primary-foreground hover:bg-primary/90",
					primaryClassName,
				)}
				href="#regalos"
			>
				Ver regalos disponibles
			</a>
			<a
				className={cn(
					"public-btn border px-5 py-2.5 text-sm transition-colors",
					isOnPhoto
						? "border-white/40 text-white hover:bg-white/10"
						: "border-current/25 hover:bg-foreground/5",
					secondaryClassName,
				)}
				href="#como-funciona"
			>
				Cómo funciona
			</a>
		</div>
	);
}
