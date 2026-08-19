import "server-only";
import { env } from "@/env";
import { getEmailClient } from "@/lib/email/client";
import type { EmailContent, SendResult } from "@/lib/email/types";

type SendEmailInput = EmailContent & {
	to: string;
};

export async function sendEmail(input: SendEmailInput): Promise<SendResult> {
	const client = getEmailClient();
	if (!client || !env.EMAIL_FROM) {
		return { status: "skipped", reason: "unconfigured" };
	}

	const isProduction = env.NODE_ENV === "production";
	const redirectTo = env.EMAIL_DEV_REDIRECT_TO;

	if (!isProduction && !redirectTo) {
		console.log("[email] skipped (non-production)", {
			to: input.to,
			subject: input.subject,
			html: input.html,
			text: input.text,
		});
		return { status: "skipped", reason: "non-production" };
	}

	const recipient = !isProduction && redirectTo ? redirectTo : input.to;

	if (!isProduction && redirectTo) {
		console.log("[email] redirecting to dev address", {
			originalTo: input.to,
			redirectTo,
		});
	}

	try {
		const { data, error } = await client.emails.send({
			from: env.EMAIL_FROM,
			to: recipient,
			subject: input.subject,
			html: input.html,
			text: input.text,
		});

		if (error) {
			return { status: "failed", error: error.message };
		}

		return { status: "sent", id: data.id };
	} catch (error) {
		return {
			status: "failed",
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}
