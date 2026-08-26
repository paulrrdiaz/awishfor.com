import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { env } from "@/env";
import type { Prisma } from "@/generated/prisma/client";
import { WishlistStatus } from "@/generated/prisma/client";

const authorizationLifetimeMs = 5 * 60 * 1000;

type ViewAuthorizationPayload = {
	expiresAt: number;
	inviteId: string | null;
	wishlistId: string;
};

type WishlistViewDelegate = {
	create(args: Prisma.WishlistViewCreateArgs): Promise<unknown>;
	count(args: Prisma.WishlistViewCountArgs): Promise<number>;
	findFirst(
		args: Prisma.WishlistViewFindFirstArgs,
	): Promise<{ createdAt: Date } | null>;
	findMany(args: Prisma.WishlistViewFindManyArgs): Promise<unknown[]>;
};

type WishlistDelegate = {
	findFirst(args: Prisma.WishlistFindFirstArgs): Promise<{ id: string } | null>;
};

type InviteDelegate = {
	findFirst(args: Prisma.InviteFindFirstArgs): Promise<{ id: string } | null>;
	update(args: Prisma.InviteUpdateArgs): Promise<unknown>;
	updateMany(args: Prisma.InviteUpdateManyArgs): Promise<unknown>;
};

type WishlistViewTransaction = {
	invite: InviteDelegate;
	wishlist: WishlistDelegate;
	wishlistView: WishlistViewDelegate;
};

export type WishlistViewAnalyticsDatabase = WishlistViewTransaction & {
	$transaction<T>(
		callback: (tx: WishlistViewTransaction) => Promise<T>,
	): Promise<T>;
};

export type WishlistViewAnalytics = {
	latestViewAt: Date | null;
	totalViews: number;
	uniqueVisitors: number;
};

function getSecret(): string | undefined {
	return env.VIEW_ANALYTICS_HMAC_SECRET;
}

function encode(payload: ViewAuthorizationPayload): string {
	return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

function sign(encodedPayload: string, secret: string): string {
	return createHmac("sha256", secret)
		.update(encodedPayload)
		.digest("base64url");
}

function isPayload(value: unknown): value is ViewAuthorizationPayload {
	return (
		typeof value === "object" &&
		value !== null &&
		"wishlistId" in value &&
		"inviteId" in value &&
		"expiresAt" in value &&
		typeof value.wishlistId === "string" &&
		(value.inviteId === null || typeof value.inviteId === "string") &&
		typeof value.expiresAt === "number"
	);
}

/** Returns undefined when first-party view tracking is intentionally disabled. */
export function createWishlistViewAuthorization(
	{
		inviteId = null,
		wishlistId,
	}: { inviteId?: string | null; wishlistId: string },
	now = Date.now(),
): string | undefined {
	const secret = getSecret();
	if (!secret) return undefined;

	const payload = encode({
		expiresAt: now + authorizationLifetimeMs,
		inviteId,
		wishlistId,
	});
	return `${payload}.${sign(payload, secret)}`;
}

export function verifyWishlistViewAuthorization(
	authorization: string,
	now = Date.now(),
): ViewAuthorizationPayload | null {
	const secret = getSecret();
	if (!secret) return null;

	const [encodedPayload, signature, ...extra] = authorization.split(".");
	if (!encodedPayload || !signature || extra.length > 0) return null;
	const expectedSignature = sign(encodedPayload, secret);
	const actual = Buffer.from(signature);
	const expected = Buffer.from(expectedSignature);
	if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
		return null;
	}

	try {
		const payload: unknown = JSON.parse(
			Buffer.from(encodedPayload, "base64url").toString("utf8"),
		);
		return isPayload(payload) && payload.expiresAt > now ? payload : null;
	} catch {
		return null;
	}
}

export function hashWishlistVisitor({
	anonymousId,
	wishlistId,
}: {
	anonymousId: string;
	wishlistId: string;
}): string | undefined {
	const secret = getSecret();
	if (!secret) return undefined;
	return createHmac("sha256", secret)
		.update(`${wishlistId}:${anonymousId}`)
		.digest("hex");
}

export async function recordWishlistView(
	db: WishlistViewAnalyticsDatabase,
	{
		authorization,
		anonymousId,
	}: { anonymousId: string; authorization: string },
): Promise<"disabled" | "recorded" | "rejected"> {
	const payload = verifyWishlistViewAuthorization(authorization);
	const visitorHash = hashWishlistVisitor({
		anonymousId,
		wishlistId: payload?.wishlistId ?? "",
	});
	if (!payload || !visitorHash) return getSecret() ? "rejected" : "disabled";

	return db.$transaction(async (tx) => {
		const wishlist = await tx.wishlist.findFirst({
			where: { id: payload.wishlistId, status: WishlistStatus.published },
			select: { id: true },
		});
		if (!wishlist) return "rejected";

		if (payload.inviteId) {
			const invite = await tx.invite.findFirst({
				where: { id: payload.inviteId, wishlistId: wishlist.id },
				select: { id: true },
			});
			if (!invite) return "rejected";
		}

		const createdAt = new Date();
		await tx.wishlistView.create({
			data: {
				wishlistId: wishlist.id,
				inviteId: payload.inviteId,
				visitorHash,
				createdAt,
			},
		});

		if (payload.inviteId) {
			await tx.invite.updateMany({
				where: { id: payload.inviteId, openedAt: null },
				data: { openedAt: createdAt },
			});
			await tx.invite.update({
				where: { id: payload.inviteId },
				data: {
					lastViewedAt: createdAt,
					viewCount: { increment: 1 },
				},
			});
		}

		return "recorded";
	});
}

export async function getWishlistViewAnalytics(
	db: Pick<WishlistViewAnalyticsDatabase, "wishlistView">,
	wishlistId: string,
): Promise<WishlistViewAnalytics> {
	const [totalViews, uniqueVisitorRows, latestView] = await Promise.all([
		db.wishlistView.count({ where: { wishlistId } }),
		db.wishlistView.findMany({
			where: { wishlistId },
			distinct: ["visitorHash"],
			select: { visitorHash: true },
		}),
		db.wishlistView.findFirst({
			where: { wishlistId },
			orderBy: { createdAt: "desc" },
			select: { createdAt: true },
		}),
	]);

	return {
		totalViews,
		uniqueVisitors: uniqueVisitorRows.length,
		latestViewAt: latestView?.createdAt ?? null,
	};
}
