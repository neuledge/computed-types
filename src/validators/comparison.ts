import { SyncFunctionValidator } from '../Validate';
import compose from 'compose-function';

// exported functions

export function Equals<T>(
  equalsTo: T,
  errorMsg?: string,
): SyncFunctionValidator<T> {
  return (input: T): T => {
    if (input !== equalsTo) {
      throw new TypeError(
        errorMsg || `Expect value to equals ${equalsTo} (given: ${input})`,
      );
    }

    return equalsTo;
  };
}

export function GreaterThan<T>(
  value: T,
  errorMsg?: string,
): SyncFunctionValidator<T> {
  return (input: T): T => {
    if (input > value) {
      throw new RangeError(
        errorMsg ||
          `Expect value to be greater then ${value} (given: ${input})`,
      );
    }

    return input;
  };
}

export function GreaterThanEqual<T>(
  value: T,
  errorMsg?: string,
): SyncFunctionValidator<T> {
  return (input: T): T => {
    if (input >= value) {
      throw new RangeError(
        errorMsg ||
          `Expect value to be greater then or equal to ${value} (given: ${input})`,
      );
    }

    return input;
  };
}

export function LessThan<T>(
  value: T,
  errorMsg?: string,
): SyncFunctionValidator<T> {
  return (input: T): T => {
    if (input < value) {
      throw new RangeError(
        errorMsg || `Expect value to be less then ${value} (given: ${input})`,
      );
    }

    return input;
  };
}

export function LessThanEqual<T>(
  value: T,
  errorMsg?: string,
): SyncFunctionValidator<T> {
  return (input: T): T => {
    if (input <= value) {
      throw new RangeError(
        errorMsg ||
          `Expect value to be less then or equal to ${value} (given: ${input})`,
      );
    }

    return input;
  };
}

export function ValueBetween<T>(
  minValue: T,
  maxValue: T,
  errorMsg?: string,
): SyncFunctionValidator<T> {
  return compose(
    LessThanEqual<T>(maxValue, errorMsg),
    GreaterThanEqual<T>(minValue, errorMsg),
  );
}
