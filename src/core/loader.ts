/**
 * DiffResult Loader
 * Accepts DiffResult, validates it, returns normalized immutable representation.
 * READ_ONLY: Does not mutate input.
 * Deterministic: Same input always produces same output.
 */

import { DiffResult } from '../types';
import { validateDiffResult } from './validator';

export interface LoadResult {
    readonly diffResult: DiffResult;
}

export function loadDiffResult(input: unknown): LoadResult {
    validateDiffResult(input);

    const validated = input as DiffResult;

    return {
        diffResult: Object.freeze({
            meta: Object.freeze({ ...validated.meta }),
            snapshots: Object.freeze({
                before: Object.freeze({ ...validated.snapshots.before }),
                after: Object.freeze({ ...validated.snapshots.after }),
            }),
            changes: Object.freeze(
                validated.changes.map(change =>
                    Object.freeze({
                        change_id: change.change_id,
                        change_type: change.change_type,
                        target: Object.freeze({ ...change.target }),
                        before: change.before === null ? null : Object.freeze({ ...change.before }),
                        after: change.after === null ? null : Object.freeze({ ...change.after }),
                    })
                )
            ),
        }),
    };
}
