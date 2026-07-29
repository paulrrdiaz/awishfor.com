import { H2bHero } from "./h2b-hero";
import { MarketingHero } from "./marketing-hero";
import { MarketingNav } from "./marketing-nav";

/** H2b is desktop-only; below lg the established mesh hero and mobile nav remain intact. */
export async function MarketingFirstFold() {
	return (
		<div className="relative" data-first-fold>
			<MarketingNav variant="h2b" />
			<div className="lg:hidden">
				<MarketingHero />
			</div>
			<H2bHero />
		</div>
	);
}
