import { ObjectProperty } from './utils';

export type ErrorLike = string | Error;

export type Path = ObjectProperty[];

export interface ErrorPath {
  path: ObjectProperty[];
  error: Error;
}

export default interface ValidationError extends Error {
  paths?: ErrorPath[];
}

// exported functions

export function getErrorPaths(error: ValidationError, path: Path): ErrorPath[] {
  if (!error.paths) {
    return [
      {
        path,
        error,
      },
    ];
  }

  return error.paths.map((ep) => ({
    path: [...path, ...ep.path],
    error: ep.error,
  }));
}

export function toError(error: ErrorLike): Error {
  if (typeof error === 'string') {
    return new TypeError(error);
  }

  return error;
}

export function createValidationError(
  paths: ErrorPath[],
  error?: ErrorLike,
): ValidationError {
  if (!paths || !paths.length) {
    throw toError(error || 'Unknown Validation Error');
  }

  const err: ValidationError = toError(error || paths[0].error);
  err.paths = paths;

  return err;
}
