# Snapshot Diff Viewer

READ_ONLY forensic viewer for DiffResult produced by Snapshot Diff.

⚠️ Snapshot Diff Viewer is a READ_ONLY forensic tool.  
Usage rules and boundaries are defined in [USER_CONTRACT.md](./USER_CONTRACT.md).

This repository contains:
- the authoritative definition of Snapshot Diff Viewer responsibilities
- the implementation of Snapshot Diff Viewer
- explicit architectural boundaries that MUST NOT be crossed

This is NOT:
- a diff engine
- an inspect tool
- a UI editor
- a planning or execution system

--------------------------------------------------

## Design Invariants

- READ_ONLY by design: the viewer never mutates data, state, or systems.
- Facts only: it exposes what changed, never why it changed or whether it is correct.
- DiffResult is the boundary: all meaning comes exclusively from the provided DiffResult.
- No decision authority: approval, rejection, or interpretation always belongs to humans.

--------------------------------------------------

## Scope Lock (NON-NEGOTIABLE)

Snapshot Diff Viewer exists to expose factual differences
between Snapshot A and Snapshot B to human users.

It MUST:
- consume DiffResult as immutable input
- expose factual changes only
- remain READ_ONLY
- remain deterministic

It MUST NOT:
- compute diffs
- inspect or render full UI state
- interpret, evaluate, or rank changes
- suggest actions, fixes, or next steps
- use heuristics or AI
- absorb Inspect View responsibilities

If any of the above rules are violated,
the implementation is architecturally incorrect.

--------------------------------------------------

## Authoritative Documents

The following documents define the FINAL meaning of this repository:

- USER_CONTRACT.md
- docs/ROLE.md
- docs/ANTI_PATTERNS.md

All code in this repository MUST comply with them.

--------------------------------------------------

## Relationship to Other Systems

- Snapshot Diff Engine:
  Computes DiffResult. Not part of this repo.

- Inspect View:
  Displays raw UI state. Not part of this repo.

Snapshot Diff Viewer:
- knows CHANGE, not STATE
- exposes facts, not meaning

--------------------------------------------------

## Enforcement Rule

If there is a conflict between implementation ideas
and the documents in /docs or USER_CONTRACT.md,

THE DOCUMENTS WIN.

End of README.
