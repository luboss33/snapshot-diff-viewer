# DIFF MODEL V2 — VIEWER INPUT CONTRACT (AUTHORITATIVE)

Status: LOCKED  
Scope: Snapshot Diff Viewer Input Boundary  
Type: Authoritative Interface Definition (v2)

This document defines the ONLY DiffResult shape
that Snapshot Diff Viewer is allowed to consume
under Diff Model v2.

This is NOT an engine specification.
This is NOT a hashing specification.
This is NOT a UI specification.

This is the viewer-facing boundary.

--------------------------------------------------

## 1. Supported Model Version

Snapshot Diff Viewer supports:

diff_model_version === "2"

If diff_model_version is not exactly "2",
the viewer MUST fail fast.

No backward compatibility is permitted.

--------------------------------------------------

## 2. Top-Level Structure

DiffResult MUST contain exactly:

- meta
- summary
- changes

No additional top-level fields are allowed.

--------------------------------------------------

## 3. meta

meta:
  engine_version: string
  diff_model_version: "2"
  snapshotA:
    id: string
    nodeCount: number
  snapshotB:
    id: string
    nodeCount: number

Rules:

- Viewer treats all meta fields as opaque.
- Viewer MUST NOT infer meaning from engine_version.
- Viewer MUST NOT recompute nodeCount.
- Viewer MUST NOT load snapshots directly.
- meta MUST NOT influence rendering logic.

--------------------------------------------------

## 4. summary

summary is a total mapping over ChangeType.

Allowed keys:

- removed
- added
- moved
- reordered
- property
- geometry

Rules:

- Viewer MUST NOT recompute summary.
- Viewer MUST NOT derive new counts.
- Viewer MUST NOT treat summary as authoritative over changes.
- Viewer MUST display summary as factual input only.

--------------------------------------------------

## 5. changes

changes is an ordered array of atomic change records.

Each change:

- change_id: string
- changeType: ChangeType
- nodeId: string
- before?: unknown
- after?: unknown

Viewer MUST:

- Preserve order exactly.
- Never reorder changes.
- Never group or merge changes.
- Never collapse multiple changes.
- Never derive additional change types.

--------------------------------------------------

## 6. change_id

change_id is treated as opaque.

Viewer MUST NOT:

- Regenerate change_id
- Hash or verify change_id
- Infer algorithm details
- Depend on hash structure

Viewer MAY:

- Display shortened versions for UI purposes

--------------------------------------------------

## 7. Nullability Rules (Viewer Enforcement)

- added:
  - before MUST be null or undefined
  - after MUST be defined

- removed:
  - before MUST be defined
  - after MUST be null or undefined

- moved / reordered / property / geometry:
  - before MUST be defined
  - after MUST be defined

Viewer enforces structural validity only.
Viewer does not interpret semantics.

--------------------------------------------------

## 8. Deterministic Ordering

Changes MUST already be ordered by the engine.

Viewer:

- Preserves ordering
- Validates structural correctness
- Never re-sorts

--------------------------------------------------

### 8.1 Deterministic Ordering Rules (Normative)

The Snapshot Diff Engine MUST produce changes ordered as follows:

1. Category order (strict sequence):

   - removed
   - added
   - moved
   - reordered
   - property
   - geometry

2. Within the same category:

   - nodeId MUST be sorted in ascending lexicographical order.

These ordering rules are enforced strictly by the Snapshot Diff Viewer validator.

If ordering does not comply with these rules,
the viewer MUST fail fast.

--------------------------------------------------

## 9. Immutability Guarantee

DiffResult is treated as immutable input.

Viewer MUST NOT:

- Modify fields
- Enrich records
- Cache derived data
- Persist transformed versions

--------------------------------------------------

## 10. Forbidden Viewer Behavior

Viewer MUST NOT:

- Compute diffs
- Compare snapshots directly
- Filter or mutate changes
- Rank or prioritize changes
- Introduce heuristics
- Introduce AI
- Interpret meaning

--------------------------------------------------

## FINAL LOCK

If Snapshot Diff Viewer requires data
not present in this contract,
the implementation is invalid.

END OF CONTRACT.
