import { EVENT_TYPE_PRESETS } from "@/config/event-type-presets";
import type { ImageOrientation } from "@/config/public-layouts";
import type { EventType } from "@/generated/prisma/enums";

/**
 * Square hero slots (magazine-editorial, arch-trio) crop with object-cover,
 * so a landscape sample still composes cleanly; there is no dedicated
 * square bucket in `sampleCoverImages`.
 */
export function resolveSampleCoverImages(
	eventType: EventType | null,
	orientation: ImageOrientation,
) {
	const preset = EVENT_TYPE_PRESETS[eventType ?? "general"];
	return orientation === "portrait"
		? preset.sampleCoverImages.portrait
		: preset.sampleCoverImages.landscape;
}
