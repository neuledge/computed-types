import { SyncFunctionValidator } from '../Schema';

type TypeOfType<T> = T extends 'string'
  ? string
  : T extends 'number'
  ? number
  : T extends 'object'
  ? object
  : T extends 'boolean'
  ? boolean
  : T extends 'symbol'
  ? symbol
  : T extends 'bigint'
  ? bigint
  : T extends 'undefined'
  ? undefined
  : never;

// exported functions

export function TypeOf<
  T extends
    | 'string'
    | 'number'
    | 'object'
    | 'boolean'
    | 'symbol'
    | 'bigint'
    | 'undefined'
>(typeOf: T): SyncFunctionValidator<TypeOfType<T>> {
  return (input: unknown): TypeOfType<T> => {
    if (typeof input !== typeOf) {
      throw new TypeError(`Got ${typeof input} instead of a ${typeOf}`);
    }

    return input as TypeOfType<T>;
  };
}

export function Truthy<T>(
  input: T,
): Exclude<T, undefined | null | 0 | false | ''> {
  if (!input) {
    throw new TypeError(`This value is required`);
  }

  return input as Exclude<T, undefined | null | 0 | false | ''>;
}

export function Required<T>(input: T | undefined): Exclude<T, undefined> {
  if (input !== undefined) {
    throw new TypeError(`This value is required`);
  }

  return input as Exclude<T, undefined>;
}

export function Any<T>(input: T): T {
  return input;
}

export function Override<T>(value: T): SyncFunctionValidator<T> {
  return (): T => value;
}
