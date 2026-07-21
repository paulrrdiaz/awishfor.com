"use client";

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { PublicFontOption } from "@/config/public-fonts";

type Props = {
	label: string;
	options: PublicFontOption[];
	selected: string | null;
	defaultId: string;
	onSelect: (id: string) => void;
};

export function FontSelect({
	label,
	options,
	selected,
	defaultId,
	onSelect,
}: Props) {
	return (
		<div className="space-y-2">
			<p className="font-medium text-foreground text-sm">{label}</p>
			<Select onValueChange={onSelect} value={selected ?? defaultId}>
				<SelectTrigger className="w-full">
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
