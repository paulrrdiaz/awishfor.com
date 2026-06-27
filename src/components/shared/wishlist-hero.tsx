import Image from "next/image";
import type { PublicWishlistViewModel } from "@/server/mappers/view-models";

type Props = {
	wishlist: Pick<
		PublicWishlistViewModel,
		| "heroTitle"
		| "title"
		| "displayName"
		| "coverImageUrl"
		| "eventDate"
		| "eventTime"
		| "eventLocation"
	>;
};

export function WishlistHero({ wishlist }: Props) {
	const heading = wishlist.heroTitle ?? wishlist.title;

	return (
		<header className="w-full">
			{wishlist.coverImageUrl && (
				<div className="relative h-64 w-full sm:h-80 lg:h-96">
					<Image
						alt={heading}
						className="object-cover"
						fill
						priority
						src={wishlist.coverImageUrl}
					/>
				</div>
			)}
			<div className="mx-auto max-w-3xl px-6 py-10 text-center">
				<h1 className="font-heading font-semibold text-4xl leading-tight">
					{heading}
				</h1>
				{wishlist.displayName && (
					<p className="mt-3 text-lg text-muted-foreground">
						{wishlist.displayName}
					</p>
				)}
				{(wishlist.eventDate ||
					wishlist.eventTime ||
					wishlist.eventLocation) && (
					<div className="mt-6 flex flex-wrap justify-center gap-4 text-muted-foreground text-sm">
						{wishlist.eventDate && (
							<span>
								{new Date(wishlist.eventDate).toLocaleDateString("es-PE", {
									year: "numeric",
									month: "long",
									day: "numeric",
								})}
							</span>
						)}
						{wishlist.eventTime && <span>{wishlist.eventTime}</span>}
						{wishlist.eventLocation && <span>{wishlist.eventLocation}</span>}
					</div>
				)}
			</div>
		</header>
	);
}
