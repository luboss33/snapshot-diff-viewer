# AUTHORITATIVE DIFFRESULT CONTRACT — VIEWER-FACING

Status: LOCKED  
Scope: Snapshot Diff Viewer Input Contract  
Type: Authoritative Interface Definition  

This document defines the ONLY DiffResult shape that
Snapshot Diff Viewer is allowed to consume.

This is NOT an engine contract.
This is NOT a UI specification.
This is the viewer-facing boundary.

--------------------------------------------------

## PURPOSE

DiffResult represents factual differences between
Snapshot A and Snapshot B as computed by Snapshot Diff Engine.

Snapshot Diff Viewer:
- consumes DiffResult as immutable fact
- does not recompute, enrich, or reinterpret it

--------------------------------------------------

## TOP-LEVEL STRUCTURE

DiffResult MUST have the following top-level fields:

- meta
- snapshots
- changes

No additional top-level fields are allowed.

--------------------------------------------------

## meta

Describes provenance and determinism.

Required fields:
- engine_version: string
- diff_version: string
- generated_at: string (ISO 8601)

Rules:
- Viewer MUST NOT infer meaning from meta
- Viewer MUST NOT alter or persist meta

--------------------------------------------------

## snapshots

Identifies the compared snapshots.

Required fields:
- before:
  - snapshot_id: string
- after:
  - snapshot_id: string

Rules:
- Viewer treats snapshot identifiers as opaque values
- Viewer MUST NOT load snapshots directly
- Viewer MUST NOT assume ordering beyond before/after

--------------------------------------------------

## changes

A list of atomic, independent change records.

Type:
- changes: array of Change

Rules:
- Order is engine-defined and preserved
- Viewer MUST NOT reorder changes
- Viewer MUST NOT group or merge changes
- Each Change is self-contained

--------------------------------------------------

## Change (Atomic Record)

Each Change represents exactly ONE factual difference.

Required fields:
- change_id: string
- change_type: enum
- target
- before
- after

--------------------------------------------------

## change_type (ENUM)

Allowed values ONLY:

- NODE_ADDED
- NODE_REMOVED
- NODE_MOVED
- NODE_UPDATED

No other values are permitted.

Viewer MUST:
- treat change_type as factual classification
- NOT derive severity or importance

--------------------------------------------------

## target

Identifies what changed.

Required fields:
- node_id: string

Optional fields:
- parent_id: string

Rules:
- Viewer treats identifiers as opaque
- Viewer MUST NOT resolve hierarchy on its own

--------------------------------------------------

## before / after

Describe factual state fragments relevant to the change.

Rules:
- before MAY be null (e.g. NODE_ADDED)
- after MAY be null (e.g. NODE_REMOVED)
- Viewer MUST NOT assume symmetry

Allowed content:
- raw property values
- raw geometry values
- raw flags (visibility, locked, etc.)

Forbidden content:
- derived metrics
- summaries
- scores
- interpretations

--------------------------------------------------

## NULLABILITY RULES

- NODE_ADDED:
  - before = null
  - after = object

- NODE_REMOVED:
  - before = object
  - after = null

- NODE_MOVED / NODE_UPDATED:
  - before = object
  - after = object

Viewer MUST NOT infer missing data.

--------------------------------------------------

## IMMUTABILITY GUARANTEE

Snapshot Diff Viewer MUST treat DiffResult as immutable.

It MUST NOT:
- modify fields
- enrich records
- cache derived conclusions
- persist transformed versions

--------------------------------------------------

## FORBIDDEN BEHAVIOR (CONTRACT LEVEL)

Viewer MUST NOT:
- compute diffs
- filter or collapse changes
- rank or prioritize changes
- infer meaning or severity
- introduce heuristics or AI

--------------------------------------------------

## FINAL LOCK

If Snapshot Diff Viewer requires data
not present in this contract,

the implementation is invalid.

END OF CONTRACT.
