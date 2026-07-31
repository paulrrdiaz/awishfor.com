import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { createServer } from "node:net";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { launch } from "chrome-launcher";
import lighthouse from "lighthouse";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const config = await import("../config/marketing-performance-audit.json", {
	with: { type: "json" },
}).then((module) => module.default);
const artifactDirectory = resolve(root, "artifacts/marketing-performance");
const revision =
	process.env.GITHUB_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA ?? "local";

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

function criticalResourceSignals(html) {
	const preloadTags = html.match(/<link\b[^>]*\brel="preload"[^>]*>/gi) ?? [];
	const imagePreloads = preloadTags.filter((tag) => /\bas="image"/i.test(tag));
	const fontPreloads = preloadTags
		.filter((tag) => /\bas="font"/i.test(tag))
		.map((tag) => tag.match(/\bhref="([^"]+)"/i)?.[1])
		.filter(Boolean);
	const explicitHighPriorityImages =
		html.match(/<img\b[^>]*\bfetchpriority="high"[^>]*>/gi) ?? [];
	return {
		fontPreloadUrls: fontPreloads,
		highPriorityContentImages:
			imagePreloads.length || explicitHighPriorityImages.length,
	};
}

function payloadSummary(lhr, criticalSignals) {
	const requests = requestItems(lhr);
	const isFont = (item) =>
		item.resourceType === "Font" || /\\.(woff2?|ttf)(?:$|\\?)/i.test(item.url);
	const fontPreloads = requests.filter(
		(item) =>
			isFont(item) &&
			criticalSignals.fontPreloadUrls.some((url) => item.url.endsWith(url)),
	);
	return {
		javascriptBytes: requests
			.filter((item) => item.resourceType === "Script")
			.reduce((sum, item) => sum + item.transferSize, 0),
		cssBytes: requests
			.filter((item) => item.resourceType === "Stylesheet")
			.reduce((sum, item) => sum + item.transferSize, 0),
		fontPreloadBytes: fontPreloads.reduce(
			(sum, item) => sum + item.transferSize,
			0,
		),
		totalTransferBytes: requests.reduce(
			(sum, item) => sum + item.transferSize,
			0,
		),
		highPriorityContentImages: criticalSignals.highPriorityContentImages,
		fontPreloadCount: fontPreloads.length,
		requests,
	};
}

function diagnosticRequests(summary) {
	return summary.requests
		.map(
			(item) =>
				`${bytes(item.transferSize)} | ${item.resourceType} | ${item.initiatorType ?? "unknown"} | ${item.url}`,
		)
		.join("\n");
}

function measuredRun(lhr, criticalSignals) {
	const payload = payloadSummary(lhr, criticalSignals);
	return {
		performance: lhr.categories.performance.score,
		lcp: lhr.audits["largest-contentful-paint"]?.numericValue ?? 0,
		cls: lhr.audits["cumulative-layout-shift"]?.numericValue ?? 0,
		tbt: lhr.audits["total-blocking-time"]?.numericValue ?? 0,
		...payload,
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
		fontPreloadBytes: median(runs.map((run) => run.fontPreloadBytes)),
		totalTransferBytes: median(runs.map((run) => run.totalTransferBytes)),
		highPriorityContentImages: Math.max(
			...runs.map((run) => run.highPriorityContentImages),
		),
		fontPreloadCount: Math.max(...runs.map((run) => run.fontPreloadCount)),
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
			report.fontPreloadBytes > budgets.fontPreloadBytes,
			`font preloads ${bytes(report.fontPreloadBytes)} > ${bytes(budgets.fontPreloadBytes)}`,
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
			report.fontPreloadCount > budgets.fontPreloadCount,
			`font preload count ${report.fontPreloadCount} > ${budgets.fontPreloadCount}`,
		],
	]
		.filter(([failed]) => failed)
		.map(([, message]) => message);
	return { report, failures };
}

async function lighthouseRun(profile, index, criticalSignals) {
	const chrome = await launch({
		chromeFlags: ["--headless=new", "--no-sandbox", "--disable-gpu"],
	});
	let result;
	try {
		result = await lighthouse(config.url, {
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
	const basename = `${profile.formFactor}-${index + 1}`;
	await writeFile(
		resolve(artifactDirectory, `${basename}.report.json`),
		result.report,
	);
	return measuredRun(result.lhr, criticalSignals);
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
		{ cwd: root, stdio: "inherit" },
	);
	server.once("error", (error) => {
		throw error;
	});
	const response = await waitForServer(config.url);
	const html = await response.text();
	if (/webpack-hmr/i.test(html)) {
		throw new Error(
			"Audit refused: the target looks like a Next.js development runtime",
		);
	}
	const criticalSignals = criticalResourceSignals(html);

	const mobileRuns = [];
	for (let index = 0; index < config.mobile.runs; index += 1)
		mobileRuns.push(await lighthouseRun(config.mobile, index, criticalSignals));
	const desktopRun = await lighthouseRun(config.desktop, 0, criticalSignals);
	const { report, failures } = validateMobile(mobileRuns);
	const evidence = {
		revision,
		url: config.url,
		mobileProfile: config.mobile,
		desktopProfile: config.desktop,
		mobileRuns,
		mobileMedian: report,
		desktopRun,
		generatedAt: new Date().toISOString(),
	};
	await writeFile(
		resolve(artifactDirectory, "summary.json"),
		`${JSON.stringify(evidence, null, 2)}\n`,
	);
	console.log(`Marketing production audit (${revision}) ${config.url}`);
	console.log(
		`Mobile runs: ${mobileRuns.map((run) => (run.performance * 100).toFixed(0)).join(", ")} | median ${(report.performance * 100).toFixed(0)} ${report.performance >= 0.98 ? "(98+ target reached)" : "(98+ target not guaranteed)"}`,
	);
	console.log(
		`Mobile median: LCP ${report.lcp.toFixed(0)}ms | CLS ${report.cls.toFixed(3)} | TBT ${report.tbt.toFixed(0)}ms | JS ${bytes(report.javascriptBytes)} | CSS ${bytes(report.cssBytes)} | fonts ${bytes(report.fontPreloadBytes)} | transfer ${bytes(report.totalTransferBytes)}`,
	);
	console.log(
		`Desktop Performance: ${(desktopRun.performance * 100).toFixed(0)}`,
	);
	if (failures.length) {
		console.error(
			`Marketing performance budget failed:\n- ${failures.join("\n- ")}\n\nTransferred resources:\n${diagnosticRequests(mobileRuns[0])}`,
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
