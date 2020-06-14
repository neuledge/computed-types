import { FunctionParameters } from './FunctionType.ts';
import { ObjectProperty } from './utils.ts';

export type ErrorLike<P extends FunctionParameters = never> =
  | string
  | Error
  | ((...args: P) => string | Error);

export function toError<P extends FunctionParameters>(
  error: ErrorLike<P>,
  ...args: P
): Error {
  if (typeof error === 'string') {
    return new TypeError(error);
  }

  if (typeof error === 'function') {
    return toError(error(...args));
  }

  return error;
}

export type ObjectPath = ObjectProperty[];

export interface PathError {
  path: ObjectPath;
  error: Error;
}

export interface ValidationError extends Error {
  errors?: PathError[];
}

export function createValidationError<P extends FunctionParameters>(
  errors: PathError[],
  error: ErrorLike<P> | null | undefined,
  ...args: P
): ValidationError {
  if (!error) {
    if (errors[0]) {
      const { path, error: err } = errors[0];
      const message = String((err && err.message) || err);

      error = path ? `${path.join('.')}: ${message}` : message;
    } else {
      error = 'Unknown Validation Error';
    }
  }

  const err: ValidationError = toError(error, ...args);
  err.errors = errors;

  return err;
}
