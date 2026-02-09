import { describe, it, expect } from 'vitest';
import { validateDiffResult } from '../core/validator';
import { ValidationError } from '../core/ValidationError';
import { loadDiffResult } from '../core/loader';

function createValidDiffResult() {
    return {
        meta: {
            engine_version: '1.0.0',
            diff_version: '1.0.0',
            generated_at: '2026-02-09T12:00:00Z',
        },
        snapshots: {
            before: { snapshot_id: 'snap-001' },
            after: { snapshot_id: 'snap-002' },
        },
        changes: [
            {
                change_id: 'chg-001',
                change_type: 'NODE_ADDED',
                target: { node_id: 'node-123' },
                before: null,
                after: { name: 'Button', visible: true },
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
            expect(() => validateDiffResult(input)).toThrow(/unexpected fields.*extraField/);
        });

        it('rejects missing meta', () => {
            const { meta, ...input } = createValidDiffResult();
            expect(() => validateDiffResult(input)).toThrow(ValidationError);
            expect(() => validateDiffResult(input)).toThrow(/missing required field 'meta'/);
        });

        it('rejects missing snapshots', () => {
            const { snapshots, ...input } = createValidDiffResult();
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
            delete (input.meta as Record<string, unknown>).engine_version;
            expect(() => validateDiffResult(input)).toThrow(/missing required field 'engine_version'/);
        });

        it('rejects non-string engine_version', () => {
            const input = createValidDiffResult();
            (input.meta as Record<string, unknown>).engine_version = 123;
            expect(() => validateDiffResult(input)).toThrow(ValidationError);
        });

        it('rejects missing diff_version', () => {
            const input = createValidDiffResult();
            delete (input.meta as Record<string, unknown>).diff_version;
            expect(() => validateDiffResult(input)).toThrow(ValidationError);
        });

        it('rejects missing generated_at', () => {
            const input = createValidDiffResult();
            delete (input.meta as Record<string, unknown>).generated_at;
            expect(() => validateDiffResult(input)).toThrow(ValidationError);
        });
    });

    describe('snapshots validation', () => {
        it('rejects missing before', () => {
            const input = createValidDiffResult();
            delete (input.snapshots as Record<string, unknown>).before;
            expect(() => validateDiffResult(input)).toThrow(ValidationError);
        });

        it('rejects missing after', () => {
            const input = createValidDiffResult();
            delete (input.snapshots as Record<string, unknown>).after;
            expect(() => validateDiffResult(input)).toThrow(ValidationError);
        });

        it('rejects missing snapshot_id in before', () => {
            const input = createValidDiffResult();
            delete (input.snapshots.before as Record<string, unknown>).snapshot_id;
            expect(() => validateDiffResult(input)).toThrow(ValidationError);
        });
    });

    describe('change_type enum validation', () => {
        it('accepts NODE_ADDED', () => {
            const input = createValidDiffResult();
            input.changes[0].change_type = 'NODE_ADDED';
            (input.changes[0] as Record<string, unknown>).before = null;
            (input.changes[0] as Record<string, unknown>).after = { x: 1 };
            expect(() => validateDiffResult(input)).not.toThrow();
        });

        it('accepts NODE_REMOVED', () => {
            const input = createValidDiffResult();
            (input.changes[0] as Record<string, unknown>).change_type = 'NODE_REMOVED';
            (input.changes[0] as Record<string, unknown>).before = { x: 1 };
            (input.changes[0] as Record<string, unknown>).after = null;
            expect(() => validateDiffResult(input)).not.toThrow();
        });

        it('accepts NODE_MOVED', () => {
            const input = createValidDiffResult();
            (input.changes[0] as Record<string, unknown>).change_type = 'NODE_MOVED';
            (input.changes[0] as Record<string, unknown>).before = { parent_id: 'a' };
            (input.changes[0] as Record<string, unknown>).after = { parent_id: 'b' };
            expect(() => validateDiffResult(input)).not.toThrow();
        });

        it('accepts NODE_UPDATED', () => {
            const input = createValidDiffResult();
            (input.changes[0] as Record<string, unknown>).change_type = 'NODE_UPDATED';
            (input.changes[0] as Record<string, unknown>).before = { name: 'old' };
            (input.changes[0] as Record<string, unknown>).after = { name: 'new' };
            expect(() => validateDiffResult(input)).not.toThrow();
        });

        it('rejects invalid change_type', () => {
            const input = createValidDiffResult();
            (input.changes[0] as Record<string, unknown>).change_type = 'INVALID_TYPE';
            expect(() => validateDiffResult(input)).toThrow(ValidationError);
            expect(() => validateDiffResult(input)).toThrow(/invalid value 'INVALID_TYPE'/);
        });
    });

    describe('nullability rules', () => {
        it('rejects NODE_ADDED with non-null before', () => {
            const input = createValidDiffResult();
            (input.changes[0] as Record<string, unknown>).change_type = 'NODE_ADDED';
            (input.changes[0] as Record<string, unknown>).before = { x: 1 };
            (input.changes[0] as Record<string, unknown>).after = { y: 2 };
            expect(() => validateDiffResult(input)).toThrow(/must be null for NODE_ADDED/);
        });

        it('rejects NODE_ADDED with null after', () => {
            const input = createValidDiffResult();
            (input.changes[0] as Record<string, unknown>).change_type = 'NODE_ADDED';
            (input.changes[0] as Record<string, unknown>).before = null;
            (input.changes[0] as Record<string, unknown>).after = null;
            expect(() => validateDiffResult(input)).toThrow(/must be object for NODE_ADDED/);
        });

        it('rejects NODE_REMOVED with null before', () => {
            const input = createValidDiffResult();
            (input.changes[0] as Record<string, unknown>).change_type = 'NODE_REMOVED';
            (input.changes[0] as Record<string, unknown>).before = null;
            (input.changes[0] as Record<string, unknown>).after = null;
            expect(() => validateDiffResult(input)).toThrow(/must be object for NODE_REMOVED/);
        });

        it('rejects NODE_REMOVED with non-null after', () => {
            const input = createValidDiffResult();
            (input.changes[0] as Record<string, unknown>).change_type = 'NODE_REMOVED';
            (input.changes[0] as Record<string, unknown>).before = { x: 1 };
            (input.changes[0] as Record<string, unknown>).after = { y: 2 };
            expect(() => validateDiffResult(input)).toThrow(/must be null for NODE_REMOVED/);
        });

        it('rejects NODE_MOVED with null before', () => {
            const input = createValidDiffResult();
            (input.changes[0] as Record<string, unknown>).change_type = 'NODE_MOVED';
            (input.changes[0] as Record<string, unknown>).before = null;
            (input.changes[0] as Record<string, unknown>).after = { x: 1 };
            expect(() => validateDiffResult(input)).toThrow(/must be object for NODE_MOVED/);
        });

        it('rejects NODE_UPDATED with null after', () => {
            const input = createValidDiffResult();
            (input.changes[0] as Record<string, unknown>).change_type = 'NODE_UPDATED';
            (input.changes[0] as Record<string, unknown>).before = { x: 1 };
            (input.changes[0] as Record<string, unknown>).after = null;
            expect(() => validateDiffResult(input)).toThrow(/must be object for NODE_UPDATED/);
        });
    });

    describe('change required fields', () => {
        it('rejects missing change_id', () => {
            const input = createValidDiffResult();
            delete (input.changes[0] as Record<string, unknown>).change_id;
            expect(() => validateDiffResult(input)).toThrow(/missing required field 'change_id'/);
        });

        it('rejects missing target', () => {
            const input = createValidDiffResult();
            delete (input.changes[0] as Record<string, unknown>).target;
            expect(() => validateDiffResult(input)).toThrow(/missing required field 'target'/);
        });

        it('rejects missing node_id in target', () => {
            const input = createValidDiffResult();
            delete (input.changes[0].target as Record<string, unknown>).node_id;
            expect(() => validateDiffResult(input)).toThrow(/missing required field 'node_id'/);
        });
    });
});

