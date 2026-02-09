# SNAPSHOT DIFF VIEWER — ANTI-PATTERN CHECKLIST (AUTHORITATIVE)

If any item in this document appears in the implementation,
the Snapshot Diff Viewer is no longer valid.

--------------------------------------------------

## FORBIDDEN: STATE & INSPECTION

- rendering full UI state
- previewing pages or layouts
- inspecting snapshots directly
- replacing or duplicating Inspect View
- computing state-derived metrics

Rule:
Viewer knows CHANGE, not STATE.

--------------------------------------------------

## FORBIDDEN: INTERPRETATION

- labeling changes as important / minor / risky
- explaining why a change happened
- summarizing changes into narratives
- evaluating correctness or quality
- highlighting suspicious or problematic changes

Rule:
Viewer exposes facts, not meaning.

--------------------------------------------------

## FORBIDDEN: GUIDANCE & ACTION

- suggesting next steps
- proposing fixes or rollbacks
- implying approval or rejection
- acting as workflow gate
- integrating decision logic

Rule:
Viewer never tells users what to do.

--------------------------------------------------

## FORBIDDEN: COMPUTATION

- computing or recomputing diffs
- filtering or mutating DiffResult
- comparing more than two snapshots
- merging DiffResults
- enriching DiffResult with derived data

Rule:
DiffResult is immutable input.

--------------------------------------------------

## FORBIDDEN: INTELLIGENCE

- heuristics of any kind
- AI or ML logic
- scoring or prioritization
- inference beyond explicit DiffResult fields

Rule:
No intelligence layer exists in Viewer.

--------------------------------------------------

## RESPONSIBILITY VIOLATIONS

- shared logic with Inspect View
- Inspect View becoming diff-aware
- Viewer absorbing inspect responsibilities
- “small extensions” crossing boundaries

--------------------------------------------------

## Final Test

If the Snapshot Diff Viewer does anything
other than exposing factual differences
from DiffResult to a human,

it is architecturally incorrect.

END OF CHECKLIST.
