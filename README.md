# Snapshot Diff Viewer

READ_ONLY forensic viewer for DiffResult produced by Snapshot Diff.

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
and the documents in /docs,

THE DOCUMENTS WIN.

End of README.
