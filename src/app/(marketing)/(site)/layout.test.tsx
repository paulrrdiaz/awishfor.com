// @vitest-environment jsdom

import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const preloadMock = vi.fn();

vi.mock("react-dom", async () => {
	const actual = await vi.importActual<typeof import("react-dom")>("react-dom");
	return { ...actual, preload: preloadMock };
});

describe("non-landing marketing routes", () => {
	it("issue no preload hint for the landing hero image", async () => {
		const { PrivacyPage } = await import("./privacy/page").then((mod) => ({
			PrivacyPage: mod.default,
		}));
		const { TermsPage } = await import("./terms/page").then((mod) => ({
			TermsPage: mod.default,
		}));

		render(<PrivacyPage />);
		render(<TermsPage />);

		expect(preloadMock).not.toHaveBeenCalled();
	});
});