describe('loadDiffResult', () => {
    it('returns immutable DiffResult', () => {
        const input = createValidDiffResult();
        const result = loadDiffResult(input);

        expect(Object.isFrozen(result.diffResult)).toBe(true);
        expect(Object.isFrozen(result.diffResult.meta)).toBe(true);
        expect(Object.isFrozen(result.diffResult.snapshots)).toBe(true);
        expect(Object.isFrozen(result.diffResult.changes)).toBe(true);
    });

    it('preserves all data correctly', () => {
        const input = createValidDiffResult();
        const result = loadDiffResult(input);

        expect(result.diffResult.meta.engine_version).toBe('1.0.0');
        expect(result.diffResult.snapshots.before.snapshot_id).toBe('snap-001');
        expect(result.diffResult.changes[0].change_id).toBe('chg-001');
        expect(result.diffResult.changes[0].change_type).toBe('NODE_ADDED');
    });

    it('throws ValidationError for invalid input', () => {
        expect(() => loadDiffResult(null)).toThrow(ValidationError);
        expect(() => loadDiffResult({ invalid: true })).toThrow(ValidationError);
    });

    it('handles multiple changes', () => {
        const input = createValidDiffResult();
        input.changes.push({
            change_id: 'chg-002',
            change_type: 'NODE_REMOVED',
            target: { node_id: 'node-456' },
            before: { name: 'OldNode' },
            after: null,
        });

        const result = loadDiffResult(input);
        expect(result.diffResult.changes.length).toBe(2);
    });
});
