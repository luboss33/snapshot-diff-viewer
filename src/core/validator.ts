/**
 * DiffResult Validator
 * Strict validation against docs/DIFF_RESULT_CONTRACT.md.
 * Fails fast on first contract violation.
 * READ_ONLY: Does not mutate input.
 */

import { ValidationError } from './ValidationError';
import { CHANGE_TYPES, ALLOWED_TOP_LEVEL_KEYS, ChangeType } from '../types';

function isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isString(value: unknown): value is string {
    return typeof value === 'string';
}

function isArray(value: unknown): value is unknown[] {
    return Array.isArray(value);
}

function assertString(value: unknown, path: string, rule: string): asserts value is string {
    if (!isString(value)) {
        throw new ValidationError(path, rule, `expected string, got ${typeof value}`);
    }
}

function assertObject(value: unknown, path: string, rule: string): asserts value is Record<string, unknown> {
    if (!isObject(value)) {
        throw new ValidationError(path, rule, `expected object, got ${Array.isArray(value) ? 'array' : typeof value}`);
    }
}

function assertArray(value: unknown, path: string, rule: string): asserts value is unknown[] {
    if (!isArray(value)) {
        throw new ValidationError(path, rule, `expected array, got ${typeof value}`);
    }
}

function assertRequiredField(obj: Record<string, unknown>, field: string, path: string): unknown {
    if (!(field in obj)) {
        throw new ValidationError(path, 'REQUIRED_FIELD', `missing required field '${field}'`);
    }
    return obj[field];
}

function validateNoExtraKeys(obj: Record<string, unknown>, allowedKeys: readonly string[], path: string): void {
    const extraKeys = Object.keys(obj).filter(k => !allowedKeys.includes(k));
    if (extraKeys.length > 0) {
        throw new ValidationError(path, 'NO_EXTRA_KEYS', `unexpected fields: ${extraKeys.join(', ')}`);
    }
}

function validateMeta(meta: unknown, path: string): void {
    assertObject(meta, path, 'META_OBJECT');
    assertString(assertRequiredField(meta, 'engine_version', path), `${path}.engine_version`, 'META_ENGINE_VERSION');
    assertString(assertRequiredField(meta, 'diff_version', path), `${path}.diff_version`, 'META_DIFF_VERSION');
    assertString(assertRequiredField(meta, 'generated_at', path), `${path}.generated_at`, 'META_GENERATED_AT');
}

function validateSnapshotRef(ref: unknown, path: string): void {
    assertObject(ref, path, 'SNAPSHOT_REF_OBJECT');
    assertString(assertRequiredField(ref, 'snapshot_id', path), `${path}.snapshot_id`, 'SNAPSHOT_ID');
}

function validateSnapshots(snapshots: unknown, path: string): void {
    assertObject(snapshots, path, 'SNAPSHOTS_OBJECT');
    const before = assertRequiredField(snapshots, 'before', path);
    const after = assertRequiredField(snapshots, 'after', path);
    validateSnapshotRef(before, `${path}.before`);
    validateSnapshotRef(after, `${path}.after`);
}

function validateTarget(target: unknown, path: string): void {
    assertObject(target, path, 'TARGET_OBJECT');
    assertString(assertRequiredField(target, 'node_id', path), `${path}.node_id`, 'TARGET_NODE_ID');
    if ('parent_id' in target && target.parent_id !== undefined) {
        assertString(target.parent_id, `${path}.parent_id`, 'TARGET_PARENT_ID');
    }
}

function validateStateFragment(fragment: unknown, path: string, allowNull: boolean): void {
    if (fragment === null) {
        if (!allowNull) {
            throw new ValidationError(path, 'STATE_FRAGMENT_NOT_NULL', 'expected object, got null');
        }
        return;
    }
    assertObject(fragment, path, 'STATE_FRAGMENT_OBJECT');
}

function validateNullabilityRules(changeType: ChangeType, before: unknown, after: unknown, path: string): void {
    switch (changeType) {
        case 'NODE_ADDED':
            if (before !== null) {
                throw new ValidationError(`${path}.before`, 'NULLABILITY_NODE_ADDED', 'must be null for NODE_ADDED');
            }
            if (after === null) {
                throw new ValidationError(`${path}.after`, 'NULLABILITY_NODE_ADDED', 'must be object for NODE_ADDED');
            }
            break;
        case 'NODE_REMOVED':
            if (before === null) {
                throw new ValidationError(`${path}.before`, 'NULLABILITY_NODE_REMOVED', 'must be object for NODE_REMOVED');
            }
            if (after !== null) {
                throw new ValidationError(`${path}.after`, 'NULLABILITY_NODE_REMOVED', 'must be null for NODE_REMOVED');
            }
            break;
        case 'NODE_MOVED':
        case 'NODE_UPDATED':
            if (before === null) {
                throw new ValidationError(`${path}.before`, 'NULLABILITY_NODE_MOVED_UPDATED', `must be object for ${changeType}`);
            }
            if (after === null) {
                throw new ValidationError(`${path}.after`, 'NULLABILITY_NODE_MOVED_UPDATED', `must be object for ${changeType}`);
            }
            break;
    }
}

function validateChange(change: unknown, path: string): void {
    assertObject(change, path, 'CHANGE_OBJECT');

    const changeId = assertRequiredField(change, 'change_id', path);
    assertString(changeId, `${path}.change_id`, 'CHANGE_ID');

    const changeType = assertRequiredField(change, 'change_type', path);
    assertString(changeType, `${path}.change_type`, 'CHANGE_TYPE_STRING');
    if (!CHANGE_TYPES.includes(changeType as ChangeType)) {
        throw new ValidationError(`${path}.change_type`, 'CHANGE_TYPE_ENUM', `invalid value '${changeType}', allowed: ${CHANGE_TYPES.join(', ')}`);
    }

    const target = assertRequiredField(change, 'target', path);
    validateTarget(target, `${path}.target`);

    const before = assertRequiredField(change, 'before', path);
    const after = assertRequiredField(change, 'after', path);

    validateNullabilityRules(changeType as ChangeType, before, after, path);
    validateStateFragment(before, `${path}.before`, changeType === 'NODE_ADDED');
    validateStateFragment(after, `${path}.after`, changeType === 'NODE_REMOVED');
}

function validateChanges(changes: unknown, path: string): void {
    assertArray(changes, path, 'CHANGES_ARRAY');
    for (let i = 0; i < changes.length; i++) {
        validateChange(changes[i], `${path}[${i}]`);
    }
}

export function validateDiffResult(input: unknown): void {
    assertObject(input, 'DiffResult', 'DIFFRESULT_OBJECT');

    validateNoExtraKeys(input, ALLOWED_TOP_LEVEL_KEYS, 'DiffResult');

    const meta = assertRequiredField(input, 'meta', 'DiffResult');
    const snapshots = assertRequiredField(input, 'snapshots', 'DiffResult');
    const changes = assertRequiredField(input, 'changes', 'DiffResult');

    validateMeta(meta, 'DiffResult.meta');
    validateSnapshots(snapshots, 'DiffResult.snapshots');
    validateChanges(changes, 'DiffResult.changes');
}
