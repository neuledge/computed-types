import Schema, {
  SchemaValidator,
  SyncFunctionValidator,
  ValidatorOutput,
} from '../Schema';
import { Input } from '../Type';
import { AnyType, FunctionType, isPromiseLike } from '../utils';
import { ErrorLike, toError } from '../Error';

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

export function Maybe<T>(
  schema: T,
  error?: ErrorLike,
): SchemaValidator<T | undefined, [Input<T>?]> {
  return (input?: Input<T>): ValidatorOutput<T | undefined> => {
    if (input === undefined) {
      return undefined;
    }

    return Schema(schema, error)(input);
  };
}

export function Optional<T>(
  schema: T,
  error?: ErrorLike,
): SchemaValidator<T | undefined, [Input<T>?]> {
  return (input?: Input<T> | null): ValidatorOutput<T | undefined> => {
    if (input == null) {
      return undefined;
    }

    return Schema(schema, error)(input);
  };
}

export function Default<T, V>(
  schema: T,
  defaultValue: V,
  error?: ErrorLike,
): FunctionType<ValidatorOutput<T> | V, [Input<T>?]> {
  return (input?: Input<T>): ValidatorOutput<T> | V => {
    if (input === undefined) {
      return defaultValue;
    }

    return Schema(schema, error)(input);
  };
}

export function Required<T>(
  schema: T,
  error?: ErrorLike,
): SchemaValidator<T, [Exclude<Input<T>, undefined>]> {
  return (input: Exclude<Input<T>, undefined>): ValidatorOutput<T> => {
    if (input === undefined) {
      throw toError(error || 'This value is required');
    }

    return Schema(schema, error)((input as unknown) as Input<T>);
  };
}

export function Truthy<
  T extends Exclude<AnyType, undefined | null | 0 | false | ''>
>(input: T, error?: ErrorLike): T {
  if (!input) {
    throw toError(error || `This value is required`);
  }

  return input;
}

export function Or<A>(a: A): SchemaValidator<A, [Input<A>]>;

export function Or<A, B>(
  a: A,
  b: B,
): SchemaValidator<A | B, [Input<A> | Input<B>]>;

export function Or<A, B, C>(
  a: A,
  b: B,
  c: C,
): SchemaValidator<A | B | C, [Input<A> | Input<B> | Input<C>]>;

export function Or<A, B, C, D>(
  a: A,
  b: B,
  c: C,
  d: D,
): SchemaValidator<A | B | C | D, [Input<A> | Input<B> | Input<C> | Input<D>]>;

export function Or<A, B, C, D, E>(
  a: A,
  b: B,
  c: C,
  d: D,
  e: E,
): SchemaValidator<
  A | B | C | D | E,
  [Input<A> | Input<B> | Input<C> | Input<D> | Input<E>]
>;

export function Or<A, B, C, D, E, F>(
  a: A,
  b: B,
  c: C,
  d: D,
  e: E,
  f: F,
): SchemaValidator<
  A | B | C | D | E | F,
  [Input<A> | Input<B> | Input<C> | Input<D> | Input<E> | Input<F>]
>;

export function Or<A, B, C, D, E, F, H>(
  a: A,
  b: B,
  c: C,
  d: D,
  e: E,
  f: F,
  h: H,
): SchemaValidator<
  A | B | C | D | E | F | H,
  [Input<A> | Input<B> | Input<C> | Input<D> | Input<E> | Input<F> | Input<H>]
>;

export function Or<A, B, C, D, E, F, H, J>(
  a: A,
  b: B,
  c: C,
  d: D,
  e: E,
  f: F,
  h: H,
  j: J,
): SchemaValidator<
  A | B | C | D | E | F | H | J,
  [
    | Input<A>
    | Input<B>
    | Input<C>
    | Input<D>
    | Input<E>
    | Input<F>
    | Input<H>
    | Input<J>,
  ]
>;

export function Or(
  ...candidates: AnyType[]
): SchemaValidator<AnyType, [AnyType?]> {
  if (!candidates.length) {
    throw new RangeError(`Expecting at least one candidate`);
  }

  return (input?: AnyType): ValidatorOutput<AnyType> => {
    let i = 0;

    const next = (): AnyType => {
      const curr = candidates[i++];

      let res;
      try {
        res = Schema(curr)(input);
      } catch (e) {
        if (i >= candidates.length) {
          throw e;
        }

        return next();
      }

      if (!isPromiseLike(res) || i >= candidates.length) {
        return res;
      }

      return res.then(null, () => next());
    };

    return next();
  };
}

export function TypeOf<
  T extends
    | 'string'
    | 'number'
    | 'object'
    | 'boolean'
    | 'symbol'
    | 'bigint'
    | 'undefined'
>(typeOf: T, error?: ErrorLike): SyncFunctionValidator<TypeOfType<T>> {
  return (input: unknown): TypeOfType<T> => {
    if (typeof input !== typeOf) {
      throw toError(error || `Got ${typeof input} instead of a ${typeOf}`);
    }

    return input as TypeOfType<T>;
  };
}

export function Any<T>(input: T): T {
  return input;
}

export function Override<T>(value: T): SyncFunctionValidator<T, [unknown?]> {
  return (): T => value;
}
