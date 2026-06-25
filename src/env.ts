import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
	server: {
		NODE_ENV: z.enum(["development", "test", "production"]),
		CLERK_SECRET_KEY: z.string(),
		DATABASE_URL: z.string().url(),
		CLERK_WEBHOOK_SIGNING_SECRET: z.string(),
	},

	client: {
		NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string(),
	},

	runtimeEnv: {
		NODE_ENV: process.env.NODE_ENV,
		CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
		DATABASE_URL: process.env.DATABASE_URL,
		CLERK_WEBHOOK_SIGNING_SECRET: process.env.CLERK_WEBHOOK_SIGNING_SECRET,
		NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
			process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
	},
	skipValidation: !!process.env.SKIP_ENV_VALIDATION,
	emptyStringAsUndefined: true,
});
