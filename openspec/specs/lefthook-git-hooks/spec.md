# lefthook-git-hooks Specification

## Purpose
TBD - created by archiving change upgrade-packages-add-shadcn-lefthook. Update Purpose after archive.
## Requirements
### Requirement: lefthook is installed as a dev dependency
The system SHALL have `lefthook` listed in `devDependencies` in `package.json` and git hooks registered in `.git/hooks/` via `lefthook install`.

#### Scenario: lefthook binary is available
- **WHEN** `pnpm lefthook --version` is run
- **THEN** it outputs a version string matching `^2.x`

#### Scenario: Git hooks are registered
- **WHEN** `ls .git/hooks/` is inspected after `lefthook install`
- **THEN** `pre-commit` and `post-commit` hook files exist and are executable

### Requirement: Pre-commit hook runs Biome on staged files
The system SHALL run `biome check --write` on staged files before every commit and re-stage any auto-fixed files so the commit contains the corrected output.

#### Scenario: Biome check runs on staged files
- **WHEN** a file with a fixable lint issue is staged and `git commit` is run
- **THEN** lefthook executes `pnpm biome check --write` against only the staged files

#### Scenario: Auto-fixed files are re-staged
- **WHEN** biome auto-fixes a staged file during pre-commit
- **THEN** the fixed version is staged automatically (via `stage_fixed: true`) so the commit includes the corrected code

#### Scenario: Commit is blocked on unfixable errors
- **WHEN** a staged file has a non-auto-fixable biome error
- **THEN** the pre-commit hook exits with a non-zero code and the commit is aborted

### Requirement: Post-commit hook syncs codegraph index
The system SHALL trigger a codegraph index sync after every successful commit so the symbol graph reflects the latest committed code.

#### Scenario: Codegraph sync runs after commit
- **WHEN** a commit completes successfully
- **THEN** lefthook runs `npx codegraph sync` in the post-commit hook

#### Scenario: Missing codegraph binary does not block commits
- **WHEN** `codegraph` is not installed or sync fails
- **THEN** the post-commit hook exits with code 0 (failure is non-blocking; hook uses `|| true`)

### Requirement: lefthook configuration is version-controlled
The system SHALL have a `lefthook.yml` file committed to the repository root so all contributors share the same hook definitions.

#### Scenario: Config file exists in repo root
- **WHEN** the repository is cloned fresh
- **THEN** `lefthook.yml` is present at the root and `lefthook install` can be run immediately

