import { ErrorLike } from './schema/errors';
import {
  SchemaParameters,
  SchemaReturnType,
  SchemaValidatorFunction,
} from './schema/io';
import Validator, { ValidatorProxy } from './Validator';
import compiler from './schema/compiler';
import {
  either as eitherSchema,
  optional as optionalSchema,
  merge as mergeSchemas,
} from './schema/logic';
import FunctionType from './schema/FunctionType';

export default function Schema<S>(
  schema: S,
  error?: ErrorLike<SchemaParameters<S>>,
): ValidatorProxy<Validator<SchemaValidatorFunction<S>>> {
  return new Validator(compiler(schema, error)).proxy();
}

function either<A>(
  ...candidates: [A]
): ValidatorProxy<
  Validator<FunctionType<SchemaReturnType<A>, SchemaParameters<A>>>
>;
function either<A, B>(
  ...candidates: [A, B]
): ValidatorProxy<
  Validator<
    FunctionType<
      SchemaReturnType<A> | SchemaReturnType<B>,
      SchemaParameters<A | B>
    >
  >
>;
function either<A, B, C>(
  ...candidates: [A, B, C]
): ValidatorProxy<
  Validator<
    FunctionType<
      SchemaReturnType<A> | SchemaReturnType<B> | SchemaReturnType<C>,
      SchemaParameters<A | B | C>
    >
  >
>;
function either<A, B, C, D>(
  ...candidates: [A, B, C, D]
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
  ...candidates: [A, B, C, D, E]
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
  ...candidates: [A, B, C, D, E, F]
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
  ...candidates: [A, B, C, D, E, F, G]
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
  ...candidates: [A, B, C, D, E, F, G, H]
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
  return new Validator(
    eitherSchema(...(candidates as [unknown])),
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

Schema.optional = function optional<S>(
  schema: S,
  error?: ErrorLike<SchemaParameters<S>>,
): ValidatorProxy<
  Validator<
    FunctionType<
      SchemaReturnType<S> | undefined,
      SchemaParameters<S, [undefined?]>
    >
  >
> {
  return new Validator(optionalSchema(schema, error)).proxy();
};

function merge<A>(
  ...args: [A]
): ValidatorProxy<Validator<SchemaValidatorFunction<A>>>;
function merge<A, B>(
  ...args: [A, B]
): ValidatorProxy<Validator<SchemaValidatorFunction<A & B>>>;
function merge<A, B, C>(
  ...args: [A, B, C]
): ValidatorProxy<Validator<SchemaValidatorFunction<A & B & C>>>;
function merge<A, B, C, D>(
  ...args: [A, B, C, D]
): ValidatorProxy<Validator<SchemaValidatorFunction<A & B & C & D>>>;
function merge<A, B, C, D, E>(
  ...args: [A, B, C, D, E]
): ValidatorProxy<Validator<SchemaValidatorFunction<A & B & C & D & E>>>;
function merge<A, B, C, D, E, F>(
  ...args: [A, B, C, D, E, F]
): ValidatorProxy<Validator<SchemaValidatorFunction<A & B & C & D & E & F>>>;
function merge<A, B, C, D, E, F, G>(
  ...args: [A, B, C, D, E, F, G]
): ValidatorProxy<
  Validator<SchemaValidatorFunction<A & B & C & D & E & F & G>>
>;
function merge<A, B, C, D, E, F, G, H>(
  ...args: [A, B, C, D, E, F, G, H]
): ValidatorProxy<
  Validator<SchemaValidatorFunction<A & B & C & D & E & F & G & H>>
>;
function merge(
  ...args: [unknown, ...unknown[]]
): ValidatorProxy<Validator<FunctionType>> {
  return new Validator(mergeSchemas(...(args as [unknown]))).proxy();
}

Schema.merge = merge;
