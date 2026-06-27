import { createJSONStorage, persist } from "zustand/middleware";
import { createStore } from "zustand/vanilla";
import { EVENT_TYPE_PRESETS } from "@/config/event-type-presets";
import type { EventType, GiftPriority } from "@/generated/prisma/enums";
import { slugify } from "@/lib/slug";
import type { WishlistShareMetadata } from "@/lib/wishlist/share";

const STALE_DAYS = 30;
export const WISHLIST_WIZARD_STORAGE_KEY = "wishlist-wizard-draft";

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
	savedWishlistId: string | null;
	savedSlug: string | null;
	lastSavedAt: number | null;
	needsRecovery: boolean;
	publishSuccess: WishlistShareMetadata | null;
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
	addCategory: (name: string) => void;
	renameCategory: (oldName: string, newName: string) => void;
	removeCategory: (name: string) => void;
	addGift: (gift: Omit<DraftGift, "id" | "sortOrder">) => void;
	updateGift: (id: string, updates: Partial<DraftGift>) => void;
	removeGift: (id: string) => void;
	reorderGifts: (orderedIds: string[]) => void;
	replaceDraft: (
		draft: WishlistDraft,
		metadata?: {
			savedWishlistId?: string | null;
			savedSlug?: string | null;
			lastSavedAt?: number | null;
		},
	) => void;
	setSavedDraftMetadata: (
		savedWishlistId: string,
		lastSavedAt: number,
		savedSlug: string,
	) => void;
	clearSavedDraftMetadata: () => void;
	completePublish: (shareMetadata: WishlistShareMetadata) => void;
	clearPublishSuccess: () => void;
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

const normalizeCategoryName = (name: string) => name.trim().toLocaleLowerCase();

export const clearPersistedWishlistWizardDraft = () => {
	if (typeof window === "undefined") {
		return;
	}

	window.localStorage.removeItem(WISHLIST_WIZARD_STORAGE_KEY);
};

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
				savedWishlistId: null,
				savedSlug: null,
				lastSavedAt: null,
				needsRecovery: false,
				publishSuccess: null,
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
							publishSuccess: null,
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
						publishSuccess: null,
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
						publishSuccess: null,
						updatedAt: Date.now(),
					});
				},

				reset: () => {
					set({
						draft: emptyDraft(),
						copyTouched: emptyCopyTouched(),
						slugTouched: false,
						updatedAt: null,
						savedWishlistId: null,
						savedSlug: null,
						lastSavedAt: null,
						needsRecovery: false,
						publishSuccess: null,
					});
				},

				dismissRecovery: (discard) => {
					if (discard) {
						set({
							draft: emptyDraft(),
							copyTouched: emptyCopyTouched(),
							slugTouched: false,
							updatedAt: null,
							savedWishlistId: null,
							savedSlug: null,
							lastSavedAt: null,
							needsRecovery: false,
							publishSuccess: null,
						});
					} else {
						set({ needsRecovery: false });
					}
				},

				setHasHydrated: () => set({ _hasHydrated: true }),

				addCategory: (name) => {
					const trimmedName = name.trim();
					if (!trimmedName) return;

					set((state) => {
						const normalizedName = normalizeCategoryName(trimmedName);
						const exists = state.draft.categories.some(
							(category) => normalizeCategoryName(category) === normalizedName,
						);

						if (exists) return state;

						return {
							draft: {
								...state.draft,
								categories: [...state.draft.categories, trimmedName],
							},
							publishSuccess: null,
							updatedAt: Date.now(),
						};
					});
				},

				renameCategory: (oldName, newName) => {
					const normalizedOldName = normalizeCategoryName(oldName);
					const trimmedNewName = newName.trim();
					if (!normalizedOldName || !trimmedNewName) return;

					set((state) => {
						const normalizedNewName = normalizeCategoryName(trimmedNewName);
						const oldIndex = state.draft.categories.findIndex(
							(category) =>
								normalizeCategoryName(category) === normalizedOldName,
						);

						if (oldIndex === -1) return state;

						const duplicate = state.draft.categories.some(
							(category, index) =>
								index !== oldIndex &&
								normalizeCategoryName(category) === normalizedNewName,
						);

						if (duplicate) return state;

						return {
							draft: {
								...state.draft,
								categories: state.draft.categories.map((category, index) =>
									index === oldIndex ? trimmedNewName : category,
								),
								gifts: state.draft.gifts.map((gift) =>
									normalizeCategoryName(gift.category) === normalizedOldName
										? { ...gift, category: trimmedNewName }
										: gift,
								),
							},
							publishSuccess: null,
							updatedAt: Date.now(),
						};
					});
				},

				removeCategory: (name) => {
					const normalizedName = normalizeCategoryName(name);
					if (!normalizedName) return;

					set((state) => ({
						draft: {
							...state.draft,
							categories: state.draft.categories.filter(
								(category) =>
									normalizeCategoryName(category) !== normalizedName,
							),
							gifts: state.draft.gifts.map((gift) =>
								normalizeCategoryName(gift.category) === normalizedName
									? { ...gift, category: "" }
									: gift,
							),
						},
						publishSuccess: null,
						updatedAt: Date.now(),
					}));
				},

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
							publishSuccess: null,
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
						publishSuccess: null,
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
						publishSuccess: null,
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
							publishSuccess: null,
							updatedAt: Date.now(),
						};
					});
				},

				replaceDraft: (draft, metadata) => {
					set({
						draft,
						copyTouched: {
							heroTitle: draft.heroTitle.trim().length > 0,
							welcomeMessage: draft.welcomeMessage.trim().length > 0,
							thankYouMessage: draft.thankYouMessage.trim().length > 0,
						},
						slugTouched: draft.slug.trim().length > 0,
						updatedAt: Date.now(),
						savedWishlistId: metadata?.savedWishlistId ?? null,
						savedSlug:
							metadata?.savedSlug ??
							(metadata?.savedWishlistId ? draft.slug : null),
						lastSavedAt: metadata?.lastSavedAt ?? null,
						needsRecovery: false,
						publishSuccess: null,
					});
				},

				setSavedDraftMetadata: (savedWishlistId, lastSavedAt, savedSlug) => {
					set({
						savedWishlistId,
						savedSlug,
						lastSavedAt,
					});
				},

				clearSavedDraftMetadata: () => {
					set({
						savedWishlistId: null,
						savedSlug: null,
						lastSavedAt: null,
					});
				},

				completePublish: (shareMetadata) => {
					set({
						draft: emptyDraft(),
						copyTouched: emptyCopyTouched(),
						slugTouched: false,
						updatedAt: null,
						savedWishlistId: null,
						savedSlug: null,
						lastSavedAt: null,
						needsRecovery: false,
						publishSuccess: shareMetadata,
					});
				},

				clearPublishSuccess: () => {
					set({
						publishSuccess: null,
					});
				},
			}),
			{
				name: WISHLIST_WIZARD_STORAGE_KEY,
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
					savedWishlistId: state.savedWishlistId,
					savedSlug: state.savedSlug,
					lastSavedAt: state.lastSavedAt,
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
