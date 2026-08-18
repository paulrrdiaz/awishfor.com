import { beforeEach, describe, expect, it, vi } from "vitest";

const authMock = vi.hoisted(() => vi.fn());

vi.mock("@clerk/nextjs/server", () => ({ auth: authMock }));
vi.mock("@/server/db", () => ({ db: {} }));

import {
	createCallerFactory,
	createTRPCRouter,
	protectedProcedure,
} from "./trpc";

const authRouter = createTRPCRouter({
	viewer: protectedProcedure.query(({ ctx }) => ({ userId: ctx.userId })),
});
const createCaller = createCallerFactory(authRouter);

describe("protected API Clerk auth", () => {
	beforeEach(() => vi.clearAllMocks());

	it("rejects a signed-out API caller", async () => {
		authMock.mockResolvedValue({ userId: null });
		const caller = createCaller({ db: {}, headers: new Headers() } as never);

		await expect(caller.viewer()).rejects.toMatchObject({
			code: "UNAUTHORIZED",
		});
	});

	it("injects the signed-in Clerk id into protected procedures", async () => {
		authMock.mockResolvedValue({ userId: "clerk_owner" });
		const caller = createCaller({ db: {}, headers: new Headers() } as never);

		await expect(caller.viewer()).resolves.toEqual({ userId: "clerk_owner" });
	});
});
