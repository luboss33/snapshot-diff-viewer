# Snapshot Diff Viewer  
## User Contract (READ_ONLY Forensic Tool)

**Version:** 1.0  
**Status:** Normative usage rules

---

## 1. Purpose

Snapshot Diff Viewer is a **READ_ONLY forensic tool** whose sole purpose is to:

> **Expose factual differences between snapshot A and snapshot B.**

The tool answers only one question:

> **“What changed?”**

---

## 2. What the Tool Does

Snapshot Diff Viewer:

- operates **exclusively on DiffResult**
- exposes factual change records, including:
  - added nodes
  - removed nodes
  - moved nodes
  - updated node properties
- is:
  - deterministic
  - auditable
  - stateless
  - free of side effects

---

## 3. What the Tool Does NOT Do (Critical)

Snapshot Diff Viewer **never**:

- ❌ evaluates correctness or quality of changes  
- ❌ interprets the meaning or impact of changes  
- ❌ suggests fixes, actions, or next steps  
- ❌ renders UI or visual appearance  
- ❌ replaces UX, design, or functional testing  
- ❌ approves, rejects, or decides on changes  

If any of the above is expected, the tool is being used incorrectly.

---

## 4. Permitted Use

The tool is intended for:

- forensic verification of changes produced by AI or automated systems
- audit and post-mortem inspection of UI state changes
- technical decision-making based strictly on **factual change records**
- local or offline analysis without runtime dependency

---

## 5. Prohibited Use

Snapshot Diff Viewer **must NOT** be used:

- as a design or UX review tool
- as the sole source of truth for application functionality
- for automated approval or rejection of changes
- for comparing more than two snapshots
- for assigning blame or making political or personnel decisions
- for deriving conclusions not explicitly present in the DiffResult

---

## 6. User Responsibility

The user acknowledges that:

- all interpretation is performed **by the user**
- the tool provides **facts, not conclusions**
- misuse of the tool can lead to incorrect decisions

> **Responsibility for decisions based on this tool always lies with the human, never with the tool.**

---

## 7. Non-Negotiable Rule

> **The moment a user derives a conclusion that is not explicitly present in the DiffResult, the Snapshot Diff Viewer is being used outside its intended boundaries.**

This rule is absolute.

---

## 8. One-Sentence Summary

**Snapshot Diff Viewer exposes the truth about change — not its explanation, evaluation, or justification.**

---

### Note

This contract is a core part of the tool’s design.  
Violating it negates the forensic value of the output.
