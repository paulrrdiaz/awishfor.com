import { describe, expect, it } from "vitest";
import { sanitizePublicEventPayload } from "./public-payload";

describe("calendar-save analytics payload", () => {
	it("keeps only the selected provider and wishlist identifier", () => {
		expect(
			sanitizePublicEventPayload("calendar_save_action_selected", {
				calendar_provider: "google",
				event_title: "Boda de Marina",
				guest_name: "Marina",
				wishlist_id: "wishlist_1",
			}),
		).toEqual({
			calendar_provider: "google",
			wishlist_id: "wishlist_1",
		});
	});
});
