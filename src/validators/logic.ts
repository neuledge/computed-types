import Schema, { SchemaValidator, ValidatorOutput } from '../Schema';
import { Input } from '../Type';
import { isPromiseLike } from '../utils';

// exported functions

export function Maybe<T>(
  schema: T,
  errorMsg?: string,
): SchemaValidator<T | undefined, [Input<T>?]> {
  return (input?: Input<T>): ValidatorOutput<T | undefined> => {
    if (input === undefined) {
      return undefined;
    }

    return Schema(schema, errorMsg)(input);
  };
}

export function Optional<T>(
  schema: T,
  errorMsg?: string,
): SchemaValidator<T | undefined, [Input<T>?]> {
  return (input?: Input<T>): ValidatorOutput<T | undefined> => {
    if (!input) {
      return undefined;
    }

    return Schema(schema, errorMsg)(input);
  };
}

export function Or<A, B>(
  a: A,
  b: B,
  errorMsg?: string,
): SchemaValidator<A | B, [Input<A> | Input<B>]> {
  return (input: Input<A> | Input<B>): ValidatorOutput<A | B> => {
    let res;

    try {
      res = Schema(a, errorMsg)(input as Input<A>);
    } catch (e) {
      return Schema(b, errorMsg)(input as Input<B>);
    }

    if (!isPromiseLike(res)) {
      return res;
    }

    return (res as ValidatorOutput<A>).then(null, () => Schema(b, errorMsg));
  };
}
