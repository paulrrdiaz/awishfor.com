"use client";

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { PublicFontOption } from "@/config/public-fonts";
import { cn } from "@/lib/utils";

type Props = {
	label: string;
	options: PublicFontOption[];
	selected: string | null;
	defaultId: string;
	onSelect: (id: string) => void;
	/**
	 * "compact" (default) is the dashboard design-editor sizing. "inline"
	 * matches the wizard's Theme step card treatment.
	 */
	variant?: "compact" | "inline";
};

export function FontSelect({
	label,
	options,
	selected,
	defaultId,
	onSelect,
	variant = "compact",
}: Props) {
	const isInline = variant === "inline";
	return (
		<div className={isInline ? undefined : "space-y-2"}>
			<p
				className={cn(
					isInline
						? "mb-[7px] font-semibold text-[13px] text-foreground"
						: "font-medium text-foreground text-sm",
				)}
			>
				{label}
			</p>
			<Select onValueChange={onSelect} value={selected ?? defaultId}>
				<SelectTrigger
					className={cn(
						"w-full",
						isInline &&
							"h-auto rounded-[14px] border-border px-3.5 py-3 text-[15px]",
					)}
				>
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					{options.map((option) => (
						<SelectItem key={option.id} value={option.id}>
							<span
								style={{
									fontFamily: `var(${option.cssVariable}), ${option.fallback}`,
								}}
							>
								{option.label}
							</span>
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	);
}
