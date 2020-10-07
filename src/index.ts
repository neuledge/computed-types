import unknown from './unknown';
import object from './object';
import array from './array';
import string from './string';
import number from './number';
import boolean from './boolean';
import Schema from './Schema';
import {
  SchemaResolveType,
  SchemaParameters,
  MergeSchemaParameters,
  SchemaReturnType,
  SchemaValidatorFunction,
} from './schema/io';
import { ValidationError, PathError } from './schema/errors';
import { isPromiseLike, ResolvedValue } from './schema/utils';

// type generator
export type Type<S> = SchemaResolveType<S>;
export type InputType<S> = SchemaParameters<S>;

// type helpers
export type {
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
