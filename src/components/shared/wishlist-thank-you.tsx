import { cn } from "@/lib/utils";

type Props = {
	className?: string;
	message?: string | null;
};

export function WishlistThankYou({ className, message }: Props) {
	if (!message) return null;

	return (
		<section
			aria-label="Agradecimiento"
			className={cn("mx-auto w-full max-w-4xl px-6 pt-4 pb-10", className)}
		>
			<p className="mx-auto max-w-xl text-center font-heading text-base leading-relaxed">
				{message}
			</p>
		</section>
	);
}
