import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../src/generated/prisma/client";

export function createSeedClient() {
	const url = process.env.DATABASE_URL;
	if (!url)
		throw new Error(
			"DATABASE_URL is not set — run: dotenv -e .env -- pnpm seed",
		);
	const adapter = new PrismaPg({ connectionString: url });
	return new PrismaClient({ adapter });
}

export type SeedClient = ReturnType<typeof createSeedClient>;
