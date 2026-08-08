const SEPARATOR_PATTERN = /[&+,]/;
const CONJUNCTION_PATTERN = /\s+(?:y|e|and)\s+/i;

/**
 * Derives display initials from an owner's free-text signature by splitting
 * on explicit conjunctions/separators only (`&`, `+`, `,`, whitespace-delimited
 * `y`/`e`/`and`) — never on bare whitespace, so multi-word single-entity
 * names (`Familia Rodríguez`, `María José`) stay one initial.
 */
export function parseSignatureInitials(
	signature: string | null | undefined,
): string[] {
	if (!signature) return [];

	const trimmed = signature.trim();
	if (!trimmed) return [];

	return trimmed
		.split(SEPARATOR_PATTERN)
		.flatMap((chunk) => chunk.split(CONJUNCTION_PATTERN))
		.map((part) => part.trim())
		.filter(Boolean)
		.map((part) => (part[0] ?? "").toUpperCase())
		.filter(Boolean);
}
