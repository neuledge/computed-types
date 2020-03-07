import { ObjectProperty } from './utils';

export interface ErrorPath<T = unknown> {
  path: ObjectProperty[];
  message: string;
  payload?: T;
}

export default interface ValidationError extends Error {
  paths?: ErrorPath[];
}

// exported functions

export function createValidationPathsFromError(
  key: ObjectProperty,
  err: Partial<ValidationError>,
): ErrorPath[] {
  const errorPaths = [];

  if (err && Array.isArray(err.paths)) {
    errorPaths.push(
      ...err.paths.map(path => ({
        path: [key].concat(path.path),
        message: String(err.message || err),
        payload: path.payload,
      })),
    );
  } else {
    errorPaths.push({
      path: [key],
      message: err ? String(err.message || err) : 'Unknown Error',
    });
  }

  return errorPaths;
}

export function createError(
  paths: ErrorPath[],
  message?: string,
): ValidationError {
  if (!paths || !paths.length) {
    throw new Error(message || 'Unknown Validation Error');
  }

  const err: ValidationError = new TypeError(message || paths[0].message);
  err.paths = paths;

  return err;
}
