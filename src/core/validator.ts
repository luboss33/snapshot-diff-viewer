/**
 * DiffResult Validator
 * Strict validation against Diff Model v2.
 * Fails fast on first contract violation.
 * READ_ONLY: Does not mutate input.
 */

import { ValidationError } from './ValidationError';
import type { DiffResult } from '../types';
import { CHANGE_TYPES, ChangeType } from '../types';

// --- Constants ---

const EXPECTED_DIFF_MODEL_VERSION = '2';

const TOP_LEVEL_KEYS = ['meta', 'summary', 'changes'];

const META_KEYS = ['engine_version', 'diff_model_version', 'snapshotA', 'snapshotB'];
const SNAPSHOT_REF_KEYS = ['id', 'nodeCount'];

const SUMMARY_KEYS: readonly ChangeType[] = CHANGE_TYPES;

const CHANGE_KEYS = ['change_id', 'changeType', 'nodeId', 'before', 'after'];

const CHANGE_TYPE_ORDER: readonly ChangeType[] = CHANGE_TYPES;

// --- Helpers ---

function isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isString(value: unknown): value is string {
    return typeof value === 'string';
}

function isNumber(value: unknown): value is number {
    return typeof value === 'number' && !isNaN(value);
}

function isInteger(value: unknown): value is number {
    return isNumber(value) && Number.isInteger(value);
}

function assertObject(value: unknown, path: string, rule: string): asserts value is Record<string, unknown> {
    if (!isObject(value)) {
        throw new ValidationError(path, rule, `expected object, got ${Array.isArray(value) ? 'array' : typeof value}`);
    }
}

function assertString(value: unknown, path: string, rule: string): asserts value is string {
    if (!isString(value)) {
        throw new ValidationError(path, rule, `expected string, got ${typeof value}`);
    }
}

function assertInteger(value: unknown, path: string, rule: string): asserts value is number {
    if (!isInteger(value)) {
        throw new ValidationError(path, rule, `expected integer, got ${typeof value}`);
    }
}

function assertArray(value: unknown, path: string, rule: string): asserts value is unknown[] {
    if (!Array.isArray(value)) {
        throw new ValidationError(path, rule, `expected array, got ${typeof value}`);
    }
}

function validateNoExtraKeys(obj: Record<string, unknown>, allowedKeys: readonly string[], path: string): void {
    const objKeys = Object.keys(obj);
    for (const key of objKeys) {
        if (!allowedKeys.includes(key)) {
            throw new ValidationError(path, 'NO_EXTRA_KEYS', `unexpected field '${key}'`);
        }
    }
}

function getRequiredField(obj: Record<string, unknown>, field: string, path: string): unknown {
    if (!(field in obj)) {
        throw new ValidationError(path, 'REQUIRED_FIELD', `missing required field '${field}'`);
    }
    return obj[field];
}

// --- Specific Validators ---

function validateSnapshotRef(ref: unknown, path: string): void {
    assertObject(ref, path, 'SNAPSHOT_REF_OBJECT');
    validateNoExtraKeys(ref, SNAPSHOT_REF_KEYS, path);

    const id = getRequiredField(ref, 'id', path);
    assertString(id, `${path}.id`, 'SNAPSHOT_ID_STRING');

    const nodeCount = getRequiredField(ref, 'nodeCount', path);
    assertInteger(nodeCount, `${path}.nodeCount`, 'SNAPSHOT_NODECOUNT_INTEGER');
    if ((nodeCount as number) < 0) {
        throw new ValidationError(`${path}.nodeCount`, 'SNAPSHOT_NODECOUNT_POSITIVE', 'must be >= 0');
    }
}

function validateMeta(meta: unknown, path: string): void {
    assertObject(meta, path, 'META_OBJECT');
    validateNoExtraKeys(meta, META_KEYS, path);

    const engineVersion = getRequiredField(meta, 'engine_version', path);
    assertString(engineVersion, `${path}.engine_version`, 'META_ENGINE_VERSION_STRING');

    const diffVersion = getRequiredField(meta, 'diff_model_version', path);
    if (diffVersion !== EXPECTED_DIFF_MODEL_VERSION) {
        throw new ValidationError(`${path}.diff_model_version`, 'META_DIFF_MODEL_VERSION', `expected "${EXPECTED_DIFF_MODEL_VERSION}", got "${diffVersion}"`);
    }

    validateSnapshotRef(getRequiredField(meta, 'snapshotA', path), `${path}.snapshotA`);
    validateSnapshotRef(getRequiredField(meta, 'snapshotB', path), `${path}.snapshotB`);
}

function validateSummary(summary: unknown, path: string): Record<ChangeType, number> {
    assertObject(summary, path, 'SUMMARY_OBJECT');
    validateNoExtraKeys(summary, SUMMARY_KEYS, path);

    const counts = {} as Record<ChangeType, number>;

    for (const key of SUMMARY_KEYS) {
        const value = getRequiredField(summary, key, path);
        assertInteger(value, `${path}.${key}`, 'SUMMARY_VALUE_INTEGER');
        if ((value as number) < 0) {
            throw new ValidationError(`${path}.${key}`, 'SUMMARY_VALUE_POSITIVE', 'must be >= 0');
        }
        counts[key] = value as number;
    }
    return counts;
}

