// @vitest-environment jsdom
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Drawer, DrawerContent, DrawerHandle } from "./drawer";

describe("Drawer", () => {
	it("exposes a reusable handle and per-instance overlay classes", () => {
		render(
			<Drawer open>
				<DrawerContent overlayClassName="bg-black/40" showCloseButton={false}>
					<DrawerHandle className="w-16" />
				</DrawerContent>
			</Drawer>,
		);

		expect(document.querySelector('[data-slot="drawer-handle"]')).toHaveClass(
			"w-16",
		);
		expect(document.querySelector('[data-slot="drawer-overlay"]')).toHaveClass(
			"bg-black/40",
		);
	});
});
