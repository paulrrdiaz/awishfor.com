import { describe, expect, it } from "vitest";
import { computeReadingTime } from "./reading-time";

describe("computeReadingTime", () => {
	it("rounds up to the nearest whole minute", () => {
		const body = Array(201).fill("palabra").join(" "); // 201 words @ 200wpm
		expect(computeReadingTime(body)).toBe(2);
	});

	it("never returns less than 1 minute for a short post", () => {
		expect(computeReadingTime("una frase corta")).toBe(1);
	});

	it("ignores extra whitespace when counting words", () => {
		const body = "  hola   mundo  \n\n  otra   línea  ";
		expect(computeReadingTime(body)).toBe(1);
	});
});
