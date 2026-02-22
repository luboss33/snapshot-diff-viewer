export type {
    DiffResult,
    DiffChange,
    ChangeType
} from './types';

export {
    loadDiffResult,
    validateDiffResult,
    ValidationError
} from './core';

export { renderText } from './viewer/renderText';
