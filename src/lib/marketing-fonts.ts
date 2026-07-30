import { Inter, Lora } from "next/font/google";

/** The only webfonts used above the fold on the anonymous marketing route. */
export const marketingLora = Lora({
	subsets: ["latin"],
	weight: ["400", "600", "700"],
	variable: "--font-lora",
	display: "swap",
});

export const marketingInter = Inter({
	subsets: ["latin"],
	weight: ["400", "500", "600", "700"],
	variable: "--font-inter",
	display: "swap",
});
