import type { DashboardGiftRowViewModel } from "@/server/mappers/view-models";
import { GiftRow } from "./gift-row";

type Props = {
	label: string;
	gifts: DashboardGiftRowViewModel[];
};

export function GiftGroup({ label, gifts }: Props) {
	return (
		<section>
			<h2 className="mb-3 font-medium text-gray-500 text-xs uppercase tracking-wide">
				{label} ({gifts.length})
			</h2>
			<ul className="space-y-2">
				{gifts.map((gift) => (
					<li key={gift.id}>
						<GiftRow gift={gift} />
					</li>
				))}
			</ul>
		</section>
	);
}
