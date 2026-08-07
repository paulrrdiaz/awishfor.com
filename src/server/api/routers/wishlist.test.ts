import { TRPCError } from "@trpc/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { wishlistRouter } from "@/server/api/routers/wishlist";
import { createCallerFactory } from "@/server/api/trpc";
import type { SaveDraftWishlistInput } from "@/server/validators/wishlist-save-draft.schema";

const authMock = vi.hoisted(() => vi.fn());
const currentUserMock = vi.hoisted(() => vi.fn());
const publishWishlistMock = vi.hoisted(() => vi.fn());
const publishWishlistFromWizardMock = vi.hoisted(() => vi.fn());
const saveWishlistDraftMock = vi.hoisted(() => vi.fn());
const revalidatePathMock = vi.hoisted(() => vi.fn());

vi.mock("@clerk/nextjs/server", () => ({
	auth: authMock,
	currentUser: currentUserMock,
}));

vi.mock("@/server/services/wishlist.service", () => ({
	publishWishlist: publishWishlistMock,
	publishWishlistFromWizard: publishWishlistFromWizardMock,
	saveWishlistDraft: saveWishlistDraftMock,
}));

vi.mock("next/cache", () => ({
	revalidatePath: revalidatePathMock,
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
	welcomeMessage: "Gracias por acompañarnos",
	thankYouMessage: "Con cariño",
	eventDate: "2026-12-24",
	eventTime: "18:30",
	eventLocation: "Barranco",
	coverImages: [
		{ url: "https://example.com/cover.jpg", width: 1600, height: 900 },
	],
	themeId: "soft",
	layoutId: "editorial",
	buttonStyle: "pill",
	headingFont: null,
	bodyFont: null,
	showHowItWorks: true,
	categories: ["Hogar"],
	gifts: [],
	savedWishlistId: null,
	lastSavedAt: null,
	force: false,
	...overrides,
});

const now = new Date("2026-06-28T10:00:00.000Z");

function makeStoredWishlist(overrides: Record<string, unknown> = {}) {
	return {
		id: "wishlist_123",
		ownerId: 42,
		slug: "lista-de-boda",
		title: "Lista de boda",
		eventType: "wedding",
		language: "es",
		currency: "PEN",
		welcomeMessage: "Gracias por acompañarnos",
		welcomeMessageAttribution: "Lucía y Marco",
		thankYouMessage: "Con cariño",
		eventDate: null,
		eventTime: null,
		eventLocation: "Barranco",
		dressCode: null,
		images: [
			{
				id: "img_1",
				url: "https://example.com/cover.jpg",
				width: 1600,
				height: 900,
				orientation: "landscape",
			},
		],
		themeId: "cielo-suave",
		layoutId: "magazine-editorial",
		buttonStyle: "rounded",
		showHowItWorks: true,
		status: "draft",
		publishedAt: null,
		archivedAt: null,
		createdAt: now,
		updatedAt: now,
		categories: [{ id: "cat_1", name: "Hogar", sortOrder: 0 }],
		gifts: [
			{
				id: "gift_1",
				name: "Cafetera",
				productUrl: null,
				imageUrl: null,
				priceAmount: { toString: () => "120.5" },
				category: { name: "Hogar" },
				quantityNeeded: 1,
				priority: "medium",
				publicNote: null,
				internalNote: null,
				visibilityStatus: "available",
				deletedAt: null,
				sortOrder: 0,
			},
		],
		...overrides,
	};
}

function makeCaller(db: Record<string, unknown>) {
	return createCaller({
		db,
		headers: new Headers(),
	} as never);
}

function makeWishlistDb({
	userFindUnique = vi.fn().mockResolvedValue({ id: 42 }),
	wishlistFindFirst = vi.fn(),
	wishlistUpdate = vi.fn(),
	imageDeleteMany = vi.fn().mockResolvedValue({ count: 0 }),
	imageCreateMany = vi.fn().mockResolvedValue({ count: 0 }),
}: {
	userFindUnique?: ReturnType<typeof vi.fn>;
	wishlistFindFirst?: ReturnType<typeof vi.fn>;
	wishlistUpdate?: ReturnType<typeof vi.fn>;
	imageDeleteMany?: ReturnType<typeof vi.fn>;
	imageCreateMany?: ReturnType<typeof vi.fn>;
}) {
	return {
		user: {
			findUnique: userFindUnique,
		},
		wishlist: {
			findFirst: wishlistFindFirst,
			update: wishlistUpdate,
		},
		wishlistImage: {
			deleteMany: imageDeleteMany,
			createMany: imageCreateMany,
		},
		$transaction: vi.fn(async (callback: (tx: unknown) => unknown) =>
			callback({
				wishlist: { update: wishlistUpdate },
				wishlistImage: {
					deleteMany: imageDeleteMany,
					createMany: imageCreateMany,
				},
			}),
		),
	};
}

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
		currentUserMock.mockResolvedValue(null);
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

	it("provisions a local owner on demand when the webhook hasn't synced it yet", async () => {
		authMock.mockResolvedValue({ userId: "clerk_new" });
		currentUserMock.mockResolvedValue({
			id: "clerk_new",
			emailAddresses: [{ id: "email_1", emailAddress: "new@example.com" }],
			primaryEmailAddressId: "email_1",
			firstName: "New",
			lastName: "User",
			imageUrl: "https://example.com/avatar.png",
		});
		saveWishlistDraftMock.mockResolvedValue({
			status: "saved",
			wishlistId: "wishlist_123",
			lastSavedAt: 123456,
		});
		const userUpsert = vi.fn().mockResolvedValue({ id: 99 });
		const caller = createCaller({
			db: {
				user: {
					findUnique: vi.fn().mockResolvedValue(null),
					upsert: userUpsert,
				},
			},
			headers: new Headers(),
		} as never);

		await caller.saveDraft(makeInput());

		expect(userUpsert).toHaveBeenCalledWith({
			where: { clerkId: "clerk_new" },
			create: {
				clerkId: "clerk_new",
				email: "new@example.com",
				name: "New User",
				imageUrl: "https://example.com/avatar.png",
			},
			update: {},
		});
		expect(saveWishlistDraftMock).toHaveBeenCalledWith(
			expect.objectContaining({ user: expect.any(Object) }),
			expect.objectContaining({ ownerId: 99 }),
		);
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

describe("wishlistRouter.getById", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		authMock.mockResolvedValue({ userId: "clerk_123" });
	});

	it("returns a caller-owned wishlist as a serializable detail view", async () => {
		const wishlistFindFirst = vi.fn().mockResolvedValue(makeStoredWishlist());
		const db = makeWishlistDb({ wishlistFindFirst });
		const caller = makeCaller(db);

		const result = await caller.getById({ id: "wishlist_123" });

		expect(wishlistFindFirst).toHaveBeenCalledWith(
			expect.objectContaining({
				where: {
					id: "wishlist_123",
					ownerId: 42,
				},
			}),
		);
		expect(result).toMatchObject({
			id: "wishlist_123",
			slug: "lista-de-boda",
			welcomeMessageAttribution: "Lucía y Marco",
			themeId: "cielo-suave",
			layoutId: "magazine-editorial",
			images: [
				{
					url: "https://example.com/cover.jpg",
					width: 1600,
					height: 900,
					orientation: "landscape",
				},
			],
			gifts: [
				expect.objectContaining({
					id: "gift_1",
					category: "Hogar",
					priceAmount: "120.5",
					hidden: false,
				}),
			],
		});
		expect(result.createdAt).toBe("2026-06-28T10:00:00.000Z");
	});

	it("rejects a wishlist owned by another user without disclosing existence", async () => {
		const db = makeWishlistDb({
			wishlistFindFirst: vi.fn().mockResolvedValue(null),
		});
		const caller = makeCaller(db);

		await expect(
			caller.getById({ id: "wishlist_other" }),
		).rejects.toMatchObject({
			code: "NOT_FOUND",
		});
	});

	it("rejects a missing wishlist", async () => {
		const db = makeWishlistDb({
			wishlistFindFirst: vi.fn().mockResolvedValue(null),
		});
		const caller = makeCaller(db);

		await expect(
			caller.getById({ id: "wishlist_missing" }),
		).rejects.toMatchObject({
			code: "NOT_FOUND",
		});
	});
});

