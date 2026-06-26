import { describe, expect, it } from "vitest";
import { EVENT_TYPE_PRESETS } from "@/config/event-type-presets";
import { createWishlistWizardStore } from "./wishlist-wizard.store";

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
			expect(draft.heroTitle).toBe(preset.defaultHeroTitleTemplate);
			expect(draft.welcomeMessage).toBe(preset.defaultWelcomeMessage);
			expect(draft.thankYouMessage).toBe(preset.defaultThankYouMessage);
		});

		it("preserves edited copy when event type changes", () => {
			const store = makeStore();
			store.getState().setEventType("birthday");
			const editedWelcome = "Mensaje personalizado de bienvenida";
			store.getState().setField("welcomeMessage", editedWelcome);
			store.getState().setEventType("wedding");
			const { draft } = store.getState();
			expect(draft.welcomeMessage).toBe(editedWelcome);
			const weddingPreset = EVENT_TYPE_PRESETS.wedding;
			expect(draft.heroTitle).toBe(weddingPreset.defaultHeroTitleTemplate);
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
			expect(draft.heroTitle).toBe(preset.defaultHeroTitleTemplate);
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
		it("clears all draft state", () => {
			const store = makeStore();
			store.getState().setEventType("wedding");
			store.getState().setField("heroTitle", "Título");
			store.getState().reset();
			const { draft, copyTouched, updatedAt } = store.getState();
			expect(draft.eventType).toBeNull();
			expect(draft.heroTitle).toBe("");
			expect(copyTouched.heroTitle).toBe(false);
			expect(updatedAt).toBeNull();
		});
	});
});
