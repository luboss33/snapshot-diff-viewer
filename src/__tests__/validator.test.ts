import { describe, it, expect } from 'vitest';
import { validateDiffResult } from '../core/validator';
import { ValidationError } from '../core/ValidationError';
import { loadDiffResult } from '../core/loader';

function createValidDiffResult() {
    return {
        meta: {
            engine_version: '2.0.0',
            diff_model_version: '2',
            snapshotA: {
                id: 'snap-A',
                nodeCount: 1,
            },
            snapshotB: {
                id: 'snap-B',
                nodeCount: 2,
            },
        },
        summary: {
            removed: 0,
            added: 1,
            moved: 0,
            reordered: 0,
            property: 0,
            geometry: 0,
        },
        changes: [
            {
                change_id: 'chg-001',
                changeType: 'added',
                nodeId: 'node-1',
                after: { name: 'Button' },
            },
        ],
    };
}

describe('validateDiffResult', () => {
    describe('top-level structure', () => {
        it('accepts valid DiffResult', () => {
            expect(() => validateDiffResult(createValidDiffResult())).not.toThrow();
        });

        it('rejects non-object input', () => {
            expect(() => validateDiffResult(null)).toThrow(ValidationError);
            expect(() => validateDiffResult('string')).toThrow(ValidationError);
            expect(() => validateDiffResult(123)).toThrow(ValidationError);
            expect(() => validateDiffResult([])).toThrow(ValidationError);
        });

        it('rejects unknown top-level fields', () => {
            const input = { ...createValidDiffResult(), extraField: 'value' };
            expect(() => validateDiffResult(input)).toThrow(ValidationError);
        });

        it('rejects missing meta', () => {
            const { meta, ...input } = createValidDiffResult();
            expect(() => validateDiffResult(input)).toThrow(ValidationError);
        });

        it('rejects missing summary', () => {
            const { summary, ...input } = createValidDiffResult();
            expect(() => validateDiffResult(input)).toThrow(ValidationError);
        });

        it('rejects missing changes', () => {
            const { changes, ...input } = createValidDiffResult();
            expect(() => validateDiffResult(input)).toThrow(ValidationError);
        });
    });

    describe('meta validation', () => {
        it('rejects missing engine_version', () => {
            const input = createValidDiffResult();
            delete (input.meta as any).engine_version;
            expect(() => validateDiffResult(input)).toThrow(ValidationError);
        });

        it('rejects invalid diff_model_version', () => {
            const input = createValidDiffResult();
            (input.meta as any).diff_model_version = '1';
            expect(() => validateDiffResult(input)).toThrow(ValidationError);
        });

        it('rejects missing snapshotA.id', () => {
            const input = createValidDiffResult();
            delete (input.meta.snapshotA as any).id;
            expect(() => validateDiffResult(input)).toThrow(ValidationError);
        });

        it('rejects negative nodeCount', () => {
            const input = createValidDiffResult();
            (input.meta.snapshotA as any).nodeCount = -1;
            expect(() => validateDiffResult(input)).toThrow(ValidationError);
        });
    });

    describe('summary validation', () => {
        it('rejects missing summary key', () => {
            const input = createValidDiffResult();
            delete (input.summary as any).added;
            expect(() => validateDiffResult(input)).toThrow(ValidationError);
        });

        it('rejects negative summary value', () => {
            const input = createValidDiffResult();
            (input.summary as any).added = -1;
            expect(() => validateDiffResult(input)).toThrow(ValidationError);
        });
    });

    describe('changeType enum validation', () => {
        it('accepts removed', () => {
            const input = createValidDiffResult();
            input.summary = {
                removed: 1,
                added: 0,
                moved: 0,
                reordered: 0,
                property: 0,
                geometry: 0,
            };
            input.changes[0] = {
                change_id: 'c1',
                changeType: 'removed',
                nodeId: 'node-1',
                before: { x: 1 },
            };
            expect(() => validateDiffResult(input)).not.toThrow();
        });

        it('rejects invalid changeType', () => {
            const input = createValidDiffResult();
            (input.changes[0] as any).changeType = 'INVALID';
            expect(() => validateDiffResult(input)).toThrow(ValidationError);
        });
    });

    describe('nullability rules', () => {
        it('rejects added with before defined', () => {
            const input = createValidDiffResult();
            (input.changes[0] as any).before = { x: 1 };
            expect(() => validateDiffResult(input)).toThrow(ValidationError);
        });

        it('rejects removed with after defined', () => {
            const input = createValidDiffResult();
            input.summary = {
                removed: 1,
                added: 0,
                moved: 0,
                reordered: 0,
                property: 0,
                geometry: 0,
            };
            input.changes[0] = {
                change_id: 'c1',
                changeType: 'removed',
                nodeId: 'node-1',
                before: { x: 1 },
                after: { y: 2 },
            };
            expect(() => validateDiffResult(input)).toThrow(ValidationError);
        });

        it('rejects property change with null before', () => {
            const input = createValidDiffResult();
            input.summary = {
                removed: 0,
                added: 0,
                moved: 0,
                reordered: 0,
                property: 1,
                geometry: 0,
            };
            input.changes[0] = {
                change_id: 'c1',
                changeType: 'property',
                nodeId: 'node-1',
                before: null,
                after: { x: 1 },
            };
            expect(() => validateDiffResult(input)).toThrow(ValidationError);
        });
    });

    describe('ordering rules', () => {
        it('rejects wrong category order', () => {
            const input = createValidDiffResult();
            input.summary = {
                removed: 1,
                added: 1,
                moved: 0,
                reordered: 0,
                property: 0,
                geometry: 0,
            };
            input.changes = [
                {
                    change_id: 'c1',
                    changeType: 'added',
                    nodeId: 'node-1',
                    after: {},
                },
                {
                    change_id: 'c2',
                    changeType: 'removed',
                    nodeId: 'node-2',
                    before: {},
                },
            ];
            expect(() => validateDiffResult(input)).toThrow(ValidationError);
        });

        it('rejects wrong nodeId order within category', () => {
            const input = createValidDiffResult();
            input.summary = {
                removed: 0,
                added: 2,
                moved: 0,
                reordered: 0,
                property: 0,
                geometry: 0,
            };
            input.changes = [
                {
                    change_id: 'c2',
                    changeType: 'added',
                    nodeId: 'node-2',
                    after: {},
                },
                {
                    change_id: 'c1',
                    changeType: 'added',
                    nodeId: 'node-1',
                    after: {},
                },
            ];
            expect(() => validateDiffResult(input)).toThrow(ValidationError);
        });
    });

    describe('summary consistency', () => {
        it('rejects inconsistent count', () => {
            const input = createValidDiffResult();
            input.summary.added = 2; // actual is 1
            expect(() => validateDiffResult(input)).toThrow(ValidationError);
        });
    });
});

describe('loadDiffResult', () => {
    it('returns immutable DiffResult', () => {
        const input = createValidDiffResult();
        const result = loadDiffResult(input);

        expect(Object.isFrozen(result.diffResult)).toBe(true);
        expect(Object.isFrozen(result.diffResult.meta)).toBe(true);
        expect(Object.isFrozen(result.diffResult.summary)).toBe(true);
        expect(Object.isFrozen(result.diffResult.changes)).toBe(true);
    });

    it('preserves all data correctly', () => {
        const input = createValidDiffResult();
        const result = loadDiffResult(input);

        expect(result.diffResult.meta.engine_version).toBe('2.0.0');
        expect(result.diffResult.meta.snapshotA.id).toBe('snap-A');
        expect(result.diffResult.changes[0].change_id).toBe('chg-001');
        expect(result.diffResult.changes[0].changeType).toBe('added');
    });

    it('throws ValidationError for invalid input', () => {
        expect(() => loadDiffResult(null)).toThrow(ValidationError);
        expect(() => loadDiffResult({ invalid: true })).toThrow(ValidationError);
    });
});
