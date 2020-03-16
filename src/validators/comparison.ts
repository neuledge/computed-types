import { SyncFunctionValidator } from '../Schema';
import { ErrorLike, toError } from '../Error';

// exported functions

export function Equals<T>(
  value: T,
  error?: ErrorLike,
): SyncFunctionValidator<T, [T]> {
  return (input: T): T => {
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
): SyncFunctionValidator<T, [T]> {
  return (input: T): T => {
    if (!(input > value)) {
      throw toError(
        error ||
          `Expect value to be greater then "${value}" (given: "${input}")`,
      );
    }

    return input;
  };
}

export function GreaterThanEqual<T>(
  value: T,
  error?: ErrorLike,
): SyncFunctionValidator<T, [T]> {
  return (input: T): T => {
    if (!(input >= value)) {
      throw toError(
        error ||
          `Expect value to be greater then or equal to "${value}" (given: "${input}")`,
      );
    }

    return input;
  };
}

export function LessThan<T>(
  value: T,
  error?: ErrorLike,
): SyncFunctionValidator<T, [T]> {
  return (input: T): T => {
    if (!(input < value)) {
      throw toError(
        error || `Expect value to be less then "${value}" (given: "${input}")`,
      );
    }

    return input;
  };
}

export function LessThanEqual<T>(
  value: T,
  error?: ErrorLike,
): SyncFunctionValidator<T, [T]> {
  return (input: T): T => {
    if (!(input <= value)) {
      throw toError(
        error ||
          `Expect value to be less then or equal to "${value}" (given: "${input}")`,
      );
    }

    return input;
  };
}

export function Between<T>(
  minValue: T | null,
  maxValue: T | null,
  error?: ErrorLike,
): SyncFunctionValidator<T, [T]> {
  return (input: T): T => {
    if (
      (minValue !== null && !(input >= minValue)) ||
      (maxValue !== null && !(input <= maxValue))
    ) {
      throw toError(
        error ||
          `Expect value to be between "${minValue}" to "${maxValue}" (given: "${input}")`,
      );
    }

    return input;
  };
}
