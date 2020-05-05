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
): SyncFunctionValidator<string, [unknown]> {
  return (input): string => {
    const str = ContentString(input);

    if (minLength != null && str.length < minLength) {
      throw toError(
        error ||
          `Expect length to be minimum of ${minLength} characters (actual: ${str.length})`,
      );
    }

    if (maxLength != null && str.length > maxLength) {
      throw toError(
        error ||
          `Expect length to be maximum of ${maxLength} characters (actual: ${str.length})`,
      );
    }

    return str;
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
