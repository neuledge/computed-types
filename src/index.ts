import unknown from './unknown';
import object from './object';
import string from './string';
import number from './number';
import boolean from './boolean';
import { ErrorLike } from './schema/errors';
import {
  SchemaParameters,
  SchemaReturnType,
  SchemaValidatorFunction,
} from './schema/io';
import Validator, { ValidatorProxy } from './Validator';
import compiler from './schema/compiler';
import { either as eitherFn } from './schema/logic';
import FunctionType from './schema/FunctionType';

export { unknown, object, string, number, boolean };

export default function Schema<S>(
  schema: S,
  error?: ErrorLike<SchemaParameters<S>>,
): ValidatorProxy<Validator<SchemaValidatorFunction<S>>> {
  return new Validator(compiler(schema, error)).proxy();
}

function either<A>(
  a: A,
): ValidatorProxy<
  Validator<FunctionType<SchemaReturnType<A>, SchemaParameters<A>>>
>;
function either<A, B>(
  a: A,
  b: B,
): ValidatorProxy<
  Validator<
    FunctionType<
      SchemaReturnType<A> | SchemaReturnType<B>,
      SchemaParameters<A | B>
    >
  >
>;
function either<A, B, C>(
  a: A,
  b: B,
  c: C,
): ValidatorProxy<
  Validator<
    FunctionType<
      SchemaReturnType<A> | SchemaReturnType<B> | SchemaReturnType<C>,
      SchemaParameters<A | B | C>
    >
  >
>;
function either<A, B, C, D>(
  a: A,
  b: B,
  c: C,
  d: D,
): ValidatorProxy<
  Validator<
    FunctionType<
      | SchemaReturnType<A>
      | SchemaReturnType<B>
      | SchemaReturnType<C>
      | SchemaReturnType<D>,
      SchemaParameters<A | B | C | D>
    >
  >
>;
function either<A, B, C, D, E>(
  a: A,
  b: B,
  c: C,
  d: D,
  e: E,
): ValidatorProxy<
  Validator<
    FunctionType<
      | SchemaReturnType<A>
      | SchemaReturnType<B>
      | SchemaReturnType<C>
      | SchemaReturnType<D>
      | SchemaReturnType<E>,
      SchemaParameters<A | B | C | D | E>
    >
  >
>;
function either<A, B, C, D, E, F>(
  a: A,
  b: B,
  c: C,
  d: D,
  e: E,
  f: F,
): ValidatorProxy<
  Validator<
    FunctionType<
      | SchemaReturnType<A>
      | SchemaReturnType<B>
      | SchemaReturnType<C>
      | SchemaReturnType<D>
      | SchemaReturnType<E>
      | SchemaReturnType<F>,
      SchemaParameters<A | B | C | D | E | F>
    >
  >
>;
function either<A, B, C, D, E, F, G>(
  a: A,
  b: B,
  c: C,
  d: D,
  e: E,
  f: F,
  g: G,
): ValidatorProxy<
  Validator<
    FunctionType<
      | SchemaReturnType<A>
      | SchemaReturnType<B>
      | SchemaReturnType<C>
      | SchemaReturnType<D>
      | SchemaReturnType<E>
      | SchemaReturnType<F>
      | SchemaReturnType<G>,
      SchemaParameters<A | B | C | D | E | F | G>
    >
  >
>;
function either<A, B, C, D, E, F, G, H>(
  a: A,
  b: B,
  c: C,
  d: D,
  e: E,
  f: F,
  g: G,
  h: H,
): ValidatorProxy<
  Validator<
    FunctionType<
      | SchemaReturnType<A>
      | SchemaReturnType<B>
      | SchemaReturnType<C>
      | SchemaReturnType<D>
      | SchemaReturnType<E>
      | SchemaReturnType<F>
      | SchemaReturnType<G>
      | SchemaReturnType<H>,
      SchemaParameters<A | B | C | D | E | F | G | H>
    >
  >
>;
function either<A, S>(
  ...candidates: [A, ...S[]]
): ValidatorProxy<
  Validator<
    FunctionType<
      SchemaReturnType<A> | SchemaReturnType<S>,
      SchemaParameters<A | S>
    >
  >
> {
  const validators = candidates.map((schema) => compiler(schema));

  return new Validator(
    eitherFn(...(validators as [unknown])),
  ).proxy() as ValidatorProxy<
    Validator<
      FunctionType<
        SchemaReturnType<A> | SchemaReturnType<S>,
        SchemaParameters<A | S>
      >
    >
  >;
}
Schema.either = either;

// TODO Schema.optional

// TODO Validator.concat

// TODO array
// TODO array.of
// TODO array.min
// TODO array.max
// TODO array.between
