#!/usr/bin/env zx
/**
 * Project setup wizard.
 *
 * Takes a fresh clone of this template to a runnable app:
 *   1. renames the project (package.json, README, strips template metadata)
 *   2. bootstraps .env from .env.example and prompts for the required secrets
 *   3. (optional) points you at Neon for the database connection string
 *   4. generates the Prisma client and runs migrations
 *
 * Run with: pnpm setup
 */
import "zx/globals";

$.verbose = false;

const root = path.resolve(__dirname, "..");
const log = {
	step: (s) => console.log(chalk.cyan.bold(`\n${s}`)),
	ok: (s) => console.log(chalk.green(`  ✓ ${s}`)),
	info: (s) => console.log(chalk.dim(`  ${s}`)),
	warn: (s) => console.log(chalk.yellow(`  ! ${s}`)),
};

console.log(chalk.bold("\n🏜  sietch project setup\n"));

// ── 1. Rename project ────────────────────────────────────────────────────────
log.step("1/4  Project name");
const pkgPath = path.join(root, "package.json");
const pkg = await fs.readJSON(pkgPath);
const defaultName = path.basename(root);
const rawName =
	(await question(`  Project name (${chalk.dim(defaultName)}): `)) ||
	defaultName;
const name = rawName
	.trim()
	.toLowerCase()
	.replace(/[^a-z0-9-]+/g, "-")
	.replace(/^-+|-+$/g, "");

if (name && name !== pkg.name) {
	const prevName = pkg.name;
	pkg.name = name;
	// Strip create-t3-app template metadata once renamed.
	delete pkg.ct3aMetadata;
	await fs.writeFile(pkgPath, `${JSON.stringify(pkg, null, "\t")}\n`);

	const readmePath = path.join(root, "README.md");
	if (await fs.pathExists(readmePath)) {
		const readme = await fs.readFile(readmePath, "utf8");
		await fs.writeFile(readmePath, readme.replace(/^#\s+.+$/m, `# ${name}`));
	}
	log.ok(`Renamed "${prevName}" → "${name}"`);
} else {
	log.info("Keeping current name.");
}

// ── 2. Environment ───────────────────────────────────────────────────────────
log.step("2/4  Environment (.env)");
const envPath = path.join(root, ".env");
const examplePath = path.join(root, ".env.example");

if (await fs.pathExists(envPath)) {
	log.warn(".env already exists — leaving it untouched.");
} else {
	if (!(await fs.pathExists(examplePath))) {
		log.warn(".env.example not found — skipping env bootstrap.");
	} else {
		let env = await fs.readFile(examplePath, "utf8");

		log.info("Press Enter to skip any value and fill it in later.\n");
		const prompts = [
			[
				"DATABASE_URL",
				"Neon pooled connection string (https://console.neon.tech)",
			],
			["NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY", "Clerk publishable key (pk_...)"],
			["CLERK_SECRET_KEY", "Clerk secret key (sk_...)"],
			[
				"CLERK_WEBHOOK_SIGNING_SECRET",
				"Clerk webhook signing secret (whsec_...)",
			],
		];

		for (const [key, hint] of prompts) {
			const answer = (
				await question(`  ${key}\n    ${chalk.dim(hint)}: `)
			).trim();
			if (answer) env = setEnvVar(env, key, answer);
		}

		await fs.writeFile(envPath, env);
		log.ok("Wrote .env");
	}
}

// ── 3. Database (Neon) ───────────────────────────────────────────────────────
log.step("3/4  Database");
if (process.env.NEON_API_KEY) {
	log.info(
		"NEON_API_KEY detected. Automated branch provisioning isn't wired up yet —",
	);
	log.info(
		"create a project at https://console.neon.tech and paste the pooled string into .env.",
	);
} else {
	log.info(
		"Using Neon. Create a project at https://console.neon.tech, copy the pooled",
	);
	log.info("connection string, and ensure it's set as DATABASE_URL in .env.");
}

// ── 4. Finalize ──────────────────────────────────────────────────────────────
log.step("4/4  Prisma");
const envBody = (await fs.pathExists(envPath))
	? await fs.readFile(envPath, "utf8")
	: "";
const hasDbUrl =
	/^DATABASE_URL=.+/m.test(envBody) &&
	!/DATABASE_URL="postgresql:\/\/\.\.\."/.test(envBody);

try {
	await $({ stdio: "inherit" })`pnpm prisma generate`;
	log.ok("Generated Prisma client");
} catch {
	log.warn("prisma generate failed — run `pnpm prisma generate` manually.");
}

if (hasDbUrl) {
	const runMigrate = (
		await question("\n  Run `prisma migrate dev` now? (Y/n): ")
	)
		.trim()
		.toLowerCase();
	if (runMigrate !== "n") {
		try {
			await $({ stdio: "inherit" })`pnpm prisma migrate dev`;
			log.ok("Applied migrations");
		} catch {
			log.warn(
				"Migration failed — check DATABASE_URL and rerun `pnpm prisma migrate dev`.",
			);
		}
	}
} else {
	log.info(
		"Skipping migrations until DATABASE_URL is set. Then run `pnpm prisma migrate dev`.",
	);
}

console.log(`${chalk.green.bold("\nDone.")} Next:\n`);
console.log(`${chalk.dim("  pnpm dev      ")}# start the dev server`);
console.log(
	`${chalk.dim("  pnpm tunnel   ")}# expose Clerk webhooks locally\n`,
);

/** Set or replace `KEY=...` in a .env file body, preserving the rest. */
function setEnvVar(body, key, value) {
	const line = `${key}="${value}"`;
	const re = new RegExp(`^${key}=.*$`, "m");
	return re.test(body)
		? body.replace(re, line)
		: `${body.trimEnd()}\n${line}\n`;
}
