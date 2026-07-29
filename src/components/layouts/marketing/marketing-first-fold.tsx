import { H2bHero } from "./h2b-hero";
import { MarketingNav } from "./marketing-nav";

/** The single responsive H2b composition serves every viewport. */
export async function MarketingFirstFold() {
	return (
		<div className="relative" data-first-fold>
			<MarketingNav variant="h2b" />
			<H2bHero />
		</div>
	);
}
