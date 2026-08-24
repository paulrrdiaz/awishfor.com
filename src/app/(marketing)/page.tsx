import type { Metadata } from "next";
import { preload } from "react-dom";

import { BenefitsSection } from "@/components/layouts/marketing/benefits-section";
import { ExamplePreview } from "@/components/layouts/marketing/example-preview";
import { FaqSection } from "@/components/layouts/marketing/faq-section";
import { FinalCta } from "@/components/layouts/marketing/final-cta";
import { GuestFinder } from "@/components/layouts/marketing/guest-finder";
import { HowItWorksSection } from "@/components/layouts/marketing/how-it-works-section";
import { MarketingFirstFold } from "@/components/layouts/marketing/marketing-first-fold";
import { MarketingFooter } from "@/components/layouts/marketing/marketing-footer";
import { OccasionPickerSection } from "@/components/layouts/marketing/occasion-picker-section";
import { PartnersMarquee } from "@/components/layouts/marketing/partners-marquee";
import { ThemePreviews } from "@/components/layouts/marketing/theme-previews";

export const metadata: Metadata = {
	title: "A Wish For — Crea una wishlist hermosa para tus momentos especiales",
	description:
		"Crea listas de regalos hermosas para baby showers, cumpleaños, bodas y más. Agrega regalos de cualquier tienda y compártelas por enlace, WhatsApp o QR. Gratis, sin comisiones.",
};

export default function MarketingLandingPage() {
	preload("/assets/fonts/marketing-inter-latin.woff2", {
		as: "font",
		crossOrigin: "anonymous",
		type: "font/woff2",
	});
	preload("/assets/fonts/marketing-lora-latin.woff2", {
		as: "font",
		crossOrigin: "anonymous",
		type: "font/woff2",
	});
	preload("/assets/hero/wedding-hero-mobile-300.jpg", {
		as: "image",
		fetchPriority: "high",
		media: "(max-width: 1023px)",
	});

	return (
		<>
			<MarketingFirstFold />
			<OccasionPickerSection />
			<div
				className="[contain-intrinsic-size:auto_700px] [content-visibility:auto]"
				data-analytics-section="benefits"
			>
				<BenefitsSection />
			</div>
			<div
				className="[contain-intrinsic-size:auto_700px] [content-visibility:auto]"
				data-analytics-section="how_it_works"
			>
				<HowItWorksSection />
			</div>
			<div
				className="[contain-intrinsic-size:auto_500px] [content-visibility:auto]"
				data-analytics-section="partners"
			>
				<PartnersMarquee />
			</div>
			<div
				className="[contain-intrinsic-size:auto_900px] [content-visibility:auto]"
				data-analytics-section="example"
			>
				<ExamplePreview />
			</div>
			<div
				className="[contain-intrinsic-size:auto_700px] [content-visibility:auto]"
				data-analytics-section="themes"
			>
				<ThemePreviews />
			</div>
			<div
				className="[contain-intrinsic-size:auto_400px] [content-visibility:auto]"
				data-analytics-section="guest_finder"
			>
				<GuestFinder />
			</div>
			<div
				className="[contain-intrinsic-size:auto_600px] [content-visibility:auto]"
				data-analytics-section="faq"
			>
				<FaqSection />
			</div>
			<div
				className="[contain-intrinsic-size:auto_500px] [content-visibility:auto]"
				data-analytics-section="final_cta"
			>
				<FinalCta />
			</div>
			<div className="[contain-intrinsic-size:auto_400px] [content-visibility:auto]">
				<MarketingFooter />
			</div>
		</>
	);
}
