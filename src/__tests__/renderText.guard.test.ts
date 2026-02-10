import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { renderText } from '../viewer/renderText';
import type { DiffResult } from '../types';

const fixturePath = resolve(__dirname, 'fixtures', 'diffResult.full.json');
const diff: DiffResult = JSON.parse(readFileSync(fixturePath, 'utf-8'));

describe('renderText guard', () => {
    const outputA = renderText(diff);
    const outputB = renderText(diff);

    it('returns a string', () => {
        expect(typeof outputA).toBe('string');
        expect(typeof outputB).toBe('string');
    });

    it('is deterministic', () => {
        expect(outputA).toBe(outputB);
    });

    it('contains meta.engine_version', () => {
        expect(outputA).toContain(diff.meta.engine_version);
    });

    it('contains meta.diff_version', () => {
        expect(outputA).toContain(diff.meta.diff_version);
    });

    it('contains meta.generated_at', () => {
        expect(outputA).toContain(diff.meta.generated_at);
    });

    it('contains snapshots.before.snapshot_id', () => {
        expect(outputA).toContain(diff.snapshots.before.snapshot_id);
    });

    it('contains snapshots.after.snapshot_id', () => {
        expect(outputA).toContain(diff.snapshots.after.snapshot_id);
    });

    describe('changes', () => {
        diff.changes.forEach((change, i) => {
            describe(`changes[${i}]`, () => {
                it('contains change_id', () => {
                    expect(outputA).toContain(change.change_id);
                });

                it('contains change_type', () => {
                    expect(outputA).toContain(change.change_type);
                });

                it('contains target.node_id', () => {
                    expect(outputA).toContain(change.target.node_id);
                });
            });
        });
    });
});
