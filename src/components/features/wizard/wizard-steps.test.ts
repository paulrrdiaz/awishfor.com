import { describe, expect, it } from "vitest";
import {
	getNextWizardStep,
	getPreviousWizardStep,
	resolveWizardStep,
} from "./wizard-steps";

describe("wizard steps", () => {
	it("advances from gifts to review", () => {
		expect(getNextWizardStep("gifts")).toBe("review");
	});

	it("goes back from review to gifts", () => {
		expect(getPreviousWizardStep("review")).toBe("gifts");
	});

	it("advances from review to published", () => {
		expect(getNextWizardStep("review")).toBe("published");
	});

	it("published has no next step", () => {
		expect(getNextWizardStep("published")).toBeNull();
	});

	it("falls back to the first step for an unknown step", () => {
		expect(resolveWizardStep("unknown-step")).toBe("event-type");
		expect(resolveWizardStep(null)).toBe("event-type");
	});

	it("falls back to the first step for retired step ids", () => {
		expect(resolveWizardStep("design")).toBe("event-type");
		expect(resolveWizardStep("publish")).toBe("event-type");
	});
});
