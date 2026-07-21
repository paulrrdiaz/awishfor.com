export function withCoverImageUrlMirror<T extends { coverImageUrls: string[] }>(
	data: T,
): T & { coverImageUrl: string | null } {
	return { ...data, coverImageUrl: data.coverImageUrls[0] ?? null };
}
