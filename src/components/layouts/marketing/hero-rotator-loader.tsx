"use client";

import { HeroRotatorDriver } from "./hero-rotator-driver";

/** Starts the lightweight transition controller as soon as the hero hydrates. */
export function HeroRotatorLoader() {
	return <HeroRotatorDriver />;
}
