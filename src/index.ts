import unknown from './unknown.ts';
import object from './object.ts';
import array from './array.ts';
import string from './string.ts';
import number from './number.ts';
import boolean from './boolean.ts';
import Schema from './Schema.ts';
import {
  SchemaResolveType,
  SchemaParameters,
  MergeSchemaParameters,
  SchemaReturnType,
  SchemaValidatorFunction,
} from './schema/io.ts';
import { ValidationError, PathError } from './schema/errors.ts';
import { isPromiseLike, ResolvedValue } from './schema/utils.ts';

// type generator
export type Type<S> = SchemaResolveType<S>;

// type helpers
export {
  ValidationError,
  PathError,
  SchemaParameters,
  MergeSchemaParameters,
  SchemaReturnType,
  SchemaValidatorFunction,
  ResolvedValue,
};

// runtime schema
export default Schema;

// runtime types
export { unknown, object, array, string, number, boolean };

// runtime helpers
export { isPromiseLike };
