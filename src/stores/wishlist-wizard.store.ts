import { createJSONStorage, persist } from "zustand/middleware";
import { createStore } from "zustand/vanilla";
import { EVENT_TYPE_PRESETS } from "@/config/event-type-presets";
import type { EventType } from "@/generated/prisma/enums";

const STALE_DAYS = 30;

type CopyTouched = {
	heroTitle: boolean;
	welcomeMessage: boolean;
	thankYouMessage: boolean;
};

export type WishlistDraft = {
	eventType: EventType | null;
	heroTitle: string;
	welcomeMessage: string;
	thankYouMessage: string;
	categories: string[];
	themeId: string | null;
	layoutId: string | null;
};

export type WishlistWizardState = {
	draft: WishlistDraft;
	copyTouched: CopyTouched;
	updatedAt: number | null;
	needsRecovery: boolean;
	_hasHydrated: boolean;
};

export type WishlistWizardActions = {
	setField: <K extends keyof WishlistDraft>(
		key: K,
		value: WishlistDraft[K],
	) => void;
	setEventType: (eventType: EventType) => void;
	regenerateCopy: () => void;
	reset: () => void;
	dismissRecovery: (discard: boolean) => void;
	setHasHydrated: () => void;
};

export type WishlistWizardStore = WishlistWizardState & WishlistWizardActions;

const emptyDraft = (): WishlistDraft => ({
	eventType: null,
	heroTitle: "",
	welcomeMessage: "",
	thankYouMessage: "",
	categories: [],
	themeId: null,
	layoutId: null,
});

const emptyCopyTouched = (): CopyTouched => ({
	heroTitle: false,
	welcomeMessage: false,
	thankYouMessage: false,
});

const isStale = (updatedAt: number | null): boolean => {
	if (updatedAt === null) return false;
	const cutoff = Date.now() - STALE_DAYS * 24 * 60 * 60 * 1000;
	return updatedAt < cutoff;
};

export const createWishlistWizardStore = () =>
	createStore<WishlistWizardStore>()(
		persist(
			(set, get) => ({
				draft: emptyDraft(),
				copyTouched: emptyCopyTouched(),
				updatedAt: null,
				needsRecovery: false,
				_hasHydrated: false,

				setField: (key, value) => {
					const isCopyField = (
						k: keyof WishlistDraft,
					): k is "heroTitle" | "welcomeMessage" | "thankYouMessage" =>
						k === "heroTitle" ||
						k === "welcomeMessage" ||
						k === "thankYouMessage";

					set((state) => ({
						draft: { ...state.draft, [key]: value },
						copyTouched: isCopyField(key)
							? { ...state.copyTouched, [key]: true }
							: state.copyTouched,
						updatedAt: Date.now(),
					}));
				},

				setEventType: (eventType) => {
					const preset = EVENT_TYPE_PRESETS[eventType];
					const { copyTouched } = get();
					set((state) => ({
						draft: {
							...state.draft,
							eventType,
							categories: preset.defaultCategories,
							themeId: preset.defaultThemeId,
							layoutId: preset.defaultLayoutId,
							heroTitle: copyTouched.heroTitle
								? state.draft.heroTitle
								: preset.defaultHeroTitleTemplate,
							welcomeMessage: copyTouched.welcomeMessage
								? state.draft.welcomeMessage
								: preset.defaultWelcomeMessage,
							thankYouMessage: copyTouched.thankYouMessage
								? state.draft.thankYouMessage
								: preset.defaultThankYouMessage,
						},
						updatedAt: Date.now(),
					}));
				},

				regenerateCopy: () => {
					const { draft } = get();
					if (!draft.eventType) return;
					const preset = EVENT_TYPE_PRESETS[draft.eventType];
					set({
						draft: {
							...draft,
							heroTitle: preset.defaultHeroTitleTemplate,
							welcomeMessage: preset.defaultWelcomeMessage,
							thankYouMessage: preset.defaultThankYouMessage,
						},
						copyTouched: emptyCopyTouched(),
						updatedAt: Date.now(),
					});
				},

				reset: () => {
					set({
						draft: emptyDraft(),
						copyTouched: emptyCopyTouched(),
						updatedAt: null,
						needsRecovery: false,
					});
				},

				dismissRecovery: (discard) => {
					if (discard) {
						set({
							draft: emptyDraft(),
							copyTouched: emptyCopyTouched(),
							updatedAt: null,
							needsRecovery: false,
						});
					} else {
						set({ needsRecovery: false });
					}
				},

				setHasHydrated: () => set({ _hasHydrated: true }),
			}),
			{
				name: "wishlist-wizard-draft",
				storage: createJSONStorage(() => {
					if (typeof window === "undefined") {
						return {
							getItem: () => null,
							setItem: () => {},
							removeItem: () => {},
						};
					}
					return localStorage;
				}),
				partialize: (state) => ({
					draft: state.draft,
					copyTouched: state.copyTouched,
					updatedAt: state.updatedAt,
				}),
				onRehydrateStorage: () => (state) => {
					if (!state) return;
					if (isStale(state.updatedAt) && state.updatedAt !== null) {
						state.needsRecovery = true;
					}
					state._hasHydrated = true;
				},
				skipHydration: true,
			},
		),
	);

export type WishlistWizardStoreInstance = ReturnType<
	typeof createWishlistWizardStore
>;
