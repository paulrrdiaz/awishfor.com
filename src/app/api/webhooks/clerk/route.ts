import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import {
	type ClaimDatabase,
	claimInvitationsForVerifiedEmail,
} from "@/server/services/invitation-claim.service";

export async function POST(req: NextRequest) {
	let evt: Awaited<ReturnType<typeof verifyWebhook>>;

	try {
		evt = await verifyWebhook(req);
	} catch {
		return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
	}

	try {
		if (evt.type === "user.created" || evt.type === "user.updated") {
			const data = evt.data;
			const clerkId = data.id;

			const primaryAddress = data.email_addresses?.find(
				(e) => e.id === data.primary_email_address_id,
			);
			const primaryEmail =
				primaryAddress?.email_address ??
				data.email_addresses?.[0]?.email_address ??
				"";

			const nameParts = [data.first_name, data.last_name]
				.filter(Boolean)
				.join(" ")
				.trim();
			const name = nameParts || null;

			const imageUrl = data.image_url ?? null;

			const user = await db.user.upsert({
				where: { clerkId },
				create: { clerkId, email: primaryEmail, name, imageUrl },
				update: { email: primaryEmail, name, imageUrl },
			});

			if (
				evt.type === "user.created" &&
				primaryAddress?.verification?.status === "verified"
			) {
				await claimInvitationsForVerifiedEmail(db as unknown as ClaimDatabase, {
					email: primaryAddress.email_address,
					localUserId: user.id,
				});
			}
		} else if (evt.type === "user.deleted") {
			const clerkId = evt.data.id;
			if (clerkId) {
				await db.user.deleteMany({ where: { clerkId } });
			} else {
				console.warn("user.deleted event received without clerkId");
			}
		}

		return NextResponse.json({ received: true });
	} catch {
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
