// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { BlogPostMeta } from "@/server/blog/types";
import { BlogPostCard } from "./blog-post-card";

const BASE_POST: BlogPostMeta = {
	title: "Post de prueba",
	excerpt: "Excerpt de prueba.",
	date: new Date("2026-08-14"),
	category: "guias",
	author: "camila",
	tags: [],
	featured: false,
	draft: false,
	slug: "post-de-prueba",
	readingTime: 4,
};

describe("BlogPostCard", () => {
	it("links to the post and shows the registry category label and date", () => {
		render(<BlogPostCard post={BASE_POST} />);

		expect(screen.getByRole("link")).toHaveAttribute(
			"href",
			"/blog/post-de-prueba",
		);
		expect(screen.getByText("Guías de regalos")).toBeInTheDocument();
		expect(screen.getByText(/14 AGO 2026/)).toBeInTheDocument();
	});

	it("renders the cover image when declared", () => {
		const { container } = render(
			<BlogPostCard post={{ ...BASE_POST, cover: "/assets/blog/x.jpg" }} />,
		);
		expect(container.querySelector("img")).toBeInTheDocument();
	});

	it("renders the fallback treatment when no cover is declared", () => {
		const { container } = render(<BlogPostCard post={BASE_POST} />);
		expect(container.querySelector("img")).not.toBeInTheDocument();
		expect(screen.getByText("🔗")).toBeInTheDocument();
	});
});
