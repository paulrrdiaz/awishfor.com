/**
 * Diagnose why /dashboard/wishlists/[id]/gifts renders a 404.
 *
 * The page swallows any error from `api.gift.list` into `notFound()`, so this
 * script reproduces that server path step-by-step against the real dev DB and
 * prints exactly which step fails.
 *
 * Run: pnpm dotenv -e .env -- pnpm tsx scripts/diagnose-gifts.ts [wishlistId]
 */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { mapDashboardGift } from "../src/server/mappers/dashboard-gift.mapper";

const WISHLIST_ID = process.argv[2] ?? "cmrbsp9mc000a3whqgpungvb4";

const db = new PrismaClient({
	adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

function heading(text: string) {
	console.log(`\n=== ${text} ===`);
}

async function main() {
	console.log(
		"DATABASE_URL host:",
		process.env.DATABASE_URL?.match(/@([^/]+)/)?.[1],
	);
	console.log("Target wishlistId:", WISHLIST_ID);

	heading("1. Users in this DB");
	const users = await db.user.findMany({
		select: { id: true, clerkId: true, email: true },
	});
	console.table(users);

	heading("2. Does the wishlist row exist at all?");
	const wl = await db.wishlist.findUnique({
		where: { id: WISHLIST_ID },
		select: { id: true, title: true, ownerId: true, status: true },
	});
	console.log(wl ?? "❌ NOT FOUND — no Wishlist row with this id");

	if (wl) {
		heading("3. Is it owned + non-archived (what the sidebar list requires)?");
		const inSidebar = await db.wishlist.findFirst({
			where: {
				ownerId: wl.ownerId,
				status: { not: "archived" },
				id: WISHLIST_ID,
			},
			select: { id: true },
		});
		console.log(
			"Appears in sidebar list():",
			Boolean(inSidebar),
			"| status:",
			wl.status,
		);

		heading("4. assertOwnedWishlist({ id, ownerId }) — the gift.list guard");
		const owned = await db.wishlist.findFirst({
			where: { id: WISHLIST_ID, ownerId: wl.ownerId },
			select: { id: true },
		});
		console.log(owned ? "✅ passes" : "❌ throws NOT_FOUND");
	}

	heading("5. gift.findMany({ include: { purchases: true } }) — raw query");
	try {
		const gifts = await db.gift.findMany({
			where: { wishlistId: WISHLIST_ID, deletedAt: null },
			orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
			include: { purchases: true },
		});
		console.log(`✅ query ok, ${gifts.length} gift(s)`);

		heading("6. mapDashboardGift(row) for each gift");
		gifts.forEach((g, i) => {
			try {
				mapDashboardGift(g as never);
			} catch (err) {
				console.log(`❌ mapDashboardGift failed on gift[${i}] (${g.id}):`, err);
			}
		});
		console.log("mapper check done");
	} catch (err) {
		console.log("❌ raw query threw:", err);
	}
}

main()
	.catch((err) => {
		console.error("\nUNCAUGHT:", err);
		process.exitCode = 1;
	})
	.finally(() => db.$disconnect());
