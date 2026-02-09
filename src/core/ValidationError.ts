/**
 * ValidationError
 * Thrown when DiffResult fails contract validation.
 * Fails fast on first violation.
 */

export class ValidationError extends Error {
    public readonly path: string;
    public readonly rule: string;

    constructor(path: string, rule: string, message: string) {
        super(`Validation failed at '${path}': ${message} [Rule: ${rule}]`);
        this.name = 'ValidationError';
        this.path = path;
        this.rule = rule;
        Object.setPrototypeOf(this, ValidationError.prototype);
    }
}
