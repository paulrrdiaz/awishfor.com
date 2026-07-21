import { describe, expect, it } from "vitest";
import { EVENT_TYPE_PRESETS } from "@/config/event-type-presets";
import {
	createWishlistWizardStore,
	migratePersistedWishlistWizardState,
} from "./wishlist-wizard.store";

function makeStore() {
	return createWishlistWizardStore();
}

describe("wishlist-wizard store", () => {
	describe("setEventType", () => {
		it("seeds default categories and design from preset", () => {
			const store = makeStore();
			store.getState().setEventType("baby_shower");
			const { draft } = store.getState();
			const preset = EVENT_TYPE_PRESETS.baby_shower;
			expect(draft.eventType).toBe("baby_shower");
			expect(draft.categories).toEqual(preset.defaultCategories);
			expect(draft.themeId).toBe(preset.defaultThemeId);
			expect(draft.layoutId).toBe(preset.defaultLayoutId);
		});

		it("seeds copy into untouched fields", () => {
			const store = makeStore();
			store.getState().setEventType("birthday");
			const { draft } = store.getState();
			const preset = EVENT_TYPE_PRESETS.birthday;
			expect(draft.heroTitle).toBe("Wishlist de cumpleaños");
			expect(draft.welcomeMessage).toBe(preset.defaultWelcomeMessage);
			expect(draft.thankYouMessage).toBe(preset.defaultThankYouMessage);
		});

		it("interpolates displayName into the hero title template", () => {
			const store = makeStore();
			store.getState().setField("displayName", "María");
			store.getState().setEventType("birthday");
			const { draft } = store.getState();
			expect(draft.heroTitle).toBe("Wishlist de cumpleaños de María");
		});

		it("keeps hero title in sync as displayName changes, until touched", () => {
			const store = makeStore();
			store.getState().setEventType("birthday");
			store.getState().setField("displayName", "María");
			expect(store.getState().draft.heroTitle).toBe(
				"Wishlist de cumpleaños de María",
			);
			store.getState().setField("displayName", "María García");
			expect(store.getState().draft.heroTitle).toBe(
				"Wishlist de cumpleaños de María García",
			);
			store.getState().setField("heroTitle", "Título personalizado");
			store.getState().setField("displayName", "Otro nombre");
			expect(store.getState().draft.heroTitle).toBe("Título personalizado");
		});

		it("preserves edited copy when event type changes", () => {
			const store = makeStore();
			store.getState().setEventType("birthday");
			const editedWelcome = "Mensaje personalizado de bienvenida";
			store.getState().setField("welcomeMessage", editedWelcome);
			store.getState().setEventType("wedding");
			const { draft } = store.getState();
			expect(draft.welcomeMessage).toBe(editedWelcome);
			expect(draft.heroTitle).toBe("Wishlist de boda");
			const weddingPreset = EVENT_TYPE_PRESETS.wedding;
			expect(draft.thankYouMessage).toBe(weddingPreset.defaultThankYouMessage);
		});

		it("preserves all touched copy fields across event-type change", () => {
			const store = makeStore();
			store.getState().setEventType("birthday");
			const customHero = "Mi título personalizado";
			const customThankYou = "Mi mensaje de gracias";
			store.getState().setField("heroTitle", customHero);
			store.getState().setField("thankYouMessage", customThankYou);
			store.getState().setEventType("housewarming");
			const { draft } = store.getState();
			expect(draft.heroTitle).toBe(customHero);
			expect(draft.thankYouMessage).toBe(customThankYou);
			expect(draft.welcomeMessage).toBe(
				EVENT_TYPE_PRESETS.housewarming.defaultWelcomeMessage,
			);
		});
	});

	describe("regenerateCopy", () => {
		it("resets all copy fields to current preset defaults", () => {
			const store = makeStore();
			store.getState().setEventType("wedding");
			store.getState().setField("heroTitle", "Título editado");
			store.getState().setField("welcomeMessage", "Bienvenida editada");
			store.getState().regenerateCopy();
			const { draft, copyTouched } = store.getState();
			const preset = EVENT_TYPE_PRESETS.wedding;
			expect(draft.heroTitle).toBe("Wishlist de boda");
			expect(draft.welcomeMessage).toBe(preset.defaultWelcomeMessage);
			expect(draft.thankYouMessage).toBe(preset.defaultThankYouMessage);
			expect(copyTouched.heroTitle).toBe(false);
			expect(copyTouched.welcomeMessage).toBe(false);
			expect(copyTouched.thankYouMessage).toBe(false);
		});

		it("no-ops when no event type is set", () => {
			const store = makeStore();
			const before = store.getState().draft;
			store.getState().regenerateCopy();
			expect(store.getState().draft).toEqual(before);
		});
	});

	describe("stale-draft detection", () => {
		it("isStale returns false for fresh drafts", () => {
			const store = makeStore();
			store.getState().setEventType("general");
			const { updatedAt } = store.getState();
			expect(updatedAt).not.toBeNull();
			const thirtyOneDaysAgo = Date.now() - 31 * 24 * 60 * 60 * 1000;
			expect(Number(updatedAt) > thirtyOneDaysAgo).toBe(true);
		});

		it("needsRecovery is false by default", () => {
			const store = makeStore();
			expect(store.getState().needsRecovery).toBe(false);
		});

		it("dismissRecovery with discard clears the draft", () => {
			const store = makeStore();
			store.getState().setEventType("birthday");
			store.setState({ needsRecovery: true });
			store.getState().dismissRecovery(true);
			const { draft, needsRecovery } = store.getState();
			expect(needsRecovery).toBe(false);
			expect(draft.eventType).toBeNull();
		});

		it("dismissRecovery without discard keeps the draft", () => {
			const store = makeStore();
			store.getState().setEventType("birthday");
			store.setState({ needsRecovery: true });
			store.getState().dismissRecovery(false);
			const { draft, needsRecovery } = store.getState();
			expect(needsRecovery).toBe(false);
			expect(draft.eventType).toBe("birthday");
		});
	});

	describe("reset", () => {
		it("clears all draft state including extended fields", () => {
			const store = makeStore();
			store.getState().setEventType("wedding");
			store.getState().setField("heroTitle", "Título");
			store.getState().setField("title", "Mi boda");
			store.getState().addGift({
				name: "Regalo de prueba",
				productUrl: null,
				imageUrl: null,
				priceAmount: null,
				category: "General",
				quantityNeeded: 1,
				priority: "medium",
				publicNote: "",
				internalNote: "",
				hidden: false,
			});
			store.getState().reset();
			const {
				draft,
				copyTouched,
				updatedAt,
				savedWishlistId,
				savedSlug,
				lastSavedAt,
				slugTouched,
			} = store.getState();
			expect(draft.eventType).toBeNull();
			expect(draft.heroTitle).toBe("");
			expect(draft.title).toBe("");
			expect(draft.slug).toBe("");
			expect(draft.gifts).toEqual([]);
			expect(copyTouched.heroTitle).toBe(false);
			expect(updatedAt).toBeNull();
			expect(savedWishlistId).toBeNull();
			expect(savedSlug).toBeNull();
			expect(lastSavedAt).toBeNull();
			expect(slugTouched).toBe(false);
		});
	});

	describe("saved draft metadata", () => {
		it("stores saved draft metadata after a successful save", () => {
			const store = makeStore();

			store
				.getState()
				.setSavedDraftMetadata("wishlist_123", 123456789, "lista-guardada");

			expect(store.getState().savedWishlistId).toBe("wishlist_123");
			expect(store.getState().savedSlug).toBe("lista-guardada");
			expect(store.getState().lastSavedAt).toBe(123456789);
		});

		it("clears saved draft metadata without affecting the local draft", () => {
			const store = makeStore();
			store.getState().setField("title", "Mi wishlist");
			store
				.getState()
				.setSavedDraftMetadata("wishlist_123", 123456789, "mi-wishlist");

			store.getState().clearSavedDraftMetadata();

			expect(store.getState().draft.title).toBe("Mi wishlist");
			expect(store.getState().savedWishlistId).toBeNull();
			expect(store.getState().savedSlug).toBeNull();
			expect(store.getState().lastSavedAt).toBeNull();
		});

		it("replaces the local draft with server content and metadata", () => {
			const store = makeStore();

			store.getState().replaceDraft(
				{
					eventType: "wedding",
					title: "Versión del dashboard",
					slug: "version-dashboard",
					displayName: "Ana y Luis",
					eventDate: "2026-12-24",
					eventTime: "18:30",
					eventLocation: "Barranco",
					dressCode: "",
					coverImageUrl: null,
					coverImageUrls: [],
					heroTitle: "Nuestra boda",
					welcomeMessage: "Bienvenidos",
					thankYouMessage: "Gracias",
					categories: ["Hogar"],
					themeId: "soft",
					layoutId: "editorial",
					buttonStyle: "pill",
					fontPairing: "serif-soft",
					headingFont: null,
					bodyFont: null,
					showHowItWorks: true,
					gifts: [
						{
							id: "gift_1",
							name: "Juego de sábanas",
							productUrl: null,
							imageUrl: null,
							priceAmount: 120,
							category: "Hogar",
							quantityNeeded: 2,
							priority: "high",
							publicNote: "Algodón",
							internalNote: "",
							hidden: false,
							sortOrder: 0,
						},
					],
				},
				{
					savedWishlistId: "wishlist_123",
					savedSlug: "version-dashboard",
					lastSavedAt: 123456789,
				},
			);

			const {
				draft,
				copyTouched,
				savedWishlistId,
				savedSlug,
				lastSavedAt,
				slugTouched,
			} = store.getState();
			expect(draft.title).toBe("Versión del dashboard");
			expect(draft.slug).toBe("version-dashboard");
			expect(draft.gifts[0]?.name).toBe("Juego de sábanas");
			expect(copyTouched.heroTitle).toBe(true);
			expect(copyTouched.welcomeMessage).toBe(true);
			expect(copyTouched.thankYouMessage).toBe(true);
			expect(slugTouched).toBe(true);
			expect(savedWishlistId).toBe("wishlist_123");
			expect(savedSlug).toBe("version-dashboard");
			expect(lastSavedAt).toBe(123456789);
		});
	});

	describe("publish success session state", () => {
		it("clears persisted draft data while keeping publish share metadata in memory", () => {
			const store = makeStore();
			store.getState().setField("title", "Mi wishlist");
			store
				.getState()
				.setSavedDraftMetadata("wishlist_123", 123456789, "mi-wishlist");

			store.getState().completePublish({
				wishlistId: "wishlist_123",
				slug: "mi-wishlist",
				publicUrlPath: "/w/mi-wishlist",
				dashboardUrlPath: "/dashboard",
			});

			const state = store.getState();
			expect(state.draft.title).toBe("");
			expect(state.savedWishlistId).toBeNull();
			expect(state.savedSlug).toBeNull();
			expect(state.lastSavedAt).toBeNull();
			expect(state.publishSuccess).toEqual({
				wishlistId: "wishlist_123",
				slug: "mi-wishlist",
				publicUrlPath: "/w/mi-wishlist",
				dashboardUrlPath: "/dashboard",
			});
		});

		it("drops publish success once the user edits a new draft", () => {
			const store = makeStore();
			store.getState().completePublish({
				wishlistId: "wishlist_123",
				slug: "mi-wishlist",
				publicUrlPath: "/w/mi-wishlist",
				dashboardUrlPath: "/dashboard",
			});

			store.getState().setField("title", "Nueva wishlist");

			expect(store.getState().publishSuccess).toBeNull();
		});
	});

	describe("slug auto-tracking", () => {
		it("slug auto-fills from title when slugTouched is false", () => {
			const store = makeStore();
			store.getState().setField("title", "Mi Lista de Bodas");
			const { draft, slugTouched } = store.getState();
			expect(draft.slug).toBe("mi-lista-de-bodas");
			expect(slugTouched).toBe(false);
		});

		it("slug does not update from title after manual slug edit", () => {
			const store = makeStore();
			store.getState().setField("title", "Cumpleaños de Ana");
			store.getState().setField("slug", "mi-slug-personalizado");
			store
				.getState()
				.setField("title", "Nuevo título completamente diferente");
			const { draft, slugTouched } = store.getState();
			expect(draft.slug).toBe("mi-slug-personalizado");
			expect(slugTouched).toBe(true);
		});

		it("editing slug sets slugTouched", () => {
			const store = makeStore();
			expect(store.getState().slugTouched).toBe(false);
			store.getState().setField("slug", "custom-slug");
			expect(store.getState().slugTouched).toBe(true);
		});

		it("reset clears slugTouched", () => {
			const store = makeStore();
			store.getState().setField("slug", "custom-slug");
			expect(store.getState().slugTouched).toBe(true);
			store.getState().reset();
			expect(store.getState().slugTouched).toBe(false);
		});

		it("slug is empty string when title is too short to slugify", () => {
			const store = makeStore();
			store.getState().setField("title", "ab");
			expect(store.getState().draft.slug).toBe("");
		});
	});

	describe("category actions", () => {
		it("addCategory trims and deduplicates names case-insensitively", () => {
			const store = makeStore();

			store.getState().addCategory("  Cocina  ");
			store.getState().addCategory("cocina");

			expect(store.getState().draft.categories).toEqual(["Cocina"]);
		});

		it("renameCategory updates categories and assigned draft gifts", () => {
			const store = makeStore();
			store.getState().addCategory("Cocina");
			store.getState().addGift({
				name: "Batidora",
				productUrl: null,
				imageUrl: null,
				priceAmount: null,
				category: "cocina",
				quantityNeeded: 1,
				priority: "medium",
				publicNote: "",
				internalNote: "",
				hidden: false,
			});

			store.getState().renameCategory("Cocina", "  Cocina y bar  ");

			expect(store.getState().draft.categories).toEqual(["Cocina y bar"]);
			expect(store.getState().draft.gifts[0]?.category).toBe("Cocina y bar");
		});

		it("removeCategory clears matching draft gift categories", () => {
			const store = makeStore();
			store.getState().addCategory("Dormitorio");
			store.getState().addGift({
				name: "Sábanas",
				productUrl: null,
				imageUrl: null,
				priceAmount: null,
				category: "dormitorio",
				quantityNeeded: 1,
				priority: "medium",
				publicNote: "",
				internalNote: "",
				hidden: false,
			});

			store.getState().removeCategory("Dormitorio");

			expect(store.getState().draft.categories).toEqual([]);
			expect(store.getState().draft.gifts[0]?.category).toBe("");
		});
	});

	describe("gift actions", () => {
		it("addGift appends a gift with a unique id and sortOrder", () => {
			const store = makeStore();
			store.getState().addGift({
				name: "Cuna de madera",
				productUrl: null,
				imageUrl: null,
				priceAmount: 250,
				category: "Dormitorio",
				quantityNeeded: 1,
				priority: "high",
				publicNote: "De madera orgánica",
				internalNote: "",
				hidden: false,
			});
			const { gifts } = store.getState().draft;
			expect(gifts).toHaveLength(1);
			expect(gifts[0]?.name).toBe("Cuna de madera");
			expect(gifts[0]?.sortOrder).toBe(0);
			expect(gifts[0]?.id).toMatch(
				/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
			);
		});

		it("addGift assigns incrementing sortOrder", () => {
			const store = makeStore();
			store.getState().addGift({
				name: "Regalo A",
				productUrl: null,
				imageUrl: null,
				priceAmount: null,
				category: "General",
				quantityNeeded: 1,
				priority: "medium",
				publicNote: "",
				internalNote: "",
				hidden: false,
			});
			store.getState().addGift({
				name: "Regalo B",
				productUrl: null,
				imageUrl: null,
				priceAmount: null,
				category: "General",
				quantityNeeded: 1,
				priority: "medium",
				publicNote: "",
				internalNote: "",
				hidden: false,
			});
			const { gifts } = store.getState().draft;
			expect(gifts[0]?.sortOrder).toBe(0);
			expect(gifts[1]?.sortOrder).toBe(1);
		});

		it("updateGift applies partial updates to the target gift", () => {
			const store = makeStore();
			store.getState().addGift({
				name: "Original",
				productUrl: null,
				imageUrl: null,
				priceAmount: null,
				category: "General",
				quantityNeeded: 1,
				priority: "medium",
				publicNote: "",
				internalNote: "",
				hidden: false,
			});
			const firstGift = store.getState().draft.gifts[0];
			expect(firstGift).toBeDefined();
			store.getState().updateGift(firstGift?.id ?? "", {
				name: "Actualizado",
				priceAmount: 99,
			});
			const gift = store.getState().draft.gifts[0];
			expect(gift).toBeDefined();
			if (!gift) {
				throw new Error("Expected a gift to exist after update");
			}
			expect(gift.name).toBe("Actualizado");
			expect(gift.priceAmount).toBe(99);
			expect(gift.category).toBe("General");
		});

		it("removeGift removes the gift and reindexes sortOrder", () => {
			const store = makeStore();
			store.getState().addGift({
				name: "A",
				productUrl: null,
				imageUrl: null,
				priceAmount: null,
				category: "General",
				quantityNeeded: 1,
				priority: "medium",
				publicNote: "",
				internalNote: "",
				hidden: false,
			});
			store.getState().addGift({
				name: "B",
				productUrl: null,
				imageUrl: null,
				priceAmount: null,
				category: "General",
				quantityNeeded: 1,
				priority: "medium",
				publicNote: "",
				internalNote: "",
				hidden: false,
			});
			store.getState().addGift({
				name: "C",
				productUrl: null,
				imageUrl: null,
				priceAmount: null,
				category: "General",
				quantityNeeded: 1,
				priority: "medium",
				publicNote: "",
				internalNote: "",
				hidden: false,
			});
			const gifts = store.getState().draft.gifts;
			expect(gifts[1]).toBeDefined();
			store.getState().removeGift(gifts[1]?.id ?? "");
			const remaining = store.getState().draft.gifts;
			expect(remaining).toHaveLength(2);
			expect(remaining[0]?.name).toBe("A");
			expect(remaining[1]?.name).toBe("C");
			expect(remaining[0]?.sortOrder).toBe(0);
			expect(remaining[1]?.sortOrder).toBe(1);
		});

		it("reorderGifts updates sortOrder according to provided id order", () => {
			const store = makeStore();
			store.getState().addGift({
				name: "Primero",
				productUrl: null,
				imageUrl: null,
				priceAmount: null,
				category: "General",
				quantityNeeded: 1,
				priority: "medium",
				publicNote: "",
				internalNote: "",
				hidden: false,
			});
			store.getState().addGift({
				name: "Segundo",
				productUrl: null,
				imageUrl: null,
				priceAmount: null,
				category: "General",
				quantityNeeded: 1,
				priority: "medium",
				publicNote: "",
				internalNote: "",
				hidden: false,
			});
			const [first, second] = store.getState().draft.gifts;
			expect(first).toBeDefined();
			expect(second).toBeDefined();
			store.getState().reorderGifts([second?.id ?? "", first?.id ?? ""]);
			const reordered = store.getState().draft.gifts;
			expect(reordered[0]?.name).toBe("Segundo");
			expect(reordered[0]?.sortOrder).toBe(0);
			expect(reordered[1]?.name).toBe("Primero");
			expect(reordered[1]?.sortOrder).toBe(1);
		});

		it("new fields (title, displayName, eventDate, gifts) are included in reset", () => {
			const store = makeStore();
			store.getState().setField("title", "Mi título");
			store.getState().setField("displayName", "Ana");
			store.getState().setField("eventDate", "2025-12-25");
			store.getState().addGift({
				name: "X",
				productUrl: null,
				imageUrl: null,
				priceAmount: null,
				category: "General",
				quantityNeeded: 1,
				priority: "low",
				publicNote: "",
				internalNote: "",
				hidden: false,
			});
			store.getState().reset();
			const { draft } = store.getState();
			expect(draft.title).toBe("");
			expect(draft.displayName).toBe("");
			expect(draft.eventDate).toBeNull();
			expect(draft.gifts).toEqual([]);
		});
	});

	describe("migratePersistedWishlistWizardState", () => {
		it("seeds coverImageUrls and fonts from legacy fields on a v0 draft", () => {
			const legacyState = {
				draft: {
					title: "Lista de boda",
					coverImageUrl: "https://example.com/cover.jpg",
					fontPairing: "rounded-friendly",
				},
				updatedAt: 123,
			};

			const migrated = migratePersistedWishlistWizardState(legacyState, 0);

			expect(migrated.draft.coverImageUrls).toEqual([
				"https://example.com/cover.jpg",
			]);
			expect(migrated.draft.headingFont).toBe("nunito");
			expect(migrated.draft.bodyFont).toBe("nunito");
		});

		it("defaults to an empty gallery and null fonts when legacy fields are absent", () => {
			const legacyState = {
				draft: {
					title: "Lista general",
					coverImageUrl: null,
					fontPairing: null,
				},
				updatedAt: null,
			};

			const migrated = migratePersistedWishlistWizardState(legacyState, 0);

			expect(migrated.draft.coverImageUrls).toEqual([]);
			expect(migrated.draft.headingFont).toBeNull();
			expect(migrated.draft.bodyFont).toBeNull();
		});

		it("passes through state unchanged when already at the current version", () => {
			const currentState = {
				draft: {
					title: "Lista actual",
					coverImageUrls: ["https://example.com/a.jpg"],
					headingFont: "lora",
					bodyFont: "inter",
				},
				updatedAt: 456,
			};

			const migrated = migratePersistedWishlistWizardState(currentState, 1);

			expect(migrated).toBe(currentState);
		});
	});
});
