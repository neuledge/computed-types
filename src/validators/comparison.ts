import { SyncFunctionValidator } from '../Schema';
import { ErrorLike, toError } from '../Error';

// exported functions

export function Equals<T>(
  value: T,
  error?: ErrorLike,
): SyncFunctionValidator<T, [unknown]> {
  return (input: unknown): T => {
    if (input !== value) {
      throw toError(
        error || `Expect value to equals "${value}" (given: "${input}")`,
      );
    }

    return value;
  };
}

export function GreaterThan<T>(
  value: T,
  error?: ErrorLike,
): SyncFunctionValidator<T, [unknown]> {
  return (input: unknown): T => {
    if (input == null || !((input as T) > value)) {
      throw toError(
        error ||
          `Expect value to be greater then "${value}" (given: "${input}")`,
      );
    }

    return input as T;
  };
}

export function GreaterThanEqual<T>(
  value: T,
  error?: ErrorLike,
): SyncFunctionValidator<T, [unknown]> {
  return (input: unknown): T => {
    if (input == null || !((input as T) >= value)) {
      throw toError(
        error ||
          `Expect value to be greater then or equal to "${value}" (given: "${input}")`,
      );
    }

    return input as T;
  };
}

export function LessThan<T>(
  value: T,
  error?: ErrorLike,
): SyncFunctionValidator<T, [unknown]> {
  return (input: unknown): T => {
    if (input == null || !((input as T) < value)) {
      throw toError(
        error || `Expect value to be less then "${value}" (given: "${input}")`,
      );
    }

    return input as T;
  };
}

export function LessThanEqual<T>(
  value: T,
  error?: ErrorLike,
): SyncFunctionValidator<T, [unknown]> {
  return (input: unknown): T => {
    if (input == null || !((input as T) <= value)) {
      throw toError(
        error ||
          `Expect value to be less then or equal to "${value}" (given: "${input}")`,
      );
    }

    return input as T;
  };
}

export function Between<T>(
  minValue: T | null,
  maxValue: T | null,
  error?: ErrorLike,
): SyncFunctionValidator<T, [unknown]> {
  return (input: unknown): T => {
    if (
      input == null ||
      (minValue !== null && !((input as T) >= minValue)) ||
      (maxValue !== null && !((input as T) <= maxValue))
    ) {
      throw toError(
        error ||
          `Expect value to be between "${minValue}" to "${maxValue}" (given: "${input}")`,
      );
    }

    return input as T;
  };
}
