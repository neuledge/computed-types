import { FunctionParameters } from './FunctionType';
import { ObjectProperty } from './utils';

export type ErrorLike<P extends FunctionParameters = never> =
  | string
  | ValidationError
  | ((...args: P) => string | ValidationError);

export type ObjectPath = ObjectProperty[];

export interface PathError {
  path: ObjectPath;
  error: Error;
}

export class ValidationError extends TypeError {
  public errors?: PathError[];
  public path?: ObjectPath;

  constructor(message: string, errors?: PathError[]) {
    super(message);

    this.errors = errors;

    // Extending error in TypeScript:
    // https://github.com/Microsoft/TypeScript-wiki/blob/master/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
    Object.setPrototypeOf(this, ValidationError.prototype);
  }

  public toJSON?(): Record<string, unknown> {
    return {
      message: this.message,
      errors: this.errors?.map(({ path, error }) => ({
        path,
        error: ValidationError.prototype.toJSON?.apply(error) || error,
      })),
    };
  }
}

ValidationError.prototype.name = 'ValidationError';

export function toError<P extends FunctionParameters>(
  error: ErrorLike<P>,
  ...args: P
): ValidationError {
  if (typeof error === 'string') {
    return new ValidationError(error);
  }

  if (typeof error === 'function') {
    return toError(error(...args));
  }

  return error;
}

export function toPathErrors(
  errorLike: ErrorLike,
  path: ObjectPath,
): PathError[] {
  const error = toError(errorLike);

  if (Array.isArray(error.path)) {
    path = error.path;
  }

  if (error.errors?.length) {
    return ([] as PathError[]).concat(
      ...error.errors.map((item) =>
        toPathErrors(item.error, [...path, ...item.path]),
      ),
    );
  }

  return [{ error, path }];
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
