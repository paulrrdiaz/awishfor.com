## 1. OpenSpec config

- [x] 1.1 Add shared project `context` to `openspec/config.yaml` covering stack, repo conventions, env update rules, validation expectations, and use of relevant `docs/` files.
- [x] 1.2 Add `proposal`, `design`, and `tasks` rules to `openspec/config.yaml` so generated artifacts consistently include docs-driven context, decision-complete design details, and verification-oriented tasks.
- [x] 1.3 Extend `openspec/config.yaml` guidance so OpenSpec work prefers CodeGraph for structural repo questions and keeps docs review explicit.

## 2. Workflow documentation

- [x] 2.1 Update `CLAUDE.md` OpenSpec guidance to define `opsx:propose` behavior, including relevant `docs/` review, ambiguity-based `/grill-me`, and `/caveman` default style.
- [x] 2.2 Update `CLAUDE.md` OpenSpec guidance to define `opsx:apply` behavior, including required context reads, task completion expectations, and mandatory `pnpm check`, `pnpm test`, and `pnpm typecheck`.
- [x] 2.3 Update `CLAUDE.md` OpenSpec guidance to define `opsx:archive` behavior, including incomplete-task warning, confirmation, forced task completion before archive, spec sync expectations, and `/caveman` default style.
- [x] 2.4 Update workflow docs so OpenSpec work prefers CodeGraph for structural repo analysis and keeps relevant docs review explicit.

## 3. Validation

- [x] 3.1 Run `openspec instructions proposal --change configure-openspec-hook-instructions --json` and confirm shared context and artifact rules are reflected.
- [x] 3.2 Review the resulting workflow docs and confirm the propose/apply/archive instructions are unambiguous and consistent with the requested defaults.
- [x] 3.3 Review the repo CodeGraph guidance and confirm the OpenSpec workflow text aligns with `.cursor/rules/codegraph.mdc`.
