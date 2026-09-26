import { cn } from "@/lib/utils";
import type { SeatingPassViewModel } from "@/server/mappers/view-models";
import { PassVariant } from "./pass-variant";
import { RingVariant } from "./ring-variant";

export type SeatingPassVariantId = "pass" | "ring";

export type SeatingPassProps = {
	pass: SeatingPassViewModel;
	variant: SeatingPassVariantId | string;
	className?: string;
};

export function SeatingPass({ pass, variant, className }: SeatingPassProps) {
	return (
		<section className={cn("mx-auto w-full max-w-4xl px-6 py-10", className)}>
			<div className="flex justify-center">
				<div className="w-full max-w-[420px]">
					{variant === "ring" ? (
						<RingVariant pass={pass} />
					) : (
						<PassVariant pass={pass} />
					)}
				</div>
			</div>
		</section>
	);
}
