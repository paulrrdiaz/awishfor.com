import { currentUser } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import type { db } from "@/server/db";

type LocalUserContext = {
	db: typeof db;
	userId: string;
};

/**
 * The local `User` row is normally created by the Clerk webhook, which can lag
 * a session by a few seconds (or never fire in local dev without a tunnel).
 * Falling back to an on-demand upsert here means a brand-new signup can act
 * immediately (e.g. resuming a publish right after auth) without racing it.
 */
export async function getOrCreateLocalUserId(
	ctx: LocalUserContext,
): Promise<number> {
	const existing = await ctx.db.user.findUnique({
		where: { clerkId: ctx.userId },
		select: { id: true },
	});

	if (existing) {
		return existing.id;
	}

	const clerkUser = await currentUser();

	if (!clerkUser || clerkUser.id !== ctx.userId) {
		throw new TRPCError({ code: "UNAUTHORIZED" });
	}

	const primaryEmail =
		clerkUser.emailAddresses.find(
			(address) => address.id === clerkUser.primaryEmailAddressId,
		)?.emailAddress ??
		clerkUser.emailAddresses[0]?.emailAddress ??
		"";

	const nameParts = [clerkUser.firstName, clerkUser.lastName]
		.filter(Boolean)
		.join(" ")
		.trim();

	const user = await ctx.db.user.upsert({
		where: { clerkId: ctx.userId },
		create: {
			clerkId: ctx.userId,
			email: primaryEmail,
			name: nameParts || null,
			imageUrl: clerkUser.imageUrl,
		},
		update: {},
	});

	return user.id;
}
