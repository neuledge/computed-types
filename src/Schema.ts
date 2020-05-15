import { ErrorLike } from './schema/errors';
import {
  MergeSchemaParameters,
  SchemaParameters,
  SchemaReturnType,
  SchemaValidatorFunction,
} from './schema/io';
import Validator, { ValidatorProxy } from './Validator';
import compiler from './schema/compiler';
import { either as eitherSchema, merge as mergeSchemas } from './schema/logic';
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
      MergeSchemaParameters<SchemaParameters<A | B>>
    >
  >
>;
function either<A, B, C>(
  ...candidates: [A, B, C]
): ValidatorProxy<
  Validator<
    FunctionType<
      SchemaReturnType<A> | SchemaReturnType<B> | SchemaReturnType<C>,
      MergeSchemaParameters<SchemaParameters<A | B | C>>
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
      MergeSchemaParameters<SchemaParameters<A | B | C | D>>
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
      MergeSchemaParameters<SchemaParameters<A | B | C | D | E>>
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
      MergeSchemaParameters<SchemaParameters<A | B | C | D | E | F>>
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
      MergeSchemaParameters<SchemaParameters<A | B | C | D | E | F | G>>
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
      MergeSchemaParameters<SchemaParameters<A | B | C | D | E | F | G | H>>
    >
  >
>;
function either<A, S>(
  ...candidates: [A, ...S[]]
): ValidatorProxy<
  Validator<
    FunctionType<
      SchemaReturnType<A> | SchemaReturnType<S>,
      MergeSchemaParameters<SchemaParameters<A | S>>
    >
  >
> {
  return new Validator(
    eitherSchema(...(candidates as [unknown])),
  ).proxy() as ValidatorProxy<
    Validator<
      FunctionType<
        SchemaReturnType<A> | SchemaReturnType<S>,
        MergeSchemaParameters<SchemaParameters<A | S>>
      >
    >
  >;
}
Schema.either = either;

function merge<A>(
  ...args: [A]
): ValidatorProxy<
  Validator<FunctionType<SchemaReturnType<A>, SchemaParameters<A>>>
>;
function merge<A, B>(
  ...args: [A, B]
): ValidatorProxy<
  Validator<
    FunctionType<
      SchemaReturnType<A> & SchemaReturnType<B>,
      MergeSchemaParameters<SchemaParameters<A> & SchemaParameters<B>>
    >
  >
>;
function merge<A, B, C>(
  ...args: [A, B, C]
): ValidatorProxy<
  Validator<
    FunctionType<
      SchemaReturnType<A> & SchemaReturnType<B> & SchemaReturnType<C>,
      MergeSchemaParameters<
        SchemaParameters<A> & SchemaParameters<B> & SchemaParameters<C>
      >
    >
  >
>;
function merge<A, B, C, D>(
  ...args: [A, B, C, D]
): ValidatorProxy<
  Validator<
    FunctionType<
      SchemaReturnType<A> &
        SchemaReturnType<B> &
        SchemaReturnType<C> &
        SchemaReturnType<D>,
      MergeSchemaParameters<
        SchemaParameters<A> &
          SchemaParameters<B> &
          SchemaParameters<C> &
          SchemaParameters<D>
      >
    >
  >
>;
function merge<A, B, C, D, E>(
  ...args: [A, B, C, D, E]
): ValidatorProxy<
  Validator<
    FunctionType<
      SchemaReturnType<A> &
        SchemaReturnType<B> &
        SchemaReturnType<C> &
        SchemaReturnType<D> &
        SchemaReturnType<E>,
      MergeSchemaParameters<
        SchemaParameters<A> &
          SchemaParameters<B> &
          SchemaParameters<C> &
          SchemaParameters<D> &
          SchemaParameters<E>
      >
    >
  >
>;
function merge<A, B, C, D, E, F>(
  ...args: [A, B, C, D, E, F]
): ValidatorProxy<
  Validator<
    FunctionType<
      SchemaReturnType<A> &
        SchemaReturnType<B> &
        SchemaReturnType<C> &
        SchemaReturnType<D> &
        SchemaReturnType<E> &
        SchemaReturnType<F>,
      MergeSchemaParameters<
        SchemaParameters<A> &
          SchemaParameters<B> &
          SchemaParameters<C> &
          SchemaParameters<D> &
          SchemaParameters<E> &
          SchemaParameters<F>
      >
    >
  >
>;
// function merge<A, B, C, D, E, F, G>(
//   ...args: [A, B, C, D, E, F, G]
// ): ValidatorProxy<
//   Validator<SchemaValidatorFunction<A & B & C & D & E & F & G>>
// >;
// function merge<A, B, C, D, E, F, G, H>(
//   ...args: [A, B, C, D, E, F, G, H]
// ): ValidatorProxy<
//   Validator<SchemaValidatorFunction<A & B & C & D & E & F & G & H>>
// >;
function merge(
  ...args: [unknown, ...unknown[]]
): ValidatorProxy<Validator<FunctionType>> {
  return new Validator(mergeSchemas(...(args as [unknown]))).proxy();
}

Schema.merge = merge;
