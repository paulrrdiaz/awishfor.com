// @vitest-environment jsdom
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { MotifShape as MotifShapeId } from "@/config/motifs";
import { MotifShape } from "./motif-shape";

const SHAPES: MotifShapeId[] = [
	"cloud",
	"bear",
	"flower",
	"bunny",
	"rainbow",
	"unicorn",
	"star",
	"tree",
	"fox",
	"duck",
	"boat",
	"elephant",
	"balloon",
	"moon",
	"leaf",
	"dino",
	"bow",
	"bloom",
];

describe("MotifShape", () => {
	it("carries no img or background-image asset", () => {
		const { container } = render(<MotifShape shape="bear" />);
		expect(container.querySelector("img")).toBeNull();
	});

	it("is always aria-hidden", () => {
		const { container } = render(<MotifShape shape="bear" />);
		expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
	});

	for (const shape of SHAPES) {
		it(`renders exactly one svg for ${shape}`, () => {
			const { container } = render(<MotifShape shape={shape} />);
			const root = container.firstElementChild;
			expect(root?.querySelectorAll("svg")).toHaveLength(1);
			const svg = root?.querySelector("svg");
			expect(svg).toHaveAttribute("aria-hidden", "true");
			expect(svg?.querySelector("title")).toBeNull();
			expect(svg?.querySelector("desc")).toBeNull();
			expect(root).toHaveClass("mot");
		});
	}

	it("defaults to the base surface", () => {
		const { container } = render(<MotifShape shape="star" />);
		expect(container.firstElementChild).toHaveAttribute(
			"data-motif-surface",
			"base",
		);
	});

	it("marks the primary surface when requested", () => {
		const { container } = render(<MotifShape shape="star" surface="primary" />);
		expect(container.firstElementChild).toHaveAttribute(
			"data-motif-surface",
			"primary",
		);
	});
});
