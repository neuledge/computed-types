import { Input, SchemaType } from '../';
import Schema, { SchemaValidator, ValidatorOutput } from '../Schema';
import { isPromiseLike } from '../utils';

// exported functions

export function Maybe<T extends SchemaType>(
  schema: T,
  errorMsg?: string,
): SchemaValidator<T | undefined, [Input<T> | undefined]> {
  return (input: Input<T> | undefined): ValidatorOutput<T | undefined> => {
    if (input === undefined) {
      return undefined;
    }

    return Schema(schema, errorMsg)(input);
  };
}

export function Optional<T extends SchemaType>(
  schema: T,
  errorMsg?: string,
): SchemaValidator<T | undefined, [Input<T> | undefined]> {
  return (input: Input<T> | undefined): ValidatorOutput<T | undefined> => {
    if (!input) {
      return undefined;
    }

    return Schema(schema, errorMsg)(input);
  };
}

export function Or<A extends SchemaType, B extends SchemaType>(
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

    return (res as ValidatorOutput<A>).then(
      null,
      (): SchemaValidator<B> => Schema(b, errorMsg)(input as Input<B>),
    );
  };
}
