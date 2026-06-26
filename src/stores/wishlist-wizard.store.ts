import { createJSONStorage, persist } from "zustand/middleware";
import { createStore } from "zustand/vanilla";
import { EVENT_TYPE_PRESETS } from "@/config/event-type-presets";
import type { EventType, GiftPriority } from "@/generated/prisma/enums";
import { slugify } from "@/lib/slug";

const STALE_DAYS = 30;

type CopyTouched = {
	heroTitle: boolean;
	welcomeMessage: boolean;
	thankYouMessage: boolean;
};

export type DraftGift = {
	id: string;
	name: string;
	productUrl: string | null;
	imageUrl: string | null;
	priceAmount: number | null;
	category: string;
	quantityNeeded: number;
	priority: GiftPriority;
	publicNote: string;
	internalNote: string;
	hidden: boolean;
	sortOrder: number;
};

export type WishlistDraft = {
	eventType: EventType | null;
	title: string;
	slug: string;
	displayName: string;
	eventDate: string | null;
	eventTime: string | null;
	eventLocation: string;
	coverImageUrl: string | null;
	heroTitle: string;
	welcomeMessage: string;
	thankYouMessage: string;
	categories: string[];
	themeId: string | null;
	layoutId: string | null;
	buttonStyle: string | null;
	fontPairing: string | null;
	showHowItWorks: boolean;
	gifts: DraftGift[];
};

export type WishlistWizardState = {
	draft: WishlistDraft;
	copyTouched: CopyTouched;
	slugTouched: boolean;
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
	addGift: (gift: Omit<DraftGift, "id" | "sortOrder">) => void;
	updateGift: (id: string, updates: Partial<DraftGift>) => void;
	removeGift: (id: string) => void;
	reorderGifts: (orderedIds: string[]) => void;
};

export type WishlistWizardStore = WishlistWizardState & WishlistWizardActions;

const emptyDraft = (): WishlistDraft => ({
	eventType: null,
	title: "",
	slug: "",
	displayName: "",
	eventDate: null,
	eventTime: null,
	eventLocation: "",
	coverImageUrl: null,
	heroTitle: "",
	welcomeMessage: "",
	thankYouMessage: "",
	categories: [],
	themeId: null,
	layoutId: null,
	buttonStyle: null,
	fontPairing: null,
	showHowItWorks: true,
	gifts: [],
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
				slugTouched: false,
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

					set((state) => {
						const nextDraft = { ...state.draft, [key]: value };
						let nextSlugTouched = state.slugTouched;

						if (key === "title" && !state.slugTouched) {
							const autoSlug = slugify(value as string);
							nextDraft.slug = autoSlug ?? "";
						}
						if (key === "slug") {
							nextSlugTouched = true;
						}

						return {
							draft: nextDraft,
							copyTouched: isCopyField(key)
								? { ...state.copyTouched, [key]: true }
								: state.copyTouched,
							slugTouched: nextSlugTouched,
							updatedAt: Date.now(),
						};
					});
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
						slugTouched: false,
						updatedAt: null,
						needsRecovery: false,
					});
				},

				dismissRecovery: (discard) => {
					if (discard) {
						set({
							draft: emptyDraft(),
							copyTouched: emptyCopyTouched(),
							slugTouched: false,
							updatedAt: null,
							needsRecovery: false,
						});
					} else {
						set({ needsRecovery: false });
					}
				},

				setHasHydrated: () => set({ _hasHydrated: true }),

				addGift: (gift) => {
					set((state) => {
						const sortOrder = state.draft.gifts.length;
						const newGift: DraftGift = {
							...gift,
							id: crypto.randomUUID(),
							sortOrder,
						};
						return {
							draft: { ...state.draft, gifts: [...state.draft.gifts, newGift] },
							updatedAt: Date.now(),
						};
					});
				},

				updateGift: (id, updates) => {
					set((state) => ({
						draft: {
							...state.draft,
							gifts: state.draft.gifts.map((g) =>
								g.id === id ? { ...g, ...updates } : g,
							),
						},
						updatedAt: Date.now(),
					}));
				},

				removeGift: (id) => {
					set((state) => ({
						draft: {
							...state.draft,
							gifts: state.draft.gifts
								.filter((g) => g.id !== id)
								.map((g, i) => ({ ...g, sortOrder: i })),
						},
						updatedAt: Date.now(),
					}));
				},

				reorderGifts: (orderedIds) => {
					set((state) => {
						const giftMap = new Map(state.draft.gifts.map((g) => [g.id, g]));
						const reordered = orderedIds
							.map((id, i) => {
								const gift = giftMap.get(id);
								return gift ? { ...gift, sortOrder: i } : null;
							})
							.filter((g): g is DraftGift => g !== null);
						return {
							draft: { ...state.draft, gifts: reordered },
							updatedAt: Date.now(),
						};
					});
				},
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
					slugTouched: state.slugTouched,
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
