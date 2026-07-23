/**
 * Confirm the `Gift.size` situation: pooled vs. direct connection.
 *
 * The dev DATABASE_URL points at the Neon `-pooler` (PgBouncer) endpoint.
 * After an `ALTER TABLE ... ADD COLUMN`, pooled backend sessions can keep a
 * stale relation cache and report "column does not exist" while the direct
 * (non-pooled) endpoint sees it immediately. This runs the exact gift.list
 * query against both and prints the difference.
 *
 * Run: pnpm runTS scripts/check-gift-size.ts [wishlistId]
 */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const WISHLIST_ID = process.argv[2] ?? "cmrbsp9mc000a3whqgpungvb4";
const POOLED = process.env.DATABASE_URL ?? "";
const DIRECT = POOLED.replace("-pooler", "");

async function probe(label: string, connectionString: string) {
	console.log(`\n=== ${label} ===`);
	console.log("host:", connectionString.match(/@([^/]+)/)?.[1]);
	const db = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
	try {
		const col = (await db.$queryRawUnsafe(
			`SELECT 1 FROM information_schema.columns
			 WHERE table_name = 'Gift' AND column_name = 'size'`,
		)) as unknown[];
		console.log("catalog sees Gift.size:", col.length > 0);

		const gifts = await db.gift.findMany({
			where: { wishlistId: WISHLIST_ID, deletedAt: null },
			include: { purchases: true },
		});
		console.log(`✅ gift.findMany ok — ${gifts.length} gift(s)`);
	} catch (err) {
		const message = err instanceof Error ? err.message.split("\n").pop() : err;
		console.log("❌ gift.findMany threw:", message);
	} finally {
		await db.$disconnect();
	}
}

async function main() {
	await probe("POOLED (dev DATABASE_URL)", POOLED);
	await probe("DIRECT (no -pooler)", DIRECT);
}

main().catch((e) => {
	console.error(e);
	process.exitCode = 1;
});