function validateChange(change: unknown, path: string): ChangeType {
    assertObject(change, path, 'CHANGE_OBJECT');
    validateNoExtraKeys(change, CHANGE_KEYS, path);

    // change_id
    const changeId = getRequiredField(change, 'change_id', path);
    assertString(changeId, `${path}.change_id`, 'CHANGE_ID_STRING');

    // changeType
    const changeType = getRequiredField(change, 'changeType', path);
    assertString(changeType, `${path}.changeType`, 'CHANGE_TYPE_STRING');

    // We check if it is a valid ChangeType
    if (!CHANGE_TYPES.includes(changeType as ChangeType)) {
        throw new ValidationError(`${path}.changeType`, 'CHANGE_TYPE_ENUM', `invalid changeType '${changeType}'`);
    }
    // Now we can safely cast
    const type = changeType as ChangeType;

    // nodeId
    const nodeId = getRequiredField(change, 'nodeId', path);
    assertString(nodeId, `${path}.nodeId`, 'CHANGE_NODEID_STRING');

    const beforeVal = change['before'];
    const afterVal = change['after'];

    // Nullability Rules
    if (type === 'added') {
        if (beforeVal !== undefined && beforeVal !== null) {
            throw new ValidationError(`${path}.before`, 'NULLABILITY_ADDED', 'must be null or undefined for added');
        }
        if (afterVal === undefined || afterVal === null) {
            throw new ValidationError(`${path}.after`, 'NULLABILITY_ADDED', 'must be defined for added');
        }
    } else if (type === 'removed') {
        if (beforeVal === undefined || beforeVal === null) {
            throw new ValidationError(`${path}.before`, 'NULLABILITY_REMOVED', 'must be defined for removed');
        }
        if (afterVal !== undefined && afterVal !== null) {
            throw new ValidationError(`${path}.after`, 'NULLABILITY_REMOVED', 'must be null or undefined for removed');
        }
    } else {
        // moved, reordered, property, geometry
        if (beforeVal === undefined || beforeVal === null) {
            throw new ValidationError(`${path}.before`, `NULLABILITY_${type.toUpperCase()}`, `must be defined for ${type}`);
        }
        if (afterVal === undefined || afterVal === null) {
            throw new ValidationError(`${path}.after`, `NULLABILITY_${type.toUpperCase()}`, `must be defined for ${type}`);
        }
    }

    return type;
}

function validateOrderingAndConsistency(changes: unknown[], summaryCounts: Record<ChangeType, number>, path: string): void {
    const actualCounts: Record<ChangeType, number> = {
        removed: 0,
        added: 0,
        moved: 0,
        reordered: 0,
        property: 0,
        geometry: 0
    };

    let lastCategoryIndex = -1;
    let lastNodeId = "";

    for (let i = 0; i < changes.length; i++) {
        const change = changes[i] as Record<string, unknown>;
        const changePath = `${path}[${i}]`;
        const type = validateChange(change, changePath);

        // Count
        if (actualCounts[type] !== undefined) {
            actualCounts[type]++;
        }

        // Order
        const currentCategoryIndex = CHANGE_TYPE_ORDER.indexOf(type);
        const currentNodeId = change['nodeId'] as string;

        if (currentCategoryIndex < lastCategoryIndex) {
            const prevType = CHANGE_TYPE_ORDER[lastCategoryIndex];
            throw new ValidationError(changePath, 'ORDER_CATEGORY', `invalid category order: ${type} after ${prevType}`);
        }

        if (currentCategoryIndex > lastCategoryIndex) {
            lastCategoryIndex = currentCategoryIndex;
            lastNodeId = currentNodeId;
        } else {
            // Same category
            if (currentNodeId < lastNodeId) {
                throw new ValidationError(changePath, 'ORDER_NODEID', `invalid nodeId order within ${type}: ${currentNodeId} after ${lastNodeId}`);
            }
            lastNodeId = currentNodeId;
        }
    }

    // Consistency Check
    for (const key of SUMMARY_KEYS) {
        if (actualCounts[key] !== summaryCounts[key]) {
            throw new ValidationError('DiffResult.summary', 'SUMMARY_CONSISTENCY', `summary.${key} (${summaryCounts[key]}) does not match actual count (${actualCounts[key]})`);
        }
    }
}

export function validateDiffResult(input: unknown): asserts input is DiffResult {
    assertObject(input, 'DiffResult', 'DIFFRESULT_OBJECT');
    validateNoExtraKeys(input, TOP_LEVEL_KEYS, 'DiffResult');

    const meta = getRequiredField(input, 'meta', 'DiffResult');
    validateMeta(meta, 'DiffResult.meta');

    const summary = getRequiredField(input, 'summary', 'DiffResult');
    const summaryCounts = validateSummary(summary, 'DiffResult.summary');

    const changes = getRequiredField(input, 'changes', 'DiffResult');
    assertArray(changes, 'DiffResult.changes', 'CHANGES_ARRAY');

    validateOrderingAndConsistency(changes as unknown[], summaryCounts, 'DiffResult.changes');
}