describe("wishlistRouter.updateSettings", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		authMock.mockResolvedValue({ userId: "clerk_123" });
	});

	it("persists the welcome message attribution for the owner", async () => {
		const wishlistUpdate = vi.fn().mockResolvedValue({
			id: "wishlist_123",
			slug: "lista-de-boda",
			updatedAt: now,
		});
		const db = makeWishlistDb({
			wishlistFindFirst: vi.fn().mockResolvedValue({
				id: "wishlist_123",
				slug: "lista-de-boda",
			}),
			wishlistUpdate,
		});
		const caller = makeCaller(db);

		await caller.updateSettings({
			id: "wishlist_123",
			title: "Lista de boda",
			slug: "lista-de-boda",
			welcomeMessage: "Gracias por acompañarnos",
			welcomeMessageAttribution: "Lucía y Marco",
			language: "es",
			currency: "PEN",
			showHowItWorks: true,
		});

		expect(wishlistUpdate).toHaveBeenCalledWith(
			expect.objectContaining({
				data: expect.objectContaining({
					welcomeMessageAttribution: "Lucía y Marco",
				}),
			}),
		);
		expect(revalidatePathMock).toHaveBeenCalledWith("/w/lista-de-boda");
	});
});

describe("wishlistRouter.updateDesign", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		authMock.mockResolvedValue({ userId: "clerk_123" });
	});

	it("persists only design fields for the owner and revalidates the public page", async () => {
		const wishlistFindFirst = vi.fn().mockResolvedValue({
			id: "wishlist_123",
			slug: "lista-de-boda",
		});
		const wishlistUpdate = vi.fn().mockResolvedValue({
			id: "wishlist_123",
			slug: "lista-de-boda",
			themeId: "crema-elegante",
			layoutId: "editorial",
			headingFont: null,
			bodyFont: null,
			buttonStyle: "pill",
			updatedAt: now,
			images: [
				{
					id: "img_1",
					wishlistId: "wishlist_123",
					url: "https://example.com/cover.jpg",
					width: 1600,
					height: 900,
					orientation: "landscape",
					sortOrder: 0,
					createdAt: now,
				},
			],
		});
		const imageDeleteMany = vi.fn().mockResolvedValue({ count: 0 });
		const imageCreateMany = vi.fn().mockResolvedValue({ count: 1 });
		const db = makeWishlistDb({
			wishlistFindFirst,
			wishlistUpdate,
			imageDeleteMany,
			imageCreateMany,
		});
		const caller = makeCaller(db);

		const result = await caller.updateDesign({
			id: "wishlist_123",
			themeId: "crema-elegante",
			layoutId: "editorial",
			buttonStyle: "pill",
			coverImages: [
				{ url: "https://example.com/cover.jpg", width: 1600, height: 900 },
			],
		});

		expect(wishlistFindFirst).toHaveBeenCalledWith({
			where: {
				id: "wishlist_123",
				ownerId: 42,
			},
			select: {
				id: true,
				slug: true,
			},
		});
		expect(imageDeleteMany).toHaveBeenCalledWith({
			where: { wishlistId: "wishlist_123" },
		});
		expect(imageCreateMany).toHaveBeenCalledWith({
			data: [
				{
					wishlistId: "wishlist_123",
					url: "https://example.com/cover.jpg",
					width: 1600,
					height: 900,
					orientation: "landscape",
					sortOrder: 0,
				},
			],
		});
		expect(wishlistUpdate).toHaveBeenCalledWith({
			where: {
				id: "wishlist_123",
			},
			data: {
				themeId: "crema-elegante",
				layoutId: "editorial",
				headingFont: null,
				bodyFont: null,
				buttonStyle: "pill",
			},
			select: {
				id: true,
				slug: true,
				themeId: true,
				layoutId: true,
				headingFont: true,
				bodyFont: true,
				buttonStyle: true,
				updatedAt: true,
				images: {
					orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
				},
			},
		});
		expect(revalidatePathMock).toHaveBeenCalledWith("/w/lista-de-boda");
		expect(result.updatedAt).toBe("2026-06-28T10:00:00.000Z");
		expect(result.images).toEqual([
			{
				url: "https://example.com/cover.jpg",
				width: 1600,
				height: 900,
				orientation: "landscape",
			},
		]);
	});

	it("allows published wishlist design updates by not constraining status", async () => {
		const wishlistFindFirst = vi.fn().mockResolvedValue({
			id: "wishlist_published",
			slug: "published-list",
		});
		const wishlistUpdate = vi.fn().mockResolvedValue({
			id: "wishlist_published",
			slug: "published-list",
			themeId: "jardin-verde",
			layoutId: "split-image-right",
			headingFont: null,
			bodyFont: null,
			buttonStyle: "rounded",
			updatedAt: now,
			images: [],
		});
		const db = makeWishlistDb({ wishlistFindFirst, wishlistUpdate });
		const caller = makeCaller(db);

		await caller.updateDesign({
			id: "wishlist_published",
			themeId: "jardin-verde",
			layoutId: "split-image-right",
			buttonStyle: "rounded",
			coverImages: [
				{ url: "https://example.com/new.jpg", width: 1600, height: 900 },
			],
		});

		expect(wishlistFindFirst).toHaveBeenCalledWith(
			expect.objectContaining({
				where: {
					id: "wishlist_published",
					ownerId: 42,
				},
			}),
		);
		expect(wishlistFindFirst.mock.calls[0]?.[0].where).not.toHaveProperty(
			"status",
		);
		expect(wishlistUpdate).toHaveBeenCalled();
		expect(revalidatePathMock).toHaveBeenCalledWith("/w/published-list");
	});

	it("rejects non-owners without updating or revalidating", async () => {
		const wishlistUpdate = vi.fn();
		const db = makeWishlistDb({
			wishlistFindFirst: vi.fn().mockResolvedValue(null),
			wishlistUpdate,
		});
		const caller = makeCaller(db);

		await expect(
			caller.updateDesign({
				id: "wishlist_other",
				themeId: "crema-elegante",
				layoutId: "editorial",
				buttonStyle: "pill",
			}),
		).rejects.toMatchObject({
			code: "NOT_FOUND",
		});

		expect(wishlistUpdate).not.toHaveBeenCalled();
		expect(revalidatePathMock).not.toHaveBeenCalled();
	});
});

