import { beforeEach, describe, expect, it, vi } from "vitest";
import { importerRouter } from "@/server/api/routers/importer";
import { createCallerFactory } from "@/server/api/trpc";

const authMock = vi.hoisted(() => vi.fn());
const importGiftFromUrlMock = vi.hoisted(() => vi.fn());
const persistImportedGiftImageMock = vi.hoisted(() => vi.fn());

vi.mock("@clerk/nextjs/server", () => ({
	auth: authMock,
}));

vi.mock("@/server/db", () => ({
	db: {},
}));

vi.mock("@/server/services/importer.service", () => ({
	importGiftFromUrl: importGiftFromUrlMock,
}));

vi.mock("@/server/services/imported-image.service", () => ({
	persistImportedGiftImage: persistImportedGiftImageMock,
}));

const createCaller = createCallerFactory(importerRouter);

const makeCtx = () =>
	({
		db: {},
		headers: new Headers(),
	}) as never;

describe("importerRouter.importFromUrl", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		authMock.mockResolvedValue({ userId: null });
	});

	it("allows a signed-out caller without persisting an image", async () => {
		importGiftFromUrlMock.mockResolvedValue({
			ok: true,
			draft: { productUrl: "https://example.com/product" },
		});
		const caller = createCaller(makeCtx());
		await expect(
			caller.importFromUrl({ url: "https://example.com/product" }),
		).resolves.toMatchObject({ ok: true });
		expect(importGiftFromUrlMock).toHaveBeenCalledWith(
			expect.objectContaining({ persistImage: undefined }),
			{ url: "https://example.com/product" },
		);
	});

	it("rejects an invalid URL with a validation error", async () => {
		const caller = createCaller(makeCtx());
		await expect(
			caller.importFromUrl({ url: "not-a-url" }),
		).rejects.toMatchObject({ code: "BAD_REQUEST" });
		expect(importGiftFromUrlMock).not.toHaveBeenCalled();
	});

	it("rejects a non-http(s) scheme with a validation error", async () => {
		const caller = createCaller(makeCtx());
		await expect(
			caller.importFromUrl({ url: "ftp://example.com/file" }),
		).rejects.toMatchObject({ code: "BAD_REQUEST" });
	});

	it("returns the draft from the service on a valid request", async () => {
		authMock.mockResolvedValue({ userId: "clerk_owner" });
		const draft = {
			name: "Cool Widget",
			productUrl: "https://example.com/widget",
			imageUrl: "https://example.com/widget.jpg",
			storeName: "Example Store",
			priceAmount: 49.99,
			priceCurrency: "USD",
		};
		importGiftFromUrlMock.mockResolvedValue({ ok: true, draft });
		const caller = createCaller(makeCtx());

		const result = await caller.importFromUrl({
			url: "https://example.com/widget",
		});

		expect(result).toEqual({ ok: true, draft });
		expect(importGiftFromUrlMock).toHaveBeenCalledWith(
			{
				brightDataApiKey: undefined,
				brightDataWebUnlockerZone: undefined,
				persistImage: persistImportedGiftImageMock,
			},
			{ url: "https://example.com/widget" },
		);
	});

	it("returns a friendly error result when the service returns an error", async () => {
		importGiftFromUrlMock.mockResolvedValue({
			ok: false,
			error: { kind: "timeout" },
		});
		const caller = createCaller(makeCtx());

		const result = await caller.importFromUrl({
			url: "https://slow.example.com/",
		});

		expect(result).toEqual({ ok: false, error: { kind: "timeout" } });
	});

	it("passes through a metadata_unavailable error result unchanged", async () => {
		importGiftFromUrlMock.mockResolvedValue({
			ok: false,
			error: { kind: "metadata_unavailable" },
		});
		const caller = createCaller(makeCtx());

		const result = await caller.importFromUrl({
			url: "https://minimal.example.com/item",
		});

		expect(result).toEqual({
			ok: false,
			error: { kind: "metadata_unavailable" },
		});
	});
});
