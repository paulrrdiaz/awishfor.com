import { describe, expect, it } from "vitest";
import { DEFAULT_LAYOUT_ID, resolveLayout } from "@/config/public-layouts";
import { Currency, EventType, Locale } from "@/generated/prisma/client";
import {
	evaluatePublishReadiness,
	type PublishReadinessInput,
} from "@/lib/wishlist/publish-readiness";

const completeInput = (): PublishReadinessInput => ({
	title: "Lista de boda",
	eventType: EventType.wedding,
	slug: "lista-de-boda",
	language: Locale.es,
	currency: Currency.PEN,
	visibleGiftCount: 1,
	layoutId: "magazine-editorial",
	imageCount: 1,
});

describe("evaluatePublishReadiness", () => {
	it("reports ready when all required fields are present and there is a visible gift", () => {
		const result = evaluatePublishReadiness(completeInput());

		expect(result.ready).toBe(true);
		expect(result.checks).toEqual({
			title: true,
			eventType: true,
			slug: true,
			language: true,
			currency: true,
			visibleGift: true,
			images: true,
		});
	});

	it("missing title → title check false and not ready", () => {
		const result = evaluatePublishReadiness({
			...completeInput(),
			title: null,
		});

		expect(result.ready).toBe(false);
		expect(result.checks.title).toBe(false);
	});

	it("empty title → title check false and not ready", () => {
		const result = evaluatePublishReadiness({
			...completeInput(),
			title: "   ",
		});

		expect(result.ready).toBe(false);
		expect(result.checks.title).toBe(false);
	});

	it("missing eventType → eventType check false and not ready", () => {
		const result = evaluatePublishReadiness({
			...completeInput(),
			eventType: null,
		});

		expect(result.ready).toBe(false);
		expect(result.checks.eventType).toBe(false);
	});

	it("missing slug → slug check false and not ready", () => {
		const result = evaluatePublishReadiness({ ...completeInput(), slug: null });

		expect(result.ready).toBe(false);
		expect(result.checks.slug).toBe(false);
	});

	it("invalid slug format → slug check false and not ready", () => {
		const result = evaluatePublishReadiness({
			...completeInput(),
			slug: "Lista-De-Boda",
		});

		expect(result.ready).toBe(false);
		expect(result.checks.slug).toBe(false);
	});

	it("slug starting with hyphen → slug check false and not ready", () => {
		const result = evaluatePublishReadiness({
			...completeInput(),
			slug: "-lista-de-boda",
		});

		expect(result.ready).toBe(false);
		expect(result.checks.slug).toBe(false);
	});

	it("missing language → language check false and not ready", () => {
		const result = evaluatePublishReadiness({
			...completeInput(),
			language: null,
		});

		expect(result.ready).toBe(false);
		expect(result.checks.language).toBe(false);
	});

	it("missing currency → currency check false and not ready", () => {
		const result = evaluatePublishReadiness({
			...completeInput(),
			currency: null,
		});

		expect(result.ready).toBe(false);
		expect(result.checks.currency).toBe(false);
	});

	it("zero visible gifts → visibleGift check false and not ready", () => {
		const result = evaluatePublishReadiness({
			...completeInput(),
			visibleGiftCount: 0,
		});

		expect(result.ready).toBe(false);
		expect(result.checks.visibleGift).toBe(false);
	});

	it("multiple visible gifts → visibleGift check true", () => {
		const result = evaluatePublishReadiness({
			...completeInput(),
			visibleGiftCount: 3,
		});

		expect(result.ready).toBe(true);
		expect(result.checks.visibleGift).toBe(true);
	});

	it("missing style settings still ready", () => {
		// Theme, fonts and button style are not part of the input — their
		// absence never blocks publishing. Layout is required only because it
		// determines the images requirement below.
		const result = evaluatePublishReadiness(completeInput());

		expect(result.ready).toBe(true);
	});

	it("each failed check contributes independently to not-ready", () => {
		const result = evaluatePublishReadiness({
			title: null,
			eventType: null,
			slug: null,
			language: null,
			currency: null,
			visibleGiftCount: 0,
			layoutId: "magazine-editorial",
			imageCount: 0,
		});

		expect(result.ready).toBe(false);
		expect(result.checks).toEqual({
			title: false,
			eventType: false,
			slug: false,
			language: false,
			currency: false,
			visibleGift: false,
			images: false,
		});
	});

	describe("cover images satisfy the selected layout", () => {
		it("enough images for the layout's slots satisfies the requirement", () => {
			const layout = resolveLayout("collage-staggered");
			const result = evaluatePublishReadiness({
				...completeInput(),
				layoutId: "collage-staggered",
				imageCount: layout.heroImageSlots,
			});

			expect(result.checks.images).toBe(true);
			expect(result.ready).toBe(true);
		});

		it("more images than the layout needs still satisfies the requirement", () => {
			const layout = resolveLayout("collage-staggered");
			const result = evaluatePublishReadiness({
				...completeInput(),
				layoutId: "collage-staggered",
				imageCount: layout.heroImageSlots + 2,
			});

			expect(result.checks.images).toBe(true);
		});

		it("too few images blocks readiness", () => {
			const result = evaluatePublishReadiness({
				...completeInput(),
				layoutId: "collage-staggered",
				imageCount: 2,
			});

			expect(result.checks.images).toBe(false);
			expect(result.ready).toBe(false);
		});

		it("no images blocks readiness", () => {
			const result = evaluatePublishReadiness({
				...completeInput(),
				layoutId: "collage-staggered",
				imageCount: 0,
			});

			expect(result.checks.images).toBe(false);
			expect(result.ready).toBe(false);
		});

		it("a null layoutId is measured against the default layout's slot count", () => {
			const defaultLayout = resolveLayout(DEFAULT_LAYOUT_ID);
			const shortOfDefault = evaluatePublishReadiness({
				...completeInput(),
				layoutId: null,
				imageCount: defaultLayout.heroImageSlots - 1,
			});
			const meetsDefault = evaluatePublishReadiness({
				...completeInput(),
				layoutId: null,
				imageCount: defaultLayout.heroImageSlots,
			});

			expect(shortOfDefault.checks.images).toBe(false);
			expect(meetsDefault.checks.images).toBe(true);
		});

		it("an unknown layoutId is measured against the default layout's slot count", () => {
			const defaultLayout = resolveLayout(DEFAULT_LAYOUT_ID);
			const result = evaluatePublishReadiness({
				...completeInput(),
				layoutId: "not-a-real-layout",
				imageCount: defaultLayout.heroImageSlots,
			});

			expect(result.checks.images).toBe(true);
		});
	});
});
