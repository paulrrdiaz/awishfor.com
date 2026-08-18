// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { BlogPostMeta } from "@/server/blog/types";
import { BlogRelatedCard } from "./blog-related-card";

const BASE_POST: BlogPostMeta = {
	title: "10 regalos infalibles para baby shower en 2026",
	excerpt: "Una lista curada, de lo clásico a lo creativo.",
	date: new Date("2026-08-12"),
	category: "guias",
	author: "camila",
	tags: [],
	featured: false,
	draft: false,
	slug: "regalos-infalibles-baby-shower-2026",
	readingTime: 4,
};

describe("BlogRelatedCard", () => {
	it("links to the post and shows its title", () => {
		render(<BlogRelatedCard post={BASE_POST} />);
		const link = screen.getByRole("link");
		expect(link).toHaveAttribute(
			"href",
			"/blog/regalos-infalibles-baby-shower-2026",
		);
		expect(screen.getByText(BASE_POST.title)).toBeInTheDocument();
	});

	it("renders the #173E29 fallback treatment for a backfilled post without a cover", () => {
		const { container } = render(<BlogRelatedCard post={BASE_POST} />);
		expect(container.querySelector("img")).not.toBeInTheDocument();
		expect(screen.getByText("🔗")).toBeInTheDocument();
	});

	it("renders the cover image when declared", () => {
		const { container } = render(
			<BlogRelatedCard post={{ ...BASE_POST, cover: "/assets/blog/x.jpg" }} />,
		);
		expect(container.querySelector("img")).toBeInTheDocument();
	});
});
