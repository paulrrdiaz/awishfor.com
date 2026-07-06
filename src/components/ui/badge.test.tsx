// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Badge } from "./badge";

describe("Badge", () => {
	it("renders a span by default", () => {
		render(<Badge>New</Badge>);
		const badge = screen.getByText("New");
		expect(badge.tagName).toBe("SPAN");
		expect(badge.className).toContain("inline-flex");
	});

	it("renders the child element when composed, carrying badge classes", () => {
		render(
			<Badge asChild>
				<a href="/tag">Tag</a>
			</Badge>,
		);
		const link = screen.getByRole("link", { name: "Tag" });
		expect(link.tagName).toBe("A");
		expect(link).toHaveAttribute("href", "/tag");
		expect(link.className).toContain("inline-flex");
	});
});
