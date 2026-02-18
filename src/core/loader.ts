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
            meta: Object.freeze({
                ...validated.meta,
                snapshotA: Object.freeze({ ...validated.meta.snapshotA }),
                snapshotB: Object.freeze({ ...validated.meta.snapshotB }),
            }),
            summary: Object.freeze({ ...validated.summary }),
            changes: Object.freeze(
                validated.changes.map(change =>
                    Object.freeze({
                        ...change,
                        before:
                            change.before !== undefined &&
                                change.before !== null &&
                                typeof change.before === 'object'
                                ? Object.freeze({ ...(change.before as Record<string, unknown>) })
                                : change.before,
                        after:
                            change.after !== undefined &&
                                change.after !== null &&
                                typeof change.after === 'object'
                                ? Object.freeze({ ...(change.after as Record<string, unknown>) })
                                : change.after,
                    })
                )
            ),
        }),
    };
}
