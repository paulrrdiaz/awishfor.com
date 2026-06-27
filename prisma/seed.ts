/**
 * Dev seed script — creates 3 wishlists with gifts for paulrrdiaz@gmail.com.
 *
 * Run:  pnpm seed
 *
 * Idempotent: wishlists are upserted by slug; gifts are only created when the
 * wishlist has none. Re-running the script after partial runs is safe.
 *
 * Add new wishlists by exporting a function from prisma/seed/wishlists.ts and
 * calling it here.
 */

import { createSeedClient } from "./seed/client";
import {
	seedBabyShowerWishlist,
	seedBirthdayWishlist,
	seedWeddingWishlist,
} from "./seed/wishlists";

const USER_EMAIL = "paulrrdiaz@gmail.com";

async function main() {
	const db = createSeedClient();

	const user = await db.user.findUnique({ where: { email: USER_EMAIL } });
	if (!user) {
		console.error(
			`\n✗  User "${USER_EMAIL}" not found.\n` +
				"   Sign in to the app at least once so Clerk can sync your account, then re-run pnpm seed.\n",
		);
		await db.$disconnect();
		process.exit(1);
	}

	console.log(`\nSeeding wishlists for ${user.email} (id: ${user.id})…\n`);

	await seedBirthdayWishlist(db, user.id);
	await seedBabyShowerWishlist(db, user.id);
	await seedWeddingWishlist(db, user.id);

	console.log("\nDone! 🌵\n");
	await db.$disconnect();
}

main().catch(async (err) => {
	console.error(err);
	process.exit(1);
});
