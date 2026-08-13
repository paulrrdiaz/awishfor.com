// @vitest-environment jsdom
import { cleanup, render } from "@testing-library/react";
import { useRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useMotifTilt } from "./use-motif-tilt";

const { useReducedMotionMock } = vi.hoisted(() => ({
	useReducedMotionMock: vi.fn(() => false),
}));

vi.mock("@/lib/gsap/use-reduced-motion", () => ({
	useReducedMotion: useReducedMotionMock,
}));

function TiltHarness({ motifCount = 3 }: { motifCount?: number }) {
	const ref = useRef<HTMLDivElement>(null);
	useMotifTilt(ref);
	return (
		<div data-testid="tilt-container" ref={ref}>
			{Array.from({ length: motifCount }, (_, i) => (
				// biome-ignore lint/suspicious/noArrayIndexKey: static test fixtures
				<span key={i} />
			))}
		</div>
	);
}

describe("useMotifTilt", () => {
	afterEach(() => {
		cleanup();
		useReducedMotionMock.mockReturnValue(false);
		vi.restoreAllMocks();
	});

	it("attaches exactly one pointermove listener on the container regardless of motif count", () => {
		const addSpy = vi.spyOn(HTMLElement.prototype, "addEventListener");
		const { getByTestId } = render(<TiltHarness motifCount={5} />);
		const container = getByTestId("tilt-container");

		const onContainer = addSpy.mock.instances
			.map((instance, index) => ({ instance, call: addSpy.mock.calls[index] }))
			.filter(
				({ instance, call }) =>
					instance === container && call?.[0] === "pointermove",
			);
		expect(onContainer).toHaveLength(1);
	});

	it("attaches no listener on the container when reduced motion is preferred", () => {
		useReducedMotionMock.mockReturnValue(true);
		const addSpy = vi.spyOn(HTMLElement.prototype, "addEventListener");
		const { getByTestId } = render(<TiltHarness />);
		const container = getByTestId("tilt-container");

		const onContainer = addSpy.mock.instances
			.map((instance, index) => ({ instance, call: addSpy.mock.calls[index] }))
			.filter(
				({ instance, call }) =>
					instance === container && call?.[0] === "pointermove",
			);
		expect(onContainer).toHaveLength(0);
	});

	it("removes its listeners from the container on unmount", () => {
		const addSpy = vi.spyOn(HTMLElement.prototype, "addEventListener");
		const removeSpy = vi.spyOn(HTMLElement.prototype, "removeEventListener");
		const { getByTestId, unmount } = render(<TiltHarness />);
		const container = getByTestId("tilt-container");

		const addedOnContainer = addSpy.mock.instances
			.map((instance, index) => ({ instance, call: addSpy.mock.calls[index] }))
			.filter(({ instance }) => instance === container)
			.map(({ call }) => call?.[0]);

		unmount();

		const removedOnContainer = removeSpy.mock.instances
			.map((instance, index) => ({
				instance,
				call: removeSpy.mock.calls[index],
			}))
			.filter(({ instance }) => instance === container)
			.map(({ call }) => call?.[0]);

		expect(removedOnContainer).toEqual(
			expect.arrayContaining(addedOnContainer),
		);
		expect(addedOnContainer).toEqual(
			expect.arrayContaining(["pointermove", "pointerleave"]),
		);
	});
});
