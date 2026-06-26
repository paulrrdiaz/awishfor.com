import { TRPCError } from "@trpc/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { wishlistRouter } from "@/server/api/routers/wishlist";
import { createCallerFactory } from "@/server/api/trpc";
import type { SaveDraftWishlistInput } from "@/server/validators/wishlist-save-draft.schema";

const authMock = vi.hoisted(() => vi.fn());
const saveWishlistDraftMock = vi.hoisted(() => vi.fn());

vi.mock("@clerk/nextjs/server", () => ({
	auth: authMock,
}));

vi.mock("@/server/services/wishlist.service", () => ({
	publishWishlist: vi.fn(),
	saveWishlistDraft: saveWishlistDraftMock,
}));

const createCaller = createCallerFactory(wishlistRouter);

const makeInput = (
	overrides: Partial<SaveDraftWishlistInput> = {},
): SaveDraftWishlistInput => ({
	title: "Lista de boda",
	slug: "lista-de-boda",
	eventType: "wedding",
	language: "es",
	currency: "PEN",
	heroTitle: "Nuestra boda",
	welcomeMessage: "Gracias por acompañarnos",
	thankYouMessage: "Con cariño",
	displayName: "Ana y Luis",
	eventDate: "2026-12-24",
	eventTime: "18:30",
	eventLocation: "Barranco",
	coverImageUrl: "https://example.com/cover.jpg",
	themeId: "soft",
	layoutId: "editorial",
	buttonStyle: "pill",
	fontPairing: "serif-soft",
	showHowItWorks: true,
	categories: ["Hogar"],
	gifts: [],
	savedWishlistId: null,
	lastSavedAt: null,
	force: false,
	...overrides,
});

describe("wishlistRouter.saveDraft", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("resolves the Clerk user to the local owner before calling the service", async () => {
		authMock.mockResolvedValue({ userId: "clerk_123" });
		saveWishlistDraftMock.mockResolvedValue({
			status: "saved",
			wishlistId: "wishlist_123",
			lastSavedAt: 123456,
		});
		const userFindUnique = vi.fn().mockResolvedValue({ id: 42 });
		const caller = createCaller({
			db: {
				user: {
					findUnique: userFindUnique,
				},
			},
			headers: new Headers(),
		} as never);

		const result = await caller.saveDraft(makeInput());

		expect(userFindUnique).toHaveBeenCalledWith({
			where: {
				clerkId: "clerk_123",
			},
			select: {
				id: true,
			},
		});
		expect(saveWishlistDraftMock).toHaveBeenCalledWith(
			expect.objectContaining({
				user: expect.any(Object),
			}),
			expect.objectContaining({
				ownerId: 42,
				title: "Lista de boda",
			}),
		);
		expect(result).toEqual({
			status: "saved",
			wishlistId: "wishlist_123",
			lastSavedAt: 123456,
		});
	});

	it("rejects unauthenticated requests before any owner lookup", async () => {
		authMock.mockResolvedValue({ userId: null });
		const userFindUnique = vi.fn();
		const caller = createCaller({
			db: {
				user: {
					findUnique: userFindUnique,
				},
			},
			headers: new Headers(),
		} as never);

		await expect(caller.saveDraft(makeInput())).rejects.toMatchObject({
			code: "UNAUTHORIZED",
		});

		expect(userFindUnique).not.toHaveBeenCalled();
		expect(saveWishlistDraftMock).not.toHaveBeenCalled();
	});

	it("rejects authenticated users that do not resolve to a local owner", async () => {
		authMock.mockResolvedValue({ userId: "clerk_missing" });
		const caller = createCaller({
			db: {
				user: {
					findUnique: vi.fn().mockResolvedValue(null),
				},
			},
			headers: new Headers(),
		} as never);

		await expect(caller.saveDraft(makeInput())).rejects.toMatchObject({
			code: "UNAUTHORIZED",
		});
	});

	it("passes through non-disclosing not-found errors from the service", async () => {
		authMock.mockResolvedValue({ userId: "clerk_123" });
		saveWishlistDraftMock.mockRejectedValue(
			new TRPCError({
				code: "NOT_FOUND",
				message: "Draft wishlist not found",
			}),
		);
		const caller = createCaller({
			db: {
				user: {
					findUnique: vi.fn().mockResolvedValue({ id: 42 }),
				},
			},
			headers: new Headers(),
		} as never);

		await expect(
			caller.saveDraft(
				makeInput({
					savedWishlistId: "wishlist_missing",
					lastSavedAt: 123,
				}),
			),
		).rejects.toMatchObject({
			code: "NOT_FOUND",
		});
	});
});
