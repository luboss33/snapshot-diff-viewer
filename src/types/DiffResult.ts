/**
 * DiffResult Type Definitions
 * Matches docs/DIFF_RESULT_CONTRACT.md exactly.
 * READ_ONLY: These types are immutable and must not be extended.
 */

export const CHANGE_TYPES = ['NODE_ADDED', 'NODE_REMOVED', 'NODE_MOVED', 'NODE_UPDATED'] as const;
export type ChangeType = typeof CHANGE_TYPES[number];

export interface DiffMeta {
  readonly engine_version: string;
  readonly diff_version: string;
  readonly generated_at: string;
}

export interface SnapshotRef {
  readonly snapshot_id: string;
}

export interface DiffSnapshots {
  readonly before: SnapshotRef;
  readonly after: SnapshotRef;
}

export interface ChangeTarget {
  readonly node_id: string;
  readonly parent_id?: string;
}

export interface StateFragment {
  readonly [key: string]: unknown;
}

export interface Change {
  readonly change_id: string;
  readonly change_type: ChangeType;
  readonly target: ChangeTarget;
  readonly before: StateFragment | null;
  readonly after: StateFragment | null;
}

export interface DiffResult {
  readonly meta: DiffMeta;
  readonly snapshots: DiffSnapshots;
  readonly changes: readonly Change[];
}

export const ALLOWED_TOP_LEVEL_KEYS = ['meta', 'snapshots', 'changes'] as const;
