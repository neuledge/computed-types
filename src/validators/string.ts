import compose from 'compose-function';
import { SyncFunctionValidator } from '../Schema';
import { Truthy } from './types';

interface NumericLength {
  length: number;
}

// exported functions

export const NonEmptyString: SyncFunctionValidator<string> = compose(
  String,
  Truthy,
);

export function MinLength<T extends NumericLength>(
  limit: number,
  errorMsg?: string,
): SyncFunctionValidator<T> {
  return (input: T): T => {
    if (input.length < limit) {
      throw new RangeError(
        errorMsg ||
          `Expect length to be at least ${limit} characters (actual: ${input.length})`,
      );
    }

    return input;
  };
}

export function MaxLength<T extends NumericLength>(
  limit: number,
  errorMsg?: string,
): SyncFunctionValidator<T> {
  return (input: T): T => {
    if (input.length > limit) {
      throw new RangeError(
        errorMsg ||
          `Expect length to be maximum of ${limit} characters (actual: ${input.length})`,
      );
    }

    return input;
  };
}

export function StringRange<T extends NumericLength>(
  minLength: number,
  maxLength: number,
  errorMsg?: string,
): SyncFunctionValidator<T> {
  return compose(
    MinLength<T>(minLength, errorMsg),
    MaxLength<T>(maxLength, errorMsg),
  );
}

export function LowerCaseString(input: unknown): string {
  if (typeof input !== 'string') {
    throw TypeError(`Unexpected type: ${typeof input}`);
  }

  return input.toLowerCase();
}
