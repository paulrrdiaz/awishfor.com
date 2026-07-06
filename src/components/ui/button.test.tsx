// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Button } from "./button";

describe("Button", () => {
	it("renders a native button by default", () => {
		render(<Button>Click me</Button>);
		const button = screen.getByRole("button", { name: "Click me" });
		expect(button.tagName).toBe("BUTTON");
		expect(button).toHaveAttribute("data-slot", "button");
	});

	it("renders as a single anchor when composed with asChild, carrying button classes", () => {
		render(
			<Button asChild>
				<a href="/create">New</a>
			</Button>,
		);
		const link = screen.getByRole("link", { name: "New" });
		expect(link.tagName).toBe("A");
		expect(link).toHaveAttribute("href", "/create");
		expect(link).toHaveAttribute("data-slot", "button");
		expect(link.className).toContain("inline-flex");
	});

	it("applies variant and size classes", () => {
		render(
			<Button size="lg" variant="secondary">
				Save
			</Button>,
		);
		const button = screen.getByRole("button", { name: "Save" });
		expect(button.className).toContain("bg-secondary");
		expect(button.className).toContain("h-9");
	});
});
