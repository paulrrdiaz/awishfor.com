import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { createServer } from "node:net";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { launch } from "chrome-launcher";
import lighthouse from "lighthouse";
import sharp from "sharp";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const config = await import(
	"../config/public-wishlist-performance-audit.json",
	{
		with: { type: "json" },
	}
).then((module) => module.default);
const artifactDirectory = resolve(
	root,
	"artifacts/public-wishlist-performance",
);
const revision =
	process.env.GITHUB_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA ?? "local";
const socialImageBudgets = {
	preferredBytes: 500 * 1024,
	hardLimitBytes: 1024 * 1024,
};

const bytes = (value) => `${(value / 1024).toFixed(1)} KiB`;
const median = (values) => {
	const sorted = [...values].sort((left, right) => left - right);
	const middle = Math.floor(sorted.length / 2);
	return sorted.length % 2 === 0
		? (sorted[middle - 1] + sorted[middle]) / 2
		: sorted[middle];
};

function run(command, args, options = {}) {
	return new Promise((resolveRun, rejectRun) => {
		const child = spawn(command, args, {
			cwd: root,
			stdio: "inherit",
			...options,
		});
		child.once("error", rejectRun);
		child.once("exit", (code, signal) => {
			if (code === 0) resolveRun();
			else
				rejectRun(
					new Error(
						`${command} ${args.join(" ")} exited with ${code ?? signal}`,
					),
				);
		});
	});
}

function waitForServer(url, timeoutMs = 30_000) {
	const start = Date.now();
	return new Promise((resolveWait, rejectWait) => {
		const poll = async () => {
			try {
				const response = await fetch(url, { redirect: "manual" });
				if (response.ok) return resolveWait(response);
			} catch {
				// The production server may still be binding its port.
			}
			if (Date.now() - start >= timeoutMs)
				return rejectWait(new Error(`Timed out waiting for ${url}`));
			setTimeout(poll, 250);
		};
		void poll();
	});
}

function portAvailable(port) {
	return new Promise((resolvePort) => {
		const server = createServer();
		server.once("error", () => resolvePort(false));
		server.listen(port, "127.0.0.1", () =>
			server.close(() => resolvePort(true)),
		);
	});
}

function requestItems(lhr) {
	return lhr.audits["network-requests"]?.details?.items ?? [];
}

