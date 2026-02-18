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

    it('contains meta.diff_model_version', () => {
        expect(outputA).toContain(diff.meta.diff_model_version);
    });

    it('contains meta.snapshotA.id', () => {
        expect(outputA).toContain(diff.meta.snapshotA.id);
    });

    it('contains meta.snapshotB.id', () => {
        expect(outputA).toContain(diff.meta.snapshotB.id);
    });

    it('contains all summary fields', () => {
        const summaryKeys: (keyof typeof diff.summary)[] = [
            'removed',
            'added',
            'moved',
            'reordered',
            'property',
            'geometry'
        ];
        for (const key of summaryKeys) {
            expect(outputA).toContain(`summary.${key}: ${diff.summary[key]}`);
        }
    });

    describe('changes', () => {
        diff.changes.forEach((change, i) => {
            describe(`changes[${i}]`, () => {
                it('contains change_id', () => {
                    expect(outputA).toContain(change.change_id);
                });

                it('contains changeType', () => {
                    expect(outputA).toContain(change.changeType);
                });

                it('contains nodeId', () => {
                    expect(outputA).toContain(change.nodeId);
                });
            });
        });
    });
});
