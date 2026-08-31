import { ChevronLeftIcon, MailIcon, MessageCircleIcon } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CopyInviteUrlButton } from "@/components/features/dashboard/guests/copy-invite-url-button";
import { ShareGuestMessage } from "@/components/layouts/dashboard/mobile/share-guest-message";
import { Button } from "@/components/ui/button";
import {
	type SharePurpose,
	toCanonicalWishlistUrl,
	toEmailShareUrl,
	toWhatsAppShareUrl,
	whatsAppMessageForEvent,
} from "@/lib/wishlist/share";
import { api } from "@/trpc/server";

const SHARE_PURPOSES: SharePurpose[] = ["invitation", "reminder", "thanks"];

function parsePurpose(value: string | undefined): SharePurpose {
	return SHARE_PURPOSES.includes(value as SharePurpose)
		? (value as SharePurpose)
		: "invitation";
}

type Props = {
	params: Promise<{ id: string }>;
	searchParams: Promise<{ guest?: string; purpose?: string }>;
};

export default async function ShareViewPage({ params, searchParams }: Props) {
	const { id } = await params;
	const { guest: guestId, purpose } = await searchParams;

	let wishlist: Awaited<ReturnType<typeof api.wishlist.overview>>;
	try {
		wishlist = await api.wishlist.overview({ wishlistId: id });
	} catch {
		notFound();
	}

	const guest = guestId
		? (await api.invite.list({ wishlistId: id })).find(
				(invite) => invite.id === guestId,
			)
		: undefined;

	const message = whatsAppMessageForEvent(
		wishlist.eventType,
		wishlist.publicUrl,
	);

	return (
		<div className="flex min-h-full flex-col">
			<header className="sticky top-0 z-10 flex shrink-0 items-center gap-2 border-border border-b bg-card px-2 py-2">
				<Link
					aria-label="Volver"
					className="flex size-9 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
					href={`/dashboard/wishlists/${id}`}
				>
					<ChevronLeftIcon className="size-5" />
				</Link>
				<p className="font-semibold text-sm">Compartir</p>
			</header>

			<div className="space-y-6 p-4">
				{guest ? (
					<ShareGuestMessage
						eventType={wishlist.eventType}
						guestName={guest.primaryName}
						initialPurpose={parsePurpose(purpose)}
						inviteUrl={toCanonicalWishlistUrl(
							`/w/${wishlist.slug}/${guest.slug}`,
						)}
					/>
				) : (
					<>
						<section className="rounded-2xl border border-border bg-card p-4">
							<p className="mb-2 text-muted-foreground text-xs">Mensaje</p>
							<p className="whitespace-pre-wrap text-sm">{message}</p>
						</section>

						<section className="space-y-2">
							<p className="text-muted-foreground text-xs">Enviar por</p>
							<div className="grid grid-cols-2 gap-2">
								<Button asChild type="button">
									<a
										href={toWhatsAppShareUrl(
											wishlist.publicUrl,
											wishlist.eventType,
										)}
										rel="noreferrer"
										target="_blank"
									>
										<MessageCircleIcon /> WhatsApp
									</a>
								</Button>
								<Button asChild type="button" variant="outline">
									<a
										href={toEmailShareUrl(
											wishlist.publicUrl,
											wishlist.eventType,
										)}
									>
										<MailIcon /> Correo
									</a>
								</Button>
							</div>
						</section>
					</>
				)}

				<section className="space-y-2 border-border border-t pt-4">
					<p className="text-muted-foreground text-xs">Enlace público</p>
					<div className="flex items-center gap-2">
						<span className="min-w-0 flex-1 truncate text-sm">
							{wishlist.publicUrl}
						</span>
						<CopyInviteUrlButton url={wishlist.publicUrl} />
					</div>
				</section>
			</div>
		</div>
	);
}
