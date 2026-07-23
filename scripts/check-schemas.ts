/**
 * Are there duplicate `Gift`/`Wishlist` tables across schemas, and which one
 * has the `size` column? Also prints the connection's search_path.
 *
 * Run: pnpm runTS scripts/check-schemas.ts
 */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const db = new PrismaClient({
	adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
	console.log("search_path:", await db.$queryRawUnsafe("SHOW search_path"));

	console.log("\nTables named Gift/Wishlist per schema:");
	console.log(
		await db.$queryRawUnsafe(
			`SELECT table_schema, table_name
			 FROM information_schema.tables
			 WHERE table_name IN ('Gift','Wishlist')
			 ORDER BY table_name, table_schema`,
		),
	);

	console.log("\nGift.size per schema:");
	console.log(
		await db.$queryRawUnsafe(
			`SELECT table_schema, column_name
			 FROM information_schema.columns
			 WHERE table_name = 'Gift' AND column_name = 'size'`,
		),
	);
}

main()
	.catch((e) => {
		console.error(e);
		process.exitCode = 1;
	})
	.finally(() => db.$disconnect());
