import { JetBrains_Mono } from "next/font/google";
import { PUBLIC_FONT_VARIABLE_CLASSES } from "@/lib/fonts";
import { AppProviders } from "./app-providers";

const jetbrainsMono = JetBrains_Mono({
	subsets: ["latin"],
	variable: "--font-jetbrains-mono",
	display: "swap",
});

export function ApplicationLayout({ children }: { children: React.ReactNode }) {
	return (
		<div
			className={`${PUBLIC_FONT_VARIABLE_CLASSES} ${jetbrainsMono.variable}`}
		>
			<AppProviders>{children}</AppProviders>
		</div>
	);
}