function htmlSignals(html) {
	const preloadTags = html.match(/<link\b[^>]*\brel="preload"[^>]*>/gi) ?? [];
	const imagePreloads = preloadTags.filter((tag) => /\bas="image"/i.test(tag));
	const highPriorityImages =
		html.match(/<img\b[^>]*\bfetchpriority="high"[^>]*>/gi) ?? [];
	const giftImages =
		html.match(/<img\b[^>]*\balt="Regalo de auditoría[^>]*>/gi) ?? [];
	return {
		highPriorityContentImages:
			imagePreloads.length || highPriorityImages.length,
		giftImagesAreLazy:
			giftImages.length > 0 &&
			giftImages.every(
				(tag) =>
					/\bloading="lazy"/i.test(tag) && !/\bfetchpriority="high"/i.test(tag),
			),
	};
}

function measuredRun(lhr, signals) {
	const requests = requestItems(lhr);
	const isFont = (item) =>
		item.resourceType === "Font" || /\.(woff2?|ttf)(?:$|\?)/i.test(item.url);
	return {
		performance: lhr.categories.performance.score,
		lcp: lhr.audits["largest-contentful-paint"]?.numericValue ?? 0,
		cls: lhr.audits["cumulative-layout-shift"]?.numericValue ?? 0,
		tbt: lhr.audits["total-blocking-time"]?.numericValue ?? 0,
		javascriptBytes: requests
			.filter((item) => item.resourceType === "Script")
			.reduce((sum, item) => sum + item.transferSize, 0),
		cssBytes: requests
			.filter((item) => item.resourceType === "Stylesheet")
			.reduce((sum, item) => sum + item.transferSize, 0),
		fontBytes: requests
			.filter(isFont)
			.reduce((sum, item) => sum + item.transferSize, 0),
		totalTransferBytes: requests.reduce(
			(sum, item) => sum + item.transferSize,
			0,
		),
		highPriorityContentImages: signals.highPriorityContentImages,
		fontRequestCount: requests.filter(isFont).length,
		requests,
	};
}

function validateMobile(runs) {
	const budgets = config.budgets;
	const report = {
		performance: median(runs.map((run) => run.performance)),
		lcp: median(runs.map((run) => run.lcp)),
		cls: median(runs.map((run) => run.cls)),
		tbt: median(runs.map((run) => run.tbt)),
		javascriptBytes: median(runs.map((run) => run.javascriptBytes)),
		cssBytes: median(runs.map((run) => run.cssBytes)),
		fontBytes: median(runs.map((run) => run.fontBytes)),
		totalTransferBytes: median(runs.map((run) => run.totalTransferBytes)),
		highPriorityContentImages: Math.max(
			...runs.map((run) => run.highPriorityContentImages),
		),
		fontRequestCount: Math.max(...runs.map((run) => run.fontRequestCount)),
	};
	const failures = [
		[
			report.performance < budgets.performanceMedian,
			`median Performance ${(report.performance * 100).toFixed(0)} < ${budgets.performanceMedian * 100}`,
		],
		[
			runs.some((run) => run.performance < budgets.performanceRunMinimum),
			`a mobile Performance run is below ${budgets.performanceRunMinimum * 100}`,
		],
		[
			report.lcp > budgets.largestContentfulPaintMs,
			`median LCP ${report.lcp.toFixed(0)}ms > ${budgets.largestContentfulPaintMs}ms`,
		],
		[
			report.cls > budgets.cumulativeLayoutShift,
			`median CLS ${report.cls.toFixed(3)} > ${budgets.cumulativeLayoutShift}`,
		],
		[
			report.tbt > budgets.totalBlockingTimeMs,
			`median TBT ${report.tbt.toFixed(0)}ms > ${budgets.totalBlockingTimeMs}ms`,
		],
		[
			report.javascriptBytes > budgets.javascriptBytes,
			`JavaScript ${bytes(report.javascriptBytes)} > ${bytes(budgets.javascriptBytes)}`,
		],
		[
			report.cssBytes > budgets.cssBytes,
			`CSS ${bytes(report.cssBytes)} > ${bytes(budgets.cssBytes)}`,
		],
		[
			report.fontBytes > budgets.fontBytes,
			`fonts ${bytes(report.fontBytes)} > ${bytes(budgets.fontBytes)}`,
		],
		[
			report.totalTransferBytes > budgets.totalTransferBytes,
			`total transfer ${bytes(report.totalTransferBytes)} > ${bytes(budgets.totalTransferBytes)}`,
		],
		[
			report.highPriorityContentImages !== budgets.highPriorityContentImages,
			`high-priority content images ${report.highPriorityContentImages} !== ${budgets.highPriorityContentImages}`,
		],
		[
			report.fontRequestCount > budgets.fontRequestCount,
			`font request count ${report.fontRequestCount} > ${budgets.fontRequestCount}`,
		],
	]
		.filter(([failed]) => failed)
		.map(([, message]) => message);
	return { report, failures };
}

function diagnosticRequests(run) {
	return run.requests
		.map(
			(item) =>
				`${bytes(item.transferSize)} | ${item.resourceType} | ${item.initiatorType ?? "unknown"} | ${item.url}`,
		)
		.join("\n");
}

async function socialImageEvidence(slug) {
	const url = `${config.baseUrl}/w/${slug}/opengraph-image`;
	const startedAt = performance.now();
	const response = await fetch(url);
	const image = Buffer.from(await response.arrayBuffer());
	const elapsedMs = performance.now() - startedAt;
	const metadata = response.ok ? await sharp(image).metadata() : null;
	return {
		url,
		status: response.status,
		contentType: response.headers.get("content-type"),
		width: metadata?.width ?? null,
		height: metadata?.height ?? null,
		encodedBytes: image.byteLength,
		responseTimeMs: Math.round(elapsedMs),
		preferredBudgetBytes: socialImageBudgets.preferredBytes,
		hardLimitBytes: socialImageBudgets.hardLimitBytes,
		meetsPreferredBudget: image.byteLength <= socialImageBudgets.preferredBytes,
		meetsHardLimit: image.byteLength < socialImageBudgets.hardLimitBytes,
	};
}

async function assertClientBoundaryAndFonts(fixture, html, firstRun) {
	const failures = [];
	const clerkUiRequestUrls = firstRun.requests
		.map((item) => item.url)
		.filter((url) =>
			/clerk\.browser\.js|@clerk\/ui|\/npm\/@clerk\//i.test(url),
		);
	if (/data-clerk-js-script|clerk\.browser\.js|@clerk\/ui/i.test(html))
		failures.push("anonymous public HTML contains Clerk UI bootstrap markup");
	if (clerkUiRequestUrls.length)
		failures.push(
			`anonymous public network loaded Clerk UI packages: ${clerkUiRequestUrls.join(", ")}`,
		);
	const scriptUrls = firstRun.requests
		.filter((item) => item.resourceType === "Script")
		.map((item) => item.url)
		.filter((url) => url.startsWith(config.baseUrl));
	const scriptBodies = await Promise.all(
		scriptUrls.map((url) => fetch(url).then((response) => response.text())),
	);
	if (
		scriptBodies.some((body) =>
			/clerk-js|ClerkProvider|useClerk|__clerk/i.test(body),
		)
	) {
		failures.push("anonymous public scripts contain Clerk client UI code");
	}

	const cssUrls = firstRun.requests
		.filter((item) => item.resourceType === "Stylesheet")
		.map((item) => item.url);
	const fontFamilyByUrl = new Map();
	for (const cssUrl of cssUrls) {
		const css = await fetch(cssUrl).then((response) => response.text());
		for (const match of css.matchAll(/@font-face\{([^}]*)\}/g)) {
			const block = match[1] ?? "";
			const family = block.match(/font-family:([^;]+)/)?.[1]?.trim();
			const fontUrl = block.match(/src:url\(([^)]+)\)/)?.[1];
			if (family && fontUrl)
				fontFamilyByUrl.set(new URL(fontUrl, cssUrl).href, family);
		}
	}
	const loadedFontFamilies = [
		...new Set(
			firstRun.requests
				.filter(
					(item) =>
						item.resourceType === "Font" ||
						/\.(woff2?|ttf)(?:$|\?)/i.test(item.url),
				)
				.map((item) => fontFamilyByUrl.get(item.url) ?? item.url),
		),
	];
	const inactiveFonts = loadedFontFamilies.filter(
		(family) => !fixture.activeFonts.some((active) => family.includes(active)),
	);
	if (inactiveFonts.length)
		failures.push(
			`inactive font families requested: ${inactiveFonts.join(", ")}`,
		);
	if (firstRun.fontRequestCount > config.budgets.fontRequestCount)
		failures.push(
			`${firstRun.fontRequestCount} initial fonts exceed ${config.budgets.fontRequestCount}`,
		);
	if (!htmlSignals(html).giftImagesAreLazy)
		failures.push("gift images are not all lazy and below-priority");
	return { failures, loadedFontFamilies, scriptUrls };
}

