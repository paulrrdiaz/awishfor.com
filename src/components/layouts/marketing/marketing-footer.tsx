import { FooterBody } from "@/components/shared/footer-body";
import { MarketingContainer } from "./marketing-container";
import { NewsletterForm } from "./newsletter-form";

export function MarketingFooter() {
	return (
		<footer className="bg-[#173E29] lg:bg-[#EEF9E6]">
			<MarketingContainer className="lg:pt-10">
				<section className="flex flex-col gap-3 border-white/[.12] border-b px-[22px] py-6 text-white lg:mb-10 lg:flex-row lg:items-center lg:justify-between lg:gap-6 lg:rounded-[20px] lg:border-0 lg:bg-[linear-gradient(135deg,#DCEFC9,#EEF9E6)] lg:px-[34px] lg:py-[26px] lg:text-[var(--mink)]">
					<div>
						<div className="m-serif mb-[3px] font-semibold text-[16px] lg:mb-1 lg:text-[19px]">
							Ideas para tu próximo evento
						</div>
						<div className="text-[12px] text-white/60 lg:text-[13px] lg:text-[var(--mmut)]">
							<span className="lg:hidden">Un correo al mes, sin spam.</span>
							<span className="hidden lg:inline">
								Un correo al mes, con inspiración real. Sin spam.
							</span>
						</div>
					</div>
					<NewsletterForm />
				</section>

				<FooterBody variant="marketing" />
			</MarketingContainer>
		</footer>
	);
}
