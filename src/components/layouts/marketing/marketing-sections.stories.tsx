import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { BenefitsSection } from "./benefits-section";
import { ExamplePreview } from "./example-preview";
import { FaqSection } from "./faq-section";
import { FinalCta } from "./final-cta";
import { GuestFinder } from "./guest-finder";
import { H2bHero } from "./h2b-hero";
import { HowItWorksSection } from "./how-it-works-section";
import { MarketingFooter } from "./marketing-footer";
import { MarketingNav } from "./marketing-nav";
import { OccasionPickerSection } from "./occasion-picker-section";
import { PartnersMarquee } from "./partners-marquee";
import { ThemePreviews } from "./theme-previews";

const meta = {
	parameters: {
		layout: "fullscreen",
	},
	title: "Layouts/Marketing/Sections",
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Nav: Story = {
	render: () => <MarketingNav variant="h2b" />,
};

export const Hero: Story = {
	render: () => <H2bHero />,
};

export const OccasionPicker: Story = {
	render: () => <OccasionPickerSection />,
};

export const Benefits: Story = {
	render: () => <BenefitsSection />,
};

export const HowItWorks: Story = {
	render: () => <HowItWorksSection />,
};

export const PartnersMarqueeStory: Story = {
	name: "Partners Marquee",
	render: () => <PartnersMarquee />,
};

export const Example: Story = {
	render: () => <ExamplePreview />,
};

export const Themes: Story = {
	render: () => <ThemePreviews />,
};

export const GuestFinderStory: Story = {
	name: "Guest Finder",
	render: () => <GuestFinder />,
};

export const Faq: Story = {
	render: () => <FaqSection />,
};

export const FinalCtaStory: Story = {
	name: "Final CTA",
	render: () => <FinalCta />,
};

export const Footer: Story = {
	render: () => <MarketingFooter />,
};
