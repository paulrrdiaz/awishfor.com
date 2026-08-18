// @vitest-environment jsdom
import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/font/google", () => {
	const font = () => ({ variable: "font-test" });
	return {
		Cormorant_Garamond: font,
		DM_Serif_Display: font,
		Figtree: font,
		Inter: font,
		Karla: font,
		Lora: font,
		Nunito: font,
		Playfair_Display: font,
		Source_Serif_4: font,
	};
});

import { resolveMotif } from "@/config/motifs";
import { resolveButtonStyle } from "@/config/public-button-styles";
import { resolveBodyFont, resolveHeadingFont } from "@/config/public-fonts";
import { resolveTheme } from "@/config/public-themes";
import { PublicThemeProvider } from "./public-theme-provider";

const theme = resolveTheme("cielo-suave");
const headingFont = resolveHeadingFont(null);
const bodyFont = resolveBodyFont(null);
const buttonStyle = resolveButtonStyle(null);
const motif = resolveMotif("bear-cloud");

if (!motif) {
	throw new Error("bear-cloud motif not found in catalog");
}

function renderProvider(
	props: Partial<React.ComponentProps<typeof PublicThemeProvider>>,
) {
	return render(
		<PublicThemeProvider
			bodyFont={bodyFont}
			buttonStyle={buttonStyle}
			headingFont={headingFont}
			theme={theme}
			{...props}
		>
			<span>content</span>
		</PublicThemeProvider>,
	);
}

describe("PublicThemeProvider", () => {
	it("omits motif variables and attributes when no motif is selected", () => {
		const { container } = renderProvider({});
		const wrapper = container.firstElementChild as HTMLElement;
		expect(wrapper).not.toHaveAttribute("data-motif");
		expect(wrapper).not.toHaveAttribute("data-motif-treatment");
		expect(wrapper.style.getPropertyValue("--m1")).toBe("");
	});

	it("writes resolved motif variables and attributes when a motif is selected", () => {
		const { container } = renderProvider({
			motif,
			motifPalette: "fixed",
			motifTreatment: "band",
		});
		const wrapper = container.firstElementChild as HTMLElement;
		expect(wrapper).toHaveAttribute("data-motif", "bear-cloud");
		expect(wrapper).toHaveAttribute("data-motif-treatment", "band");
		expect(wrapper.style.getPropertyValue("--m1")).toBe(motif.colors.m1);
		expect(wrapper.style.getPropertyValue("--m2")).toBe(motif.colors.m2);
		expect(wrapper.style.getPropertyValue("--m3")).toBe(motif.colors.m3);
		expect(wrapper.style.getPropertyValue("--mc1")).toBe(
			motif.colors.mc1 ?? "",
		);
	});

	it("resolves the themed palette from theme tokens instead of the fixed hexes", () => {
		const { container } = renderProvider({
			motif,
			motifPalette: "themed",
			motifTreatment: "scene",
		});
		const wrapper = container.firstElementChild as HTMLElement;
		expect(wrapper.style.getPropertyValue("--m1")).toBe("var(--primary)");
		expect(wrapper.style.getPropertyValue("--m2")).toBe("var(--accent)");
		expect(wrapper.style.getPropertyValue("--m3")).toBe("var(--foreground)");
	});

	it("defaults the treatment attribute to scene when a motif is selected without one", () => {
		const { container } = renderProvider({ motif });
		const wrapper = container.firstElementChild as HTMLElement;
		expect(wrapper).toHaveAttribute("data-motif-treatment", "scene");
	});
});
