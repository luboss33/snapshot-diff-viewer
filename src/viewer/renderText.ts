/**
 * renderText — Pure projection of DiffResult (v2) to plain text.
 * No state. No side effects.
 * Preserves input order exactly.
 */

import type { DiffResult } from '../types';

function renderValue(value: unknown): string {
    if (value === undefined) {
        return 'undefined';
    }
    if (value === null) {
        return 'null';
    }
    return JSON.stringify(value);
}

export function renderText(diff: DiffResult): string {
    const lines: string[] = [];

    const { meta, summary, changes } = diff;

    // Meta
    lines.push(`engine_version: ${meta.engine_version}`);
    lines.push(`diff_model_version: ${meta.diff_model_version}`);
    lines.push('');
    lines.push(`snapshotA.id: ${meta.snapshotA.id}`);
    lines.push(`snapshotA.nodeCount: ${meta.snapshotA.nodeCount}`);
    lines.push('');
    lines.push(`snapshotB.id: ${meta.snapshotB.id}`);
    lines.push(`snapshotB.nodeCount: ${meta.snapshotB.nodeCount}`);

    // Separator
    lines.push('---');

    // Summary
    lines.push(`summary.removed: ${summary.removed}`);
    lines.push(`summary.added: ${summary.added}`);
    lines.push(`summary.moved: ${summary.moved}`);
    lines.push(`summary.reordered: ${summary.reordered}`);
    lines.push(`summary.property: ${summary.property}`);
    lines.push(`summary.geometry: ${summary.geometry}`);

    // Changes (preserve order exactly)
    for (const change of changes) {
        lines.push('---');
        lines.push(`change_id: ${change.change_id}`);
        lines.push(`changeType: ${change.changeType}`);
        lines.push(`nodeId: ${change.nodeId}`);
        lines.push(`before: ${renderValue(change.before)}`);
        lines.push(`after: ${renderValue(change.after)}`);
    }

    return lines.join('\n');
}
