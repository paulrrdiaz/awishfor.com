import type { Metadata } from "next";

import { BenefitsSection } from "@/components/layouts/marketing/benefits-section";
import { ExamplePreview } from "@/components/layouts/marketing/example-preview";
import { FaqSection } from "@/components/layouts/marketing/faq-section";
import { FinalCta } from "@/components/layouts/marketing/final-cta";
import { GuestFinder } from "@/components/layouts/marketing/guest-finder";
import { HowItWorksSection } from "@/components/layouts/marketing/how-it-works-section";
import { MarketingFooter } from "@/components/layouts/marketing/marketing-footer";
import { MarketingHero } from "@/components/layouts/marketing/marketing-hero";
import { MarketingNav } from "@/components/layouts/marketing/marketing-nav";
import { OccasionPickerSection } from "@/components/layouts/marketing/occasion-picker-section";
import { PartnersMarquee } from "@/components/layouts/marketing/partners-marquee";
import { ThemePreviews } from "@/components/layouts/marketing/theme-previews";
import { UseCasesSection } from "@/components/layouts/marketing/use-cases-section";

export const metadata: Metadata = {
	title: "A Wish For — Crea una wishlist hermosa para tus momentos especiales",
	description:
		"Crea listas de regalos hermosas para baby showers, cumpleaños, bodas y más. Agrega regalos de cualquier tienda y compártelas por enlace, WhatsApp o QR. Gratis, sin comisiones.",
};

export default function MarketingLandingPage() {
	return (
		<>
			<MarketingNav />
			<MarketingHero />
			<OccasionPickerSection />
			<BenefitsSection />
			<HowItWorksSection />
			<UseCasesSection />
			<PartnersMarquee />
			<ThemePreviews />
			<ExamplePreview />
			<GuestFinder />
			<FaqSection />
			<FinalCta />
			<MarketingFooter />
		</>
	);
}
