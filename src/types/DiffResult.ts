/**
 * DiffResult Type Definitions — Diff Model v2
 * Matches docs/04_Diff_Model_v2.md exactly.
 * READ_ONLY: These types are immutable and must not be extended.
 */

export const CHANGE_TYPES = [
  'removed',
  'added',
  'moved',
  'reordered',
  'property',
  'geometry',
] as const;

export type ChangeType = typeof CHANGE_TYPES[number];

export interface SnapshotMetaRef {
  readonly id: string;
  readonly nodeCount: number;
}

export interface DiffMeta {
  readonly engine_version: string;
  readonly diff_model_version: '2';
  readonly snapshotA: SnapshotMetaRef;
  readonly snapshotB: SnapshotMetaRef;
}

export type Summary = {
  readonly [K in ChangeType]: number;
};

export interface DiffChange {
  readonly change_id: string;
  readonly changeType: ChangeType;
  readonly nodeId: string;
  readonly before?: unknown;
  readonly after?: unknown;
}

export interface DiffResult {
  readonly meta: DiffMeta;
  readonly summary: Summary;
  readonly changes: readonly DiffChange[];
}

export const ALLOWED_TOP_LEVEL_KEYS = [
  'meta',
  'summary',
  'changes',
] as const;
