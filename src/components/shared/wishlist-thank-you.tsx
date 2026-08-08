import {
	resolveThankYouVariant,
	type ThankYouVariantId,
} from "@/config/public-message-variants";
import { parseSignatureInitials } from "@/lib/format/signature";
import { cn } from "@/lib/utils";

type Contributors = {
	count: number;
	initials: string[];
};

type Props = {
	className?: string;
	message?: string | null;
	attribution?: string | null;
	variant?: string | null;
	contributors?: Contributors;
};

type VariantProps = {
	message: string;
	attribution?: string | null;
	className?: string;
};

function Spotlight({ message, attribution, className }: VariantProps) {
	return (
		<section
			aria-label="Agradecimiento"
			className={cn("mx-auto w-full max-w-4xl px-6 pt-4 pb-16", className)}
		>
			<div className="mx-auto max-w-2xl rounded-[20px] bg-foreground px-8 py-10 text-center text-background">
				<span className="font-mono text-[9px] uppercase tracking-[0.24em] opacity-70">
					Con cariño
				</span>
				<p className="mt-2 font-heading font-semibold text-3xl sm:text-4xl">
					Gracias
				</p>
				<div className="mx-auto mt-4 h-px w-12 bg-primary" />
				<p className="mx-auto mt-4 max-w-xl font-heading text-base leading-relaxed">
					{message}
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

function Handwritten({ message, attribution, className }: VariantProps) {
	const seal = parseSignatureInitials(attribution).join("+");

	return (
		<section
			aria-label="Agradecimiento"
			className={cn("mx-auto w-full max-w-4xl px-6 pt-4 pb-16", className)}
		>
			<div className="relative mx-auto max-w-[640px] -rotate-1 rounded-[4px] bg-card px-7 py-8 text-center shadow-[0_10px_28px_rgba(30,50,80,.12)] sm:px-10">
				<p className="mx-auto max-w-[560px] font-heading text-[19px] italic leading-[1.5] sm:text-[22px]">
					{message}
				</p>
				{attribution && (
					<p className="mt-4 font-mono text-[10px] text-muted-foreground uppercase tracking-[0.24em]">
						— {attribution}
					</p>
				)}
				{seal && (
					<span className="absolute right-6 -bottom-3 flex size-11 rotate-8 items-center justify-center rounded-full border border-primary/40 bg-background font-heading font-semibold text-primary text-sm shadow-sm">
						{seal}
					</span>
				)}
			</div>
		</section>
	);
}

function SocialProof({
	message,
	attribution,
	className,
	contributors,
}: VariantProps & { contributors: Contributors }) {
	const shown = contributors.initials.slice(0, 4);
	const overflow = Math.max(0, contributors.count - shown.length);

	return (
		<section
			aria-label="Agradecimiento"
			className={cn("mx-auto w-full max-w-4xl px-6 pt-4 pb-16", className)}
		>
			<div className="mx-auto max-w-2xl rounded-[20px] border border-border bg-card px-8 py-10 text-center">
				<span className="font-mono text-[9px] text-muted-foreground uppercase tracking-[0.24em]">
					Gracias
				</span>
				<div className="mt-4 flex justify-center -space-x-2">
					{shown.map((initial, index) => (
						<span
							className="flex size-9 items-center justify-center rounded-full border-2 border-card bg-accent font-mono font-semibold text-[10px] text-accent-foreground"
							// biome-ignore lint/suspicious/noArrayIndexKey: contributor initials are re-derived from the server every render, never reordered
							key={`${initial}-${index}`}
						>
							{initial}
						</span>
					))}
					{overflow > 0 && (
						<span className="flex size-9 items-center justify-center rounded-full border-2 border-card bg-muted font-mono font-semibold text-[10px] text-muted-foreground">
							+{overflow}
						</span>
					)}
				</div>
				<p className="mt-3 font-heading font-semibold text-sm">
					{contributors.count}{" "}
					{contributors.count === 1 ? "persona hizo" : "personas hicieron"} esto
					posible
				</p>
				<p className="mx-auto mt-4 max-w-xl font-heading text-base leading-relaxed">
					{message}
				</p>
				{attribution && (
					<p className="mt-4 font-mono text-[9px] text-muted-foreground uppercase tracking-[0.24em]">
						— {attribution}
					</p>
				)}
			</div>
		</section>
	);
}

function PlainMessage({ message, attribution, className }: VariantProps) {
	return (
		<section
			aria-label="Agradecimiento"
			className={cn("mx-auto w-full max-w-4xl px-6 pt-4 pb-16", className)}
		>
			<p className="mx-auto max-w-xl text-center font-heading text-base leading-relaxed">
				{message}
			</p>
			{attribution && (
				<p className="mt-3 text-center font-mono text-[9px] text-muted-foreground uppercase tracking-[0.24em]">
					— {attribution}
				</p>
			)}
		</section>
	);
}

export function WishlistThankYou({
	className,
	message,
	attribution,
	variant,
	contributors,
}: Props) {
	if (!message) return null;

	const resolvedVariant = resolveThankYouVariant(variant)
		.id as ThankYouVariantId;

	if (resolvedVariant === "spotlight") {
		return (
			<Spotlight
				attribution={attribution}
				className={className}
				message={message}
			/>
		);
	}

	if (resolvedVariant === "handwritten") {
		return (
			<Handwritten
				attribution={attribution}
				className={className}
				message={message}
			/>
		);
	}

	if (
		resolvedVariant === "social-proof" &&
		contributors &&
		contributors.count > 0
	) {
		return (
			<SocialProof
				attribution={attribution}
				className={className}
				contributors={contributors}
				message={message}
			/>
		);
	}

	return (
		<PlainMessage
			attribution={attribution}
			className={className}
			message={message}
		/>
	);
}
