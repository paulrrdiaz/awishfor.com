import "@/styles/globals.css";

import type { Metadata } from "next";

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

export default function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<html lang="es">
			<body>{children}</body>
		</html>
	);
}
