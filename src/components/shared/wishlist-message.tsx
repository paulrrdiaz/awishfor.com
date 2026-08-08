import {
	resolveWelcomeVariant,
	type WelcomeVariantId,
} from "@/config/public-message-variants";
import { parseSignatureInitials } from "@/lib/format/signature";
import { cn } from "@/lib/utils";

type Props = {
	message: string;
	attribution?: string | null;
	variant?: string | null;
	className?: string;
};

type VariantProps = {
	message: string;
	attribution?: string | null;
	className?: string;
};

function Postcard({ message, attribution, className }: VariantProps) {
	return (
		<section
			className={cn("border-border border-b px-5 pb-5 sm:px-7", className)}
		>
			<div className="relative rounded-[20px] border-2 border-border border-dashed bg-muted px-7 py-8 text-center sm:px-12">
				<span className="absolute top-4 right-2 rotate-12 rounded border border-border/60 bg-white/80 px-2 py-1 font-mono text-muted-foreground text-xs uppercase tracking-[0.2em]">
					Para ti
				</span>
				<p className="mx-auto max-w-[820px] font-heading font-semibold text-[20px] italic leading-[1.45] sm:text-[24px]">
					«{message}»
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

function Handwritten({ message, attribution, className }: VariantProps) {
	const seal = parseSignatureInitials(attribution).join("+");

	return (
		<section
			className={cn("border-border border-b px-5 pb-5 sm:px-7", className)}
		>
			<div className="relative mx-auto max-w-[640px] -rotate-1 rounded-[4px] bg-card px-7 py-8 text-center shadow-[0_10px_28px_rgba(30,50,80,.12)] sm:px-10">
				<p className="mx-auto max-w-[560px] font-heading text-[19px] italic leading-[1.5] sm:text-[22px]">
					«{message}»
				</p>
				{attribution && (
					<p className="mt-4 font-mono text-[9px] text-muted-foreground uppercase tracking-[0.24em]">
						— {attribution}
					</p>
				)}
				{seal && (
					<span className="absolute right-6 -bottom-3 flex size-11 rotate-6 items-center justify-center rounded-full border border-primary/40 bg-background font-heading font-semibold text-[11px] text-primary shadow-sm">
						{seal}
					</span>
				)}
			</div>
		</section>
	);
}

function Avatars({ message, attribution, className }: VariantProps) {
	const initials = parseSignatureInitials(attribution);

	return (
		<section
			className={cn("border-border border-b px-5 pb-5 sm:px-7", className)}
		>
			<div className="rounded-[20px] bg-accent px-7 py-8 text-center text-accent-foreground sm:px-12">
				<span className="font-mono text-[9px] uppercase tracking-[0.24em] opacity-70">
					Un mensaje para ti
				</span>
				<p className="mx-auto mt-3 max-w-[820px] font-heading font-semibold text-[20px] italic leading-[1.45] sm:text-[24px]">
					«{message}»
				</p>
				{initials.length > 0 && (
					<div className="mt-4 flex justify-center -space-x-2">
						{initials.map((initial, index) => (
							<span
								className="flex size-8 items-center justify-center rounded-full border-2 border-accent bg-background font-mono font-semibold text-[10px] text-foreground"
								// biome-ignore lint/suspicious/noArrayIndexKey: initials are re-derived fresh from the signature every render, never reordered
								key={`${initial}-${index}`}
							>
								{initial}
							</span>
						))}
					</div>
				)}
			</div>
		</section>
	);
}

export function WishlistMessage({
	message,
	attribution,
	variant,
	className,
}: Props) {
	const resolvedVariant = resolveWelcomeVariant(variant).id as WelcomeVariantId;

	if (resolvedVariant === "handwritten") {
		return (
			<Handwritten
				attribution={attribution}
				className={className}
				message={message}
			/>
		);
	}

	if (resolvedVariant === "avatars") {
		return (
			<Avatars
				attribution={attribution}
				className={className}
				message={message}
			/>
		);
	}

	return (
		<Postcard
			attribution={attribution}
			className={className}
			message={message}
		/>
	);
}
