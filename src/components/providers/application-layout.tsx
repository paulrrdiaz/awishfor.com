import { PUBLIC_FONT_VARIABLE_CLASSES } from "@/lib/fonts";
import { AppProviders } from "./app-providers";

export function ApplicationLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className={PUBLIC_FONT_VARIABLE_CLASSES}>
			<AppProviders>{children}</AppProviders>
		</div>
	);
}
