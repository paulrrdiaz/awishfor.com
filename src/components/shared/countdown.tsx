import { formatCountdown } from "@/lib/format/countdown";

type Props = {
	eventDate: string;
};

export function Countdown({ eventDate }: Props) {
	const text = formatCountdown(eventDate);

	return (
		<div className="py-4 text-center">
			<span className="font-medium text-primary text-sm uppercase tracking-wide">
				{text}
			</span>
		</div>
	);
}
