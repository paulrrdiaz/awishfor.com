const BARE_SLUG_RE = /^[a-z0-9]([a-z0-9-]{1,58}[a-z0-9])?$|^[a-z0-9]{3}$/;

/**
 * Extract a wishlist slug from a pasted public URL, path, or bare slug.
 * Returns the slug string on success, or null when the input can't be resolved.
 *
 * Accepts:
 *   - Full URL or path containing /w/<slug>
 *   - Bare slug matching ^[a-z0-9-]{3,60}$ with no leading/trailing hyphen
 */
export function extractWishlistSlug(input: string): string | null {
	const trimmed = input.trim();
	if (!trimmed) return null;

	// Match /w/<slug> in a URL or path
	const pathMatch = trimmed.match(
		/\/w\/([a-z0-9][a-z0-9-]{1,58}[a-z0-9]|[a-z0-9]{3})/,
	);
	if (pathMatch?.[1]) return pathMatch[1];

	// Accept a bare slug
	if (BARE_SLUG_RE.test(trimmed)) return trimmed;

	return null;
}
