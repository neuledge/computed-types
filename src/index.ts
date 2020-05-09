import unknown from './unknown';
import object from './object';
import string from './string';
import number from './number';
import boolean from './boolean';
import { ErrorLike } from './schema/errors';
import { SchemaParameters, SchemaValidatorFunction } from './schema/io';
import Validator, { ValidatorProxy } from './Validator';
import compiler from './schema/compiler';
// import { either } from './schema/logic';
// import FunctionType from './schema/FunctionType';

export { unknown, object, string, number, boolean };

export default function Schema<S>(
  schema: S,
  error?: ErrorLike<SchemaParameters<S>>,
): ValidatorProxy<Validator<SchemaValidatorFunction<S>>> {
  return new Validator(compiler(schema, error)).proxy();
}

// function Either<A>(a: A): ValidatorProxy<Validator<SchemaValidatorFunction<A>>>;
// function Either<A, B>(
//   a: A,
//   b: B,
// ): ValidatorProxy<Validator<SchemaValidatorFunction<A | B>>>;
// function Either(
//   ...candidates: [unknown, ...unknown[]]
// ): ValidatorProxy<Validator<FunctionType<unknown, unknown[]>>> {
//   return new Validator(either(...candidates)).proxy();
// }
//
// Schema.either = Either;
