import "server-only";
import { Resend } from "resend";
import { env } from "@/env";

let client: Resend | null | undefined;

export function getEmailClient(): Resend | null {
	if (client === undefined) {
		client =
			env.RESEND_API_KEY && env.EMAIL_FROM
				? new Resend(env.RESEND_API_KEY)
				: null;
	}
	return client;
}
