import { Input, Schema } from '../';
import Validate, { SchemaValidator, ValidatorOutput } from '../Validate';
import { isPromiseLike } from '../utils';

// exported functions

export function Maybe<T extends Schema>(
  schema: T,
  errorMsg?: string,
): SchemaValidator<T | undefined, [Input<T> | undefined]> {
  return (input: Input<T> | undefined): ValidatorOutput<T | undefined> => {
    if (input === undefined) {
      return undefined;
    }

    return Validate(schema, errorMsg)(input);
  };
}

export function Or<A extends Schema, B extends Schema>(
  a: A,
  b: B,
  errorMsg?: string,
): SchemaValidator<A | B, [Input<A> | Input<B>]> {
  return (input: Input<A> | Input<B>): ValidatorOutput<A | B> => {
    let res;

    try {
      res = Validate(a, errorMsg)(input as Input<A>);
    } catch (e) {
      return Validate(b, errorMsg)(input as Input<B>);
    }

    if (!isPromiseLike(res)) {
      return res;
    }

    return (res as ValidatorOutput<A>).then(
      null,
      (): SchemaValidator<B> => Validate(b, errorMsg)(input as Input<B>),
    );
  };
}
