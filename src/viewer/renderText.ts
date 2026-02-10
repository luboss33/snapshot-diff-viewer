/**
 * renderText — Pure projection of DiffResult to plain text.
 * No state. No side effects. No interpretation.
 * Preserves input order exactly.
 */

import type { DiffResult, Change, StateFragment } from '../types';

function renderStateFragment(fragment: StateFragment | null): string {
    if (fragment === null) {
        return 'null';
    }
    return JSON.stringify(fragment);
}

function renderChange(change: Change): string {
    const lines: string[] = [];
    lines.push(`change_id: ${change.change_id}`);
    lines.push(`change_type: ${change.change_type}`);
    lines.push(`target.node_id: ${change.target.node_id}`);
    if (change.target.parent_id !== undefined) {
        lines.push(`target.parent_id: ${change.target.parent_id}`);
    }
    lines.push(`before: ${renderStateFragment(change.before)}`);
    lines.push(`after: ${renderStateFragment(change.after)}`);
    return lines.join('\n');
}

export function renderText(diff: DiffResult): string {
    const lines: string[] = [];

    lines.push(`engine_version: ${diff.meta.engine_version}`);
    lines.push(`diff_version: ${diff.meta.diff_version}`);
    lines.push(`generated_at: ${diff.meta.generated_at}`);

    lines.push('---');

    lines.push(`snapshots.before.snapshot_id: ${diff.snapshots.before.snapshot_id}`);
    lines.push(`snapshots.after.snapshot_id: ${diff.snapshots.after.snapshot_id}`);

    for (let i = 0; i < diff.changes.length; i++) {
        lines.push('---');
        lines.push(renderChange(diff.changes[i]));
    }

    return lines.join('\n');
}
