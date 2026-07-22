import "@/styles/globals.css";

import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Toaster } from "sonner";

import { TooltipProvider } from "@/components/ui/tooltip";
import { PUBLIC_FONT_VARIABLE_CLASSES } from "@/lib/fonts";
import { TRPCReactProvider } from "@/trpc/react";

export const metadata: Metadata = {
	title: "A Wish For",
	description:
		"A Wish For is a beautiful wishlist page builder for baby showers, birthdays, weddings, housewarmings, and more.",
	icons: {
		icon: [
			{ url: "/favicon.ico" },
			{ url: "/favicon.svg", type: "image/svg+xml" },
			{ url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
		],
		shortcut: [{ url: "/favicon.ico" }],
		apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
	},
	manifest: "/site.webmanifest",
};

const jetbrainsMono = JetBrains_Mono({
	subsets: ["latin"],
	variable: "--font-jetbrains-mono",
	display: "swap",
});

export default function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<html
			className={`${PUBLIC_FONT_VARIABLE_CLASSES} ${jetbrainsMono.variable}`}
			lang="en"
		>
			<body>
				<ClerkProvider>
					<NuqsAdapter>
						<TRPCReactProvider>
							<TooltipProvider>
								{children}
								<Toaster position="top-center" richColors />
							</TooltipProvider>
						</TRPCReactProvider>
					</NuqsAdapter>
				</ClerkProvider>
			</body>
		</html>
	);
}
