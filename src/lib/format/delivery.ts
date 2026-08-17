export type ComposedDelivery = {
	line: string;
	recipientName: string | null;
	address: string;
	phone: string | null;
	rest: string;
};

/**
 * Composes the three optional delivery fields into a single copyable line,
 * split into parts a caller can render with the recipient name emphasized.
 * The address anchors the block: with no address, nothing renders anywhere,
 * so this returns `null` regardless of the other two fields.
 */
export function composeDelivery(
	recipientName: string | null | undefined,
	address: string | null | undefined,
	phone: string | null | undefined,
): ComposedDelivery | null {
	if (!address) {
		return null;
	}

	const rest = phone ? `${address} · ${phone}` : address;
	const namedLine = [recipientName, address].filter(Boolean).join(", ");
	const line = phone ? `${namedLine} · ${phone}` : namedLine;

	return {
		line,
		recipientName: recipientName ?? null,
		address,
		phone: phone ?? null,
		rest,
	};
}
