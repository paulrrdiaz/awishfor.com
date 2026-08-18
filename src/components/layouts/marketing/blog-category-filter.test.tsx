// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { BlogPostMeta } from "@/server/blog/types";
import { BlogCategoryFilter } from "./blog-category-filter";

function makePost(overrides: Partial<BlogPostMeta>): BlogPostMeta {
	return {
		title: "Post de prueba",
		excerpt: "Excerpt de prueba.",
		date: new Date("2026-01-01"),
		category: "guias",
		author: "camila",
		tags: [],
		featured: false,
		draft: false,
		slug: "post-de-prueba",
		readingTime: 1,
		...overrides,
	};
}

const POSTS: BlogPostMeta[] = [
	makePost({ slug: "guia-uno", category: "guias", title: "Guía uno" }),
	makePost({
		slug: "planeacion-uno",
		category: "planeacion",
		title: "Planeación uno",
	}),
	makePost({
		slug: "producto-uno",
		category: "producto",
		title: "Producto uno",
	}),
];

describe("BlogCategoryFilter", () => {
	it("shows every post with the all chip selected by default", () => {
		render(<BlogCategoryFilter posts={POSTS} />);

		expect(screen.getByRole("button", { name: "Todos" })).toHaveAttribute(
			"data-selected",
			"true",
		);
		for (const post of POSTS) {
			expect(screen.getByText(post.title)).toBeInTheDocument();
		}
	});

	it("filters to a single category without navigation", () => {
		render(<BlogCategoryFilter posts={POSTS} />);

		fireEvent.click(screen.getByRole("button", { name: "Guías de regalos" }));

		expect(screen.getByText("Guía uno")).toBeInTheDocument();
		expect(screen.queryByText("Planeación uno")).not.toBeInTheDocument();
		expect(screen.queryByText("Producto uno")).not.toBeInTheDocument();
	});

	it("returns to every post when Todos is reselected", () => {
		render(<BlogCategoryFilter posts={POSTS} />);

		fireEvent.click(screen.getByRole("button", { name: "Producto" }));
		fireEvent.click(screen.getByRole("button", { name: "Todos" }));

		for (const post of POSTS) {
			expect(screen.getByText(post.title)).toBeInTheDocument();
		}
	});

	it("renders the featured slot between the chips and the grid", () => {
		render(
			<BlogCategoryFilter
				featured={<div data-testid="featured-slot">Destacado</div>}
				posts={POSTS}
			/>,
		);
		expect(screen.getByTestId("featured-slot")).toBeInTheDocument();
	});
});
