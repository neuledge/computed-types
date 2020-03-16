import { SyncFunctionValidator } from '../Schema';
import { ErrorLike, toError } from '../Error';

// exported functions

export function ContentString(input: unknown): string {
  if (
    input == null ||
    (typeof input === 'object' &&
      (input as object).toString === Object.prototype.toString)
  ) {
    throw new TypeError(`Expect value to be string`);
  }

  const value = String(input);
  if (value.match(/^\s*$/)) {
    throw new TypeError(`Expect value to be a non-empty string`);
  }

  return value;
}

export function TrimString(input: unknown): string {
  return ContentString(input).trim();
}

export function StringRange(
  minLength: number | null,
  maxLength: number | null,
  error?: ErrorLike,
): SyncFunctionValidator<string, [string]> {
  return (input): string => {
    if (input.length < (minLength as number)) {
      throw toError(
        error ||
          `Expect length to be minimum of ${minLength} characters (actual: ${input.length})`,
      );
    }

    if (input.length > (maxLength as number)) {
      throw toError(
        error ||
          `Expect length to be maximum of ${maxLength} characters (actual: ${input.length})`,
      );
    }

    return input;
  };
}

export function StringMatch(
  regex: RegExp,
  error?: string | Error,
): SyncFunctionValidator<string, [unknown]> {
  return (input: unknown): string => {
    if (typeof input === 'string' && regex.test(input)) {
      return input;
    }

    throw toError(error || 'Regular expression not match');
  };
}
