# openspec-workflow-guidance Specification

## Purpose
TBD - created by archiving change configure-openspec-hook-instructions. Update Purpose after archive.

## Requirements
### Requirement: Proposal workflow uses repo and docs context
The system SHALL require OpenSpec proposal work to use repo context from `openspec/config.yaml`, review relevant files from `docs/`, prefer CodeGraph for structural repo questions, and invoke `/grill-me` only when ambiguity remains after that review.

#### Scenario: Proposal is straightforward after local review
- **WHEN** a proposal request is clear after reading repo context and relevant `docs/` files
- **THEN** the proposal flow creates proposal artifacts without invoking `/grill-me`

#### Scenario: Proposal still has unresolved ambiguity
- **WHEN** scope, success criteria, tradeoffs, or constraints remain unclear after repo and relevant `docs/` review
- **THEN** the proposal flow invokes `/grill-me` before finalizing artifacts

#### Scenario: Proposal needs structural repo context
- **WHEN** proposal work needs symbol, call-flow, impact, or architecture context from the codebase
- **THEN** the workflow prefers CodeGraph over grep-first exploration

### Requirement: Apply workflow runs mandatory validation
The system SHALL require OpenSpec apply work to read the change artifacts plus relevant `docs/` context, prefer CodeGraph for structural repo analysis, and run `pnpm check`, `pnpm test`, and `pnpm typecheck` before closing the apply session.

#### Scenario: Apply session completes successfully
- **WHEN** implementation work finishes for an apply session
- **THEN** the workflow runs `pnpm check`, `pnpm test`, and `pnpm typecheck` before reporting completion

#### Scenario: Task completion is recorded during apply
- **WHEN** a task is marked complete during apply
- **THEN** the related work and required validation have already been completed or any validation failure has been explicitly reported

#### Scenario: Apply work needs structural repo analysis
- **WHEN** implementation work needs symbol lookup, callers/callees, impact analysis, or architecture tracing
- **THEN** the workflow prefers CodeGraph over grep-first exploration

### Requirement: Archive workflow confirms and completes remaining tasks
The system SHALL warn about unchecked tasks during archive, require user confirmation, and then mark the remaining tasks complete before archiving the change.

#### Scenario: Archive finds incomplete tasks
- **WHEN** archive is requested for a change with unchecked tasks
- **THEN** the workflow shows the incomplete tasks, asks for confirmation, and marks them complete only after confirmation before archiving

#### Scenario: Archive has no incomplete tasks
- **WHEN** archive is requested for a change whose tasks are already complete
- **THEN** the workflow proceeds without forced task completion

### Requirement: OpenSpec workflow defaults to caveman response style
The system SHALL use `/caveman` response style for `opsx:propose`, `opsx:apply`, and `opsx:archive` unless the user explicitly disables it.

#### Scenario: OpenSpec workflow starts under default settings
- **WHEN** a user invokes `opsx:propose`, `opsx:apply`, or `opsx:archive`
- **THEN** the workflow responds using `/caveman` style by default

#### Scenario: User disables caveman style
- **WHEN** the user explicitly requests normal mode
- **THEN** subsequent OpenSpec workflow responses no longer use `/caveman` style
