import { describe, expect, it } from "vitest";
import {
	getNextWizardStep,
	getPreviousWizardStep,
	resolveWizardStep,
} from "./wizard-steps";

describe("wizard steps", () => {
	it("advances from gifts to publish", () => {
		expect(getNextWizardStep("gifts")).toBe("publish");
	});

	it("goes back from publish to gifts", () => {
		expect(getPreviousWizardStep("publish")).toBe("gifts");
	});

	it("falls back to the first step for an unknown step", () => {
		expect(resolveWizardStep("unknown-step")).toBe("event-type");
		expect(resolveWizardStep(null)).toBe("event-type");
	});
});
