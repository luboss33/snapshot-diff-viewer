# SNAPSHOT DIFF VIEWER — ROLE DEFINITION (AUTHORITATIVE)

Status: LOCKED  
Scope: Snapshot Diff Viewer  
Type: Architectural Role Definition  

This document defines the FINAL role of Snapshot Diff Viewer.
It is not a proposal and not a roadmap.

--------------------------------------------------

## Purpose

Snapshot Diff Viewer is a READ_ONLY forensic tool
that exposes factual UI changes to human users.

Its sole responsibility is to make DiffResult understandable
without interpretation or evaluation.

--------------------------------------------------

## Core Question It Answers

“What exactly changed between snapshot A and snapshot B?”

--------------------------------------------------

## Input Contract

Snapshot Diff Viewer accepts exactly one input:

- DiffResult

It does NOT:
- receive snapshots
- compute diffs
- compare states

DiffResult is treated as immutable fact.

--------------------------------------------------

## Output (Semantic Meaning)

Snapshot Diff Viewer produces:

- explicit, audit-friendly understanding of change
- enumeration of differences
- traceability to snapshot A or snapshot B

It does NOT produce:
- summaries
- evaluations
- recommendations
- narratives

--------------------------------------------------

## Characteristics

- READ_ONLY
- deterministic
- forensic by design
- change-aware
- state-agnostic

--------------------------------------------------

## Boundary Toward Inspect View

Snapshot Diff Viewer:
- does NOT inspect snapshots directly
- does NOT render UI state
- MAY link or drill down to Inspect View
  for viewing the raw state of a specific node
  in snapshot A or snapshot B

Inspect View:
- is unaware of diff
- remains unchanged
- remains state-only

--------------------------------------------------

## Explicit Non-Responsibilities

Snapshot Diff Viewer MUST NOT:
- interpret change meaning
- assess correctness or quality
- suggest fixes or actions
- act as approval or decision gate
- persist derived conclusions
- introduce intelligence of any kind

--------------------------------------------------

## One-Sentence Lock

Snapshot Diff Viewer exposes facts of change.
It never explains, evaluates, or acts on them.

END OF ROLE DEFINITION.
