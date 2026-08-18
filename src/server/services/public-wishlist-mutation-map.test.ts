import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const ROUTER_MUTATIONS = {
	"src/server/api/routers/category.ts": [
		"add",
		"rename",
		"delete",
		"reorder",
		"seedDefaults",
	],
	"src/server/api/routers/gift.ts": [
		"create",
		"update",
		"setVisibility",
		"delete",
		"reorder",
	],
	"src/server/api/routers/purchase.ts": [
		"markGiftPurchased",
		"undoRecentPurchase",
		"createManual",
		"delete",
	],
	"src/server/api/routers/wishlist.ts": [
		"publish",
		"publishWizard",
		"updateDesign",
		"updateSettings",
		"archive",
		"restore",
	],
} as const;

const SERVER_ACTIONS = [
	"createGiftAction",
	"updateGiftAction",
	"duplicateGiftAction",
	"setGiftVisibilityAction",
	"setGiftPriorityAction",
	"deleteGiftAction",
	"reorderGiftsAction",
] as const;

function source(path: string): string {
	return readFileSync(resolve(process.cwd(), path), "utf8");
}

function routerProcedure(fileSource: string, name: string): string {
	const start = fileSource.indexOf(`\n\t${name}:`);
	expect(start, `${name} procedure exists`).toBeGreaterThanOrEqual(0);
	const next = fileSource.slice(start + 2).search(/^\t\w+:/m);
	return next < 0
		? fileSource.slice(start)
		: fileSource.slice(start, start + 2 + next);
}

function serverAction(fileSource: string, name: string): string {
	const marker = `export async function ${name}`;
	const start = fileSource.indexOf(marker);
	expect(start, `${name} action exists`).toBeGreaterThanOrEqual(0);
	const next = fileSource.indexOf(
		"export async function ",
		start + marker.length,
	);
	return next < 0 ? fileSource.slice(start) : fileSource.slice(start, next);
}

describe("public wishlist mutation invalidation map", () => {
	it("maps every public-data router mutation to post-commit invalidation", () => {
		for (const [path, mutations] of Object.entries(ROUTER_MUTATIONS)) {
			const fileSource = source(path);
			for (const mutation of mutations) {
				expect(routerProcedure(fileSource, mutation)).toMatch(
					/invalidate(?:Gift)?Wishlist|invalidatePublicWishlist/,
				);
			}
		}
	});

	it("maps every dashboard gift mutation action to public invalidation", () => {
		const fileSource = source(
			"src/app/(protected)/dashboard/wishlists/[id]/gifts/actions.ts",
		);
		for (const action of SERVER_ACTIONS) {
			expect(serverAction(fileSource, action)).toContain("invalidateWishlist(");
		}
	});
});
