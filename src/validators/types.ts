import { SyncFunctionValidator } from '../Schema';
import { AnyType } from '../utils';

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

export function Truthy<
  T extends Exclude<AnyType, undefined | null | 0 | false | ''>
>(input: T): T {
  if (!input) {
    throw new TypeError(`This value is required`);
  }

  return input as Exclude<T, undefined | null | 0 | false | ''>;
}

export function Required<T extends Exclude<AnyType, undefined>>(input: T): T {
  if (input === undefined) {
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
