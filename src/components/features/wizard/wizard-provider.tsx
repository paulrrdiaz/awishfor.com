"use client";

import {
	createContext,
	type ReactNode,
	useContext,
	useEffect,
	useRef,
} from "react";
import { useStore } from "zustand";
import {
	createWishlistWizardStore,
	type WishlistWizardStore,
	type WishlistWizardStoreInstance,
} from "@/stores/wishlist-wizard.store";

const WizardStoreContext = createContext<WishlistWizardStoreInstance | null>(
	null,
);

export function WizardProvider({
	children,
	store,
}: {
	children: ReactNode;
	store?: WishlistWizardStoreInstance;
}) {
	const storeRef = useRef<WishlistWizardStoreInstance>(null);
	if (!storeRef.current) {
		storeRef.current = store ?? createWishlistWizardStore();
	}

	useEffect(() => {
		storeRef.current?.persist.rehydrate();
	}, []);

	return (
		<WizardStoreContext value={storeRef.current}>{children}</WizardStoreContext>
	);
}

export function useWizardStore<T>(
	selector: (state: WishlistWizardStore) => T,
): T {
	const store = useContext(WizardStoreContext);
	if (!store)
		throw new Error("useWizardStore must be used inside WizardProvider");
	return useStore(store, selector);
}
