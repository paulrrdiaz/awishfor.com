import "server-only";

const WORDS_PER_MINUTE = 200;

/** Whole minutes, rounded up, minimum 1 — never "0 min" for a short post. */
export function computeReadingTime(body: string): number {
	const wordCount = body.trim().split(/\s+/).filter(Boolean).length;
	return Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE));
}
