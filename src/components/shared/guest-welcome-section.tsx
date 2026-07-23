import { RsvpControl } from "@/components/shared/rsvp-control";
import { cn } from "@/lib/utils";
import type { PublicGuestViewModel } from "@/server/mappers/view-models";

type Props = {
	guest: PublicGuestViewModel | undefined;
	wishlistSlug: string;
	tone?: "default" | "on-photo";
	className?: string;
};

export function GuestWelcomeSection({
	guest,
	wishlistSlug,
	tone = "default",
	className,
}: Props) {
	if (!guest) {
		return null;
	}

	const isOnPhoto = tone === "on-photo";
	const namedExtraGuests = guest.extraGuests.filter(
		(extra): extra is { name: string } => Boolean(extra.name),
	);
	const unnamedCount = guest.extraGuests.length - namedExtraGuests.length;

	return (
		<div className={cn("guest-welcome-section", className)}>
			<p
				className={cn(
					"font-heading font-semibold text-lg",
					isOnPhoto && "text-white",
				)}
			>
				¡Hola, {guest.primaryName}!
			</p>
			{guest.extraGuests.length > 0 && (
				<p
					className={cn(
						"mt-1 text-sm",
						isOnPhoto ? "text-white/85" : "text-muted-foreground",
					)}
				>
					{namedExtraGuests.length > 0
						? `Con ${namedExtraGuests.map((extra) => extra.name).join(", ")}${
								unnamedCount > 0 ? ` y ${unnamedCount} más` : ""
							}`
						: `+${unnamedCount} acompañante${unnamedCount === 1 ? "" : "s"}`}
				</p>
			)}
			<RsvpControl
				guestSlug={guest.slug}
				status={guest.status}
				tone={tone}
				wishlistSlug={wishlistSlug}
			/>
		</div>
	);
}
