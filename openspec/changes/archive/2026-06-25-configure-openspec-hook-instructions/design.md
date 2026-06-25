## Context

The repo already has OpenSpec enabled with the `spec-driven` schema and skill-level guidance for `opsx:propose`, `opsx:apply`, and `opsx:archive`. Today, `openspec/config.yaml` contains no project context or artifact rules, and `CLAUDE.md` only mentions that the workflow exists. That leaves key behavior unstated: when proposal work should dig into `docs/`, when to invoke `/grill-me`, when CodeGraph should be preferred over text search, what validation is mandatory during apply, how archive should handle unfinished tasks, and whether `/caveman` should be the default style across the workflow.

OpenSpec natively supports shared project `context` and per-artifact `rules`, but not separate YAML hook blocks for propose/apply/archive. Because of that split, the implementation should place artifact-generation constraints in `openspec/config.yaml` and place hook-specific operating rules in repo agent docs.

## Goals / Non-Goals

**Goals:**
- Make proposal artifacts consistently grounded in repo and `docs/` context.
- Make structural repo analysis during OpenSpec work consistently prefer CodeGraph.
- Make apply sessions consistently run lint, tests, and typecheck before completion.
- Make archive behavior explicit when tasks are still unchecked.
- Make OpenSpec workflow communication style consistently use `/caveman`.
- Keep the workflow decision-complete without changing OpenSpec CLI behavior.

**Non-Goals:**
- Replace or fork the built-in OpenSpec CLI or skill files.
- Add new product features or modify application runtime behavior.
- Require reading every file under `docs/` for every change.

## Decisions

### 1. Use `openspec/config.yaml` for shared context and artifact rules

`openspec/config.yaml` should hold stack details, repo conventions, validation expectations, and artifact-specific rules for `proposal`, `design`, and `tasks`. This is the only native OpenSpec place to inject reusable project context into artifact generation.

Alternative considered: document everything only in `CLAUDE.md`. Rejected because proposal/design/tasks generation should receive repo context directly from OpenSpec instructions, not rely only on external agent memory.

### 2. Use `CLAUDE.md` for hook-specific behavior

`CLAUDE.md` should define what `opsx:propose`, `opsx:apply`, and `opsx:archive` must do, because those are agent workflows layered on top of OpenSpec rather than native YAML-configurable hooks.

Alternative considered: encode hook behavior in `.openspec.yaml` per change. Rejected because current per-change files only track schema metadata and would duplicate workflow policy across every change.

### 3. Treat `docs/` as relevant-context input, not blanket input

Proposal and apply guidance should require reading relevant files from `docs/`, with `docs/PRD.md`, `docs/TASKS.md`, and `docs/CLAUDE_DESIGN_PROMPT.md` as examples when they relate to the change. This keeps proposals grounded without forcing wasteful reads of unrelated material.

Alternative considered: require all of `docs/` on every proposal. Rejected because it adds noise and slows down small infra or tooling changes.

### 4. Gate `/grill-me` on unresolved ambiguity

Proposal flow should invoke `/grill-me` only when ambiguity remains after repo and docs review, especially unclear scope, success criteria, tradeoffs, or conflicting constraints. This preserves speed for straightforward changes and still sharpens underspecified ones.

Alternative considered: always run `/grill-me`. Rejected because many repo changes are already decision-complete from local context.

### 5. Prefer CodeGraph for structural questions during OpenSpec work

Proposal and apply guidance should tell the agent to prefer CodeGraph for structural repo questions such as symbol lookup, callers/callees, impact analysis, and architecture tracing, while using grep/read for literal text and already-open files. This matches the repo rule in `.cursor/rules/codegraph.mdc` and avoids redundant grep-first exploration.

Alternative considered: keep CodeGraph guidance isolated in its own section only. Rejected because OpenSpec workflow instructions should restate critical operating defaults instead of assuming the agent will merge them correctly every time.

### 6. Make apply validation mandatory before task completion

Apply flow should always run `pnpm check`, `pnpm test`, and `pnpm typecheck` before closing the session, and tasks should only be marked complete after the related work and required validation pass or any failures are explicitly reported.

Alternative considered: run only targeted validation. Rejected because the requested workflow standard is full lint, test, and typecheck coverage for every apply session.

### 7. Force explicit confirmation before archive auto-completes tasks

Archive flow should warn when unchecked tasks remain, ask for confirmation, then mark the remaining tasks complete before archiving. This supports your desired archive behavior without silently claiming unfinished work was done.

Alternative considered: auto-complete tasks without confirmation. Rejected because it can misrepresent implementation state and validation status.

### 8. Make `/caveman` the default OpenSpec response style

Repo workflow docs should state that `opsx:propose`, `opsx:apply`, and `opsx:archive` respond in `/caveman` style unless the user explicitly disables it.

Alternative considered: leave `/caveman` opt-in. Rejected because the workflow should default to compressed responses across all OpenSpec steps.

## Risks / Trade-offs

- Archive task auto-completion can blur "done" versus "administratively closed" → document that confirmation is required and that completion does not imply successful validation unless apply recorded it.
- Full apply validation may slow down small changes → accepted because consistency is more important than speed for this workflow.
- Relevant-only `docs/` context leaves room for judgment → mitigate with explicit examples in config/docs so the expected files are obvious.
- CodeGraph guidance can become stale if the MCP server is unavailable or index is stale → mitigate by referencing `.cursor/rules/codegraph.mdc` behavior, including fallback to direct file reads for listed stale files.