async function lighthouseRun(fixture, profile, index, signals) {
	const chrome = await launch({
		chromeFlags: ["--headless=new", "--no-sandbox", "--disable-gpu"],
	});
	let result;
	try {
		result = await lighthouse(`${config.baseUrl}/w/${fixture.slug}`, {
			port: chrome.port,
			output: "json",
			logLevel: "error",
			onlyCategories: ["performance"],
			formFactor: profile.formFactor,
			screenEmulation: profile.screenEmulation,
			throttling: profile.throttling,
			throttlingMethod: profile.throttlingMethod,
		});
	} finally {
		await chrome.kill();
	}
	if (!result?.lhr) throw new Error("Lighthouse returned no report");
	const basename = `${fixture.id}-${profile.formFactor}-${index + 1}`;
	await writeFile(
		resolve(artifactDirectory, `${basename}.report.json`),
		result.report,
	);
	return measuredRun(result.lhr, signals);
}

await mkdir(artifactDirectory, { recursive: true });
if (!(await portAvailable(config.port)))
	throw new Error(`Audit port ${config.port} is already in use`);

let server;
try {
	await run("pnpm", ["build"]);
	const nextCli = resolve(root, "node_modules/next/dist/bin/next");
	server = spawn(
		process.execPath,
		[nextCli, "start", "--port", String(config.port)],
		{
			cwd: root,
			stdio: "inherit",
			env: { ...process.env, PUBLIC_WISHLIST_AUDIT_MODE: "1" },
		},
	);
	server.once("error", (error) => {
		throw error;
	});
	await waitForServer(`${config.baseUrl}/w/${config.fixtures[0].slug}`);

	const fixtureEvidence = [];
	const failures = [];
	for (const fixture of config.fixtures) {
		const url = `${config.baseUrl}/w/${fixture.slug}`;
		const response = await fetch(url);
		const html = await response.text();
		if (/webpack-hmr/i.test(html))
			throw new Error("Audit refused: target is a Next.js development runtime");
		const signals = htmlSignals(html);
		const mobileRuns = [];
		for (let index = 0; index < config.mobile.runs; index += 1)
			mobileRuns.push(
				await lighthouseRun(fixture, config.mobile, index, signals),
			);
		const desktopRun =
			fixture.id === "heavy"
				? await lighthouseRun(fixture, config.desktop, 0, signals)
				: null;
		const validation = validateMobile(mobileRuns);
		const boundary = await assertClientBoundaryAndFonts(
			fixture,
			html,
			mobileRuns[0],
		);
		const socialImage = await socialImageEvidence(fixture.slug);
		failures.push(
			...validation.failures.map((failure) => `${fixture.id}: ${failure}`),
			...boundary.failures.map((failure) => `${fixture.id}: ${failure}`),
			...(socialImage.status !== 200
				? [`${fixture.id}: social image returned ${socialImage.status}`]
				: []),
			...(socialImage.contentType !== "image/jpeg"
				? [
						`${fixture.id}: social image MIME ${socialImage.contentType} is not image/jpeg`,
					]
				: []),
			...(socialImage.width !== 1200 || socialImage.height !== 630
				? [`${fixture.id}: social image dimensions are not 1200×630`]
				: []),
			...(!socialImage.meetsHardLimit
				? [
						`${fixture.id}: social image ${bytes(socialImage.encodedBytes)} exceeds 1 MiB hard limit`,
					]
				: []),
			...(!socialImage.meetsPreferredBudget
				? [
						`${fixture.id}: social image ${bytes(socialImage.encodedBytes)} exceeds 500 KiB preferred budget`,
					]
				: []),
		);
		fixtureEvidence.push({
			id: fixture.id,
			slug: fixture.slug,
			url,
			giftCount: fixture.giftCount,
			activeFonts: fixture.activeFonts,
			loadedFontFamilies: boundary.loadedFontFamilies,
			initialScriptUrls: boundary.scriptUrls,
			htmlSignals: signals,
			mobileRuns,
			mobileMedian: validation.report,
			desktopRun,
			socialImage,
		});
		console.log(
			`${fixture.id}: mobile ${mobileRuns.map((run) => (run.performance * 100).toFixed(0)).join(", ")} median ${(validation.report.performance * 100).toFixed(0)} | LCP ${validation.report.lcp.toFixed(0)}ms | TBT ${validation.report.tbt.toFixed(0)}ms | JS ${bytes(validation.report.javascriptBytes)} | CSS ${bytes(validation.report.cssBytes)} | fonts ${bytes(validation.report.fontBytes)} | transfer ${bytes(validation.report.totalTransferBytes)} | social JPEG ${bytes(socialImage.encodedBytes)} in ${socialImage.responseTimeMs}ms`,
		);
	}

	const evidence = {
		version: config.version,
		revision,
		mobileProfile: config.mobile,
		desktopProfile: config.desktop,
		budgets: config.budgets,
		socialImageBudgets,
		fixtures: fixtureEvidence,
		generatedAt: new Date().toISOString(),
	};
	await writeFile(
		resolve(artifactDirectory, "summary.json"),
		`${JSON.stringify(evidence, null, 2)}\n`,
	);
	if (failures.length) {
		console.error(
			`Public wishlist performance budget failed:\n- ${failures.join("\n- ")}\n\nTransferred resources:\n${diagnosticRequests(fixtureEvidence[0].mobileRuns[0])}`,
		);
		process.exitCode = 1;
	}
} finally {
	if (server && server.exitCode === null && server.signalCode === null) {
		const exited = new Promise((resolveExit) =>
			server.once("exit", resolveExit),
		);
		server.kill("SIGTERM");
		await Promise.race([
			exited,
			new Promise((resolveTimeout) => setTimeout(resolveTimeout, 5000)),
		]);
		if (server.exitCode === null && server.signalCode === null) {
			server.kill("SIGKILL");
			await exited;
		}
	}
}
