# CLAUDE.md

## Project Purpose
Snapshot Diff Viewer is a small TypeScript ESM package for read-only, deterministic viewing of `DiffResult` data. It exists to expose factual snapshot changes for forensic inspection. Behavioral boundaries are defined by `USER_CONTRACT.md` and the normative docs in `docs/`.

## Tech Stack
- TypeScript 5
- ESM package layout
- Vitest for tests

## Important Directories
- `src/core` - loading and validation
- `src/viewer` - viewer/rendering logic
- `src/types` - public type contracts
- `src/__tests__` - tests and fixtures
- `docs` - authoritative architecture and contract docs
- `dist` - generated output when present

## Coding Rules
- Keep the implementation read-only, deterministic, and fact-only.
- Treat `DiffResult` as the boundary; do not add diff computation, interpretation, ranking, heuristics, or action suggestions.
- Keep public exports intentional and aligned with `src/index.ts`.
- When implementation ideas conflict with `USER_CONTRACT.md` or `docs/*.md`, the docs win.

## Workflow And Verification
- Plan first for non-trivial changes before editing.
- Keep changes small and repository-focused.
- Before merge, run `npm test` and `npm run typecheck`.
- If a build script is added later, it must pass before merge as well.

## Git Rules
- Never commit directly to `main` or `master`.
- Use a branch for all changes.

## Documentation Rules
- Update `README.md` and relevant files in `docs/` when behavior, contracts, or user-facing output change.
- Do not duplicate `USER_CONTRACT.md`; reference it instead.
