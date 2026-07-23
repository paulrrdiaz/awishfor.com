import { Badge } from "@/components/ui/badge";

const RSVP_STATUS_META: Record<
	string,
	{ label: string; variant: "secondary" | "default" | "outline" }
> = {
	confirmed: { label: "Confirmado", variant: "default" },
	declined: { label: "No asistirá", variant: "outline" },
	pending: { label: "Pendiente", variant: "secondary" },
};

type Props = {
	status: string;
};

export function RsvpStatusBadge({ status }: Props) {
	const meta = RSVP_STATUS_META[status] ?? RSVP_STATUS_META.pending;
	return <Badge variant={meta?.variant}>{meta?.label}</Badge>;
}
