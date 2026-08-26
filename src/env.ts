import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
	server: {
		NODE_ENV: z.enum(["development", "test", "production"]),
		BRIGHT_DATA_API_KEY: z.string().min(1).optional(),
		BRIGHT_DATA_WEB_UNLOCKER_ZONE: z.string().min(1).optional(),
		RESEND_API_KEY: z.string().min(1).optional(),
		EMAIL_FROM: z.string().email().optional(),
		EMAIL_DEV_REDIRECT_TO: z.string().email().optional(),
		CLERK_SECRET_KEY: z.string(),
		DATABASE_URL: z.string().url(),
		CLERK_WEBHOOK_SIGNING_SECRET: z.string(),
		UPLOADTHING_TOKEN: z.string(),
		VIEW_ANALYTICS_HMAC_SECRET: z.string().min(32).optional(),
	},

	client: {
		NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string(),
		NEXT_PUBLIC_APP_URL: z.string().url(),
		NEXT_PUBLIC_POSTHOG_KEY: z.string().min(1).optional(),
		NEXT_PUBLIC_POSTHOG_HOST: z.string().url().optional(),
	},

	runtimeEnv: {
		NODE_ENV: process.env.NODE_ENV,
		BRIGHT_DATA_API_KEY: process.env.BRIGHT_DATA_API_KEY,
		BRIGHT_DATA_WEB_UNLOCKER_ZONE: process.env.BRIGHT_DATA_WEB_UNLOCKER_ZONE,
		RESEND_API_KEY: process.env.RESEND_API_KEY,
		EMAIL_FROM: process.env.EMAIL_FROM,
		EMAIL_DEV_REDIRECT_TO: process.env.EMAIL_DEV_REDIRECT_TO,
		CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
		DATABASE_URL: process.env.DATABASE_URL,
		CLERK_WEBHOOK_SIGNING_SECRET: process.env.CLERK_WEBHOOK_SIGNING_SECRET,
		UPLOADTHING_TOKEN: process.env.UPLOADTHING_TOKEN,
		VIEW_ANALYTICS_HMAC_SECRET: process.env.VIEW_ANALYTICS_HMAC_SECRET,
		NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
			process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
		NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
		NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
		NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
	},
	skipValidation: !!process.env.SKIP_ENV_VALIDATION,
	emptyStringAsUndefined: true,
});