describe("wishlistRouter.publish", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("resolves the Clerk user to the local owner before publishing", async () => {
		authMock.mockResolvedValue({ userId: "clerk_123" });
		publishWishlistMock.mockResolvedValue({
			id: "wishlist_123",
			slug: "lista-de-boda",
			status: "published",
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

		await caller.publish({ wishlistId: "wishlist_123" });

		expect(userFindUnique).toHaveBeenCalledWith({
			where: {
				clerkId: "clerk_123",
			},
			select: {
				id: true,
			},
		});
		expect(publishWishlistMock).toHaveBeenCalledWith(
			expect.objectContaining({
				user: expect.any(Object),
			}),
			{
				ownerId: 42,
				wishlistId: "wishlist_123",
			},
		);
	});

	it("rejects unauthenticated publish requests before owner lookup", async () => {
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

		await expect(
			caller.publish({ wishlistId: "wishlist_123" }),
		).rejects.toMatchObject({
			code: "UNAUTHORIZED",
		});

		expect(userFindUnique).not.toHaveBeenCalled();
		expect(publishWishlistMock).not.toHaveBeenCalled();
	});
});

describe("wishlistRouter.publishWizard", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("derives the owner from Clerk and never accepts owner identity from the client", async () => {
		authMock.mockResolvedValue({ userId: "clerk_123" });
		publishWishlistFromWizardMock.mockResolvedValue({
			status: "published",
			wishlistId: "wishlist_123",
			slug: "lista-de-boda",
			publicUrlPath: "/w/lista-de-boda",
			dashboardUrlPath: "/dashboard",
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

		await caller.publishWizard(makeInput());

		expect(publishWishlistFromWizardMock).toHaveBeenCalledWith(
			expect.objectContaining({
				user: expect.any(Object),
			}),
			expect.objectContaining({
				ownerId: 42,
				title: "Lista de boda",
				savedWishlistId: null,
			}),
		);
	});

	it("rejects unauthenticated wizard publish requests before owner lookup", async () => {
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

		await expect(caller.publishWizard(makeInput())).rejects.toMatchObject({
			code: "UNAUTHORIZED",
		});

		expect(userFindUnique).not.toHaveBeenCalled();
		expect(publishWishlistFromWizardMock).not.toHaveBeenCalled();
	});
});
